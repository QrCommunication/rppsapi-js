import type {
  Activite,
  AdresseStructure,
  Identite,
  Profession,
  RppsSearchCriteria,
  RppsSearchResult,
  Structure,
  TabularResponse,
  TabularRow,
} from '../types.js';
import {
  buildTabularSearchUrl,
  buildTabularUrl,
  codeLabel,
  fetchAllTabularPages,
  fetchJson,
  str,
  type TabularFilter,
} from '../utils.js';

/** Resource ID sur data.gouv.fr : ps-libreacces-personne-activite.txt */
const RESOURCE_ID = 'fffda7e9-0ea2-4c35-bba0-4496f3af935d';
const FILTER_COLUMN = 'Identifiant PP';

interface PersonneActiviteResult {
  identite: Identite;
  identificationNationale: string;
  profession: Profession;
  activites: Activite[];
}

function mapAdresse(row: TabularRow): AdresseStructure {
  return {
    complementDestinataire: str(row, 'Complément destinataire (coord. structure)'),
    complementPointGeographique: str(row, 'Complément point géographique (coord. structure)'),
    numeroVoie: str(row, 'Numéro Voie (coord. structure)'),
    indiceRepetitionVoie: str(row, 'Indice répétition voie (coord. structure)'),
    codeTypeVoie: str(row, 'Code type de voie (coord. structure)'),
    libelleTypeVoie: str(row, 'Libellé type de voie (coord. structure)'),
    libelleVoie: str(row, 'Libellé Voie (coord. structure)'),
    mentionDistribution: str(row, 'Mention distribution (coord. structure)'),
    bureauCedex: str(row, 'Bureau cedex (coord. structure)'),
    codePostal: str(row, 'Code postal (coord. structure)'),
    codeCommune: str(row, 'Code commune (coord. structure)'),
    libelleCommune: str(row, 'Libellé commune (coord. structure)'),
    codePays: str(row, 'Code pays (coord. structure)'),
    libellePays: str(row, 'Libellé pays (coord. structure)'),
  };
}

function mapStructure(row: TabularRow): Structure {
  return {
    identifiantTechnique: str(row, 'Identifiant technique de la structure'),
    raisonSociale: str(row, 'Raison sociale site'),
    enseigneCommerciale: str(row, 'Enseigne commerciale site'),
    numeroSiret: str(row, 'Numéro SIRET site'),
    numeroSiren: str(row, 'Numéro SIREN site'),
    numeroFinessSite: str(row, 'Numéro FINESS site'),
    numeroFinessEtablissementJuridique: str(row, 'Numéro FINESS établissement juridique'),
    telephone: str(row, 'Téléphone (coord. structure)'),
    telephone2: str(row, 'Téléphone 2 (coord. structure)'),
    telecopie: str(row, 'Télécopie (coord. structure)'),
    email: str(row, 'Adresse e-mail (coord. structure)'),
    codeDepartement: str(row, 'Code Département (structure)'),
    libelleDepartement: str(row, 'Libellé Département (structure)'),
    ancienIdentifiant: str(row, 'Ancien identifiant de la structure'),
    adresse: mapAdresse(row),
  };
}

function mapActivite(row: TabularRow): Activite {
  return {
    modeExercice: codeLabel(row, 'Code mode exercice', 'Libellé mode exercice'),
    savoirFaire: codeLabel(row, 'Code savoir-faire', 'Libellé savoir-faire'),
    typeSavoirFaire: codeLabel(row, 'Code type savoir-faire', 'Libellé type savoir-faire'),
    secteurActivite: codeLabel(row, 'Code secteur d\'activité', 'Libellé secteur d\'activité'),
    sectionTableauPharmaciens: codeLabel(
      row,
      'Code section tableau pharmaciens',
      'Libellé section tableau pharmaciens',
    ),
    role: codeLabel(row, 'Code rôle', 'Libellé rôle'),
    genreActivite: codeLabel(row, 'Code genre activité', 'Libellé genre activité'),
    autoriteEnregistrement: str(row, 'Autorité d\'enregistrement'),
    structure: mapStructure(row),
  };
}

export async function fetchPersonneActivite(
  rpps: string,
  options: { baseUrl?: string; timeout?: number; pageSize?: number; headers?: Record<string, string> } = {},
): Promise<PersonneActiviteResult> {
  const baseUrl = options.baseUrl ?? 'https://tabular-api.data.gouv.fr/api/resources';
  const url = buildTabularUrl(baseUrl, RESOURCE_ID, FILTER_COLUMN, rpps, options.pageSize ?? 100);
  const rows = await fetchAllTabularPages(url, {
    timeout: options.timeout,
    headers: options.headers,
  });

  const firstRow = rows[0];

  const identite: Identite = firstRow
    ? {
        civilite: codeLabel(firstRow, 'Code civilité', 'Libellé civilité'),
        civiliteExercice: codeLabel(
          firstRow,
          'Code civilité d\'exercice',
          'Libellé civilité d\'exercice',
        ),
        nomExercice: str(firstRow, 'Nom d\'exercice'),
        prenomExercice: str(firstRow, 'Prénom d\'exercice'),
      }
    : { civilite: { code: '', libelle: '' }, civiliteExercice: { code: '', libelle: '' }, nomExercice: '', prenomExercice: '' };

  const profession: Profession = firstRow
    ? {
        code: str(firstRow, 'Code profession'),
        libelle: str(firstRow, 'Libellé profession'),
        categorie: codeLabel(
          firstRow,
          'Code catégorie professionnelle',
          'Libellé catégorie professionnelle',
        ),
      }
    : { code: '', libelle: '', categorie: { code: '', libelle: '' } };

  const identificationNationale = firstRow
    ? str(firstRow, 'Identification nationale PP')
    : '';

  // Chaque ligne = une activité (structure d'exercice distincte)
  const activites: Activite[] = rows
    .filter((row) => str(row, 'Identifiant technique de la structure') !== '')
    .map(mapActivite);

  return { identite, identificationNationale, profession, activites };
}

function mapSearchResult(row: TabularRow): RppsSearchResult {
  return {
    rpps: str(row, 'Identifiant PP'),
    identificationNationale: str(row, 'Identification nationale PP'),
    civilite: str(row, 'Libellé civilité d\'exercice'),
    nomExercice: str(row, 'Nom d\'exercice'),
    prenomExercice: str(row, 'Prénom d\'exercice'),
    profession: codeLabel(row, 'Code profession', 'Libellé profession'),
    categorieProfessionnelle: codeLabel(
      row,
      'Code catégorie professionnelle',
      'Libellé catégorie professionnelle',
    ),
    modeExercice: codeLabel(row, 'Code mode exercice', 'Libellé mode exercice'),
    savoirFaire: codeLabel(row, 'Code savoir-faire', 'Libellé savoir-faire'),
    structure: {
      raisonSociale: str(row, 'Raison sociale site'),
      codePostal: str(row, 'Code postal (coord. structure)'),
      libelleCommune: str(row, 'Libellé commune (coord. structure)'),
      departement: str(row, 'Libellé Département (structure)'),
    },
  };
}

/** Déduplique par RPPS en gardant la première occurrence (activité principale) */
function deduplicateByRpps(results: RppsSearchResult[]): RppsSearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.rpps)) return false;
    seen.add(r.rpps);
    return true;
  });
}

export async function searchPersonneActivite(
  criteria: RppsSearchCriteria,
  options: {
    baseUrl?: string;
    timeout?: number;
    pageSize?: number;
    page?: number;
    headers?: Record<string, string>;
  } = {},
): Promise<{ results: RppsSearchResult[]; total: number }> {
  const baseUrl = options.baseUrl ?? 'https://tabular-api.data.gouv.fr/api/resources';
  const pageSize = options.pageSize ?? 100;
  const page = options.page ?? 1;

  const filters: TabularFilter[] = [];

  if (criteria.nom) {
    filters.push({
      column: "Nom d'exercice",
      value: criteria.nom,
      operator: 'contains',
    });
  }

  if (criteria.prenom) {
    filters.push({
      column: "Prénom d'exercice",
      value: criteria.prenom,
      operator: 'contains',
    });
  }

  if (criteria.codePostal) {
    filters.push({
      column: 'Code postal (coord. structure)',
      value: criteria.codePostal,
      operator: criteria.codePostal.length === 5 ? 'exact' : 'contains',
    });
  }

  const url = buildTabularSearchUrl(baseUrl, RESOURCE_ID, filters, pageSize, page);
  const response = await fetchJson<TabularResponse>(url, {
    timeout: options.timeout,
    headers: options.headers,
  });

  const results = deduplicateByRpps(response.data.map(mapSearchResult));
  const total = response.meta?.total ?? results.length;

  return { results, total };
}
