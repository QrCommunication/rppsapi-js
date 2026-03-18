// ─────────────────────────────────────────────────────────────
// SDK RPPS — Types
// Sources : API FHIR Annuaire Santé + data.gouv.fr Tabular API
// ─────────────────────────────────────────────────────────────

/** Paire code / libellé, omniprésente dans les données RPPS */
export interface CodeLabel {
  code: string;
  libelle: string;
}

// ──────────────── Identité ────────────────

export interface Identite {
  civilite: CodeLabel;
  civiliteExercice: CodeLabel;
  nomExercice: string;
  prenomExercice: string;
}

// ──────────────── Profession ────────────────

export interface Profession {
  code: string;
  libelle: string;
  categorie: CodeLabel;
}

// ──────────────── Activité (structure d'exercice) ────────────────

export interface AdresseStructure {
  complementDestinataire: string;
  complementPointGeographique: string;
  numeroVoie: string;
  indiceRepetitionVoie: string;
  codeTypeVoie: string;
  libelleTypeVoie: string;
  libelleVoie: string;
  mentionDistribution: string;
  bureauCedex: string;
  codePostal: string;
  codeCommune: string;
  libelleCommune: string;
  codePays: string;
  libellePays: string;
}

export interface Structure {
  identifiantTechnique: string;
  raisonSociale: string;
  enseigneCommerciale: string;
  numeroSiret: string;
  numeroSiren: string;
  numeroFinessSite: string;
  numeroFinessEtablissementJuridique: string;
  telephone: string;
  telephone2: string;
  telecopie: string;
  email: string;
  codeDepartement: string;
  libelleDepartement: string;
  ancienIdentifiant: string;
  adresse: AdresseStructure;
}

export interface Activite {
  modeExercice: CodeLabel;
  savoirFaire: CodeLabel;
  typeSavoirFaire: CodeLabel;
  secteurActivite: CodeLabel;
  sectionTableauPharmaciens: CodeLabel;
  role: CodeLabel;
  genreActivite: CodeLabel;
  autoriteEnregistrement: string;
  structure: Structure;
}

// ──────────────── Diplômes & Autorisations ────────────────

export interface Diplome {
  typeDiplome: CodeLabel;
  diplome: CodeLabel;
}

export interface Autorisation {
  typeAutorisation: CodeLabel;
  disciplineAutorisation: CodeLabel;
}

export interface DiplomeEtAutorisation {
  diplome: Diplome | null;
  autorisation: Autorisation | null;
}

// ──────────────── Savoir-faire ────────────────

export interface SavoirFaire {
  profession: CodeLabel;
  categorieProfessionnelle: CodeLabel;
  typeSavoirFaire: CodeLabel;
  savoirFaire: CodeLabel;
}

// ──────────────── Carte CPS / CPF ────────────────

export interface CarteCps {
  typeCarte: CodeLabel;
  numeroCarte: string;
  identifiantNationalCarte: string;
  dateDebutValidite: string;
  dateFinValidite: string;
  dateOpposition: string;
  dateMiseAJour: string;
}

// ──────────────── Messagerie MSSanté ────────────────

export interface MessagerieMssante {
  typeBal: string;
  adresseBal: string;
  dematerialisation: boolean;
  savoirFaire: CodeLabel;
  structure: {
    identifiant: string;
    typeIdentifiant: string;
    serviceRattachement: string;
    raisonSociale: string;
    enseigneCommerciale: string;
    adresse: {
      complementLocalisation: string;
      complementDistribution: string;
      numeroVoie: string;
      complementNumeroVoie: string;
      typeVoie: string;
      libelleVoie: string;
      lieuDit: string;
      ligneAcheminement: string;
      codePostal: string;
      departement: string;
      pays: string;
    };
  };
}

// ──────────────── FHIR (structures simplifiées) ────────────────

export interface FhirIdentifier {
  system?: string;
  value?: string;
  type?: { coding?: Array<{ system?: string; code?: string }> };
}

export interface FhirHumanName {
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  use?: string;
}

export interface FhirQualification {
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  identifier?: FhirIdentifier[];
}

export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  identifier?: FhirIdentifier[];
  active?: boolean;
  name?: FhirHumanName[];
  telecom?: Array<{ system?: string; value?: string; use?: string }>;
  qualification?: FhirQualification[];
  [key: string]: unknown;
}

export interface FhirPractitionerRole {
  resourceType: 'PractitionerRole';
  id?: string;
  practitioner?: { reference?: string };
  organization?: { reference?: string; display?: string };
  code?: Array<{ coding?: Array<{ system?: string; code?: string; display?: string }> }>;
  specialty?: Array<{ coding?: Array<{ system?: string; code?: string; display?: string }> }>;
  location?: Array<{ reference?: string; display?: string }>;
  [key: string]: unknown;
}

export interface FhirBundle<T = unknown> {
  resourceType: 'Bundle';
  type?: string;
  total?: number;
  entry?: Array<{
    fullUrl?: string;
    resource?: T;
  }>;
}

export interface FhirData {
  practitioner: FhirPractitioner | null;
  practitionerRoles: FhirPractitionerRole[];
}

// ──────────────── Métadonnées de la requête ────────────────

export type SourceName =
  | 'fhir'
  | 'personne-activite'
  | 'diplomes'
  | 'savoir-faire'
  | 'carte-cps'
  | 'mssante';

export interface SourceStatus {
  source: SourceName;
  success: boolean;
  rowCount: number;
  durationMs: number;
  error?: string;
}

// ──────────────── Résultat complet ────────────────

export interface RppsFullProfile {
  /** Numéro RPPS (11 chiffres) */
  rpps: string;

  /** Identification nationale PP (préfixe type + RPPS) */
  identificationNationale: string;

  /** Identité du praticien */
  identite: Identite;

  /** Profession principale */
  profession: Profession;

  /** Activités et structures d'exercice */
  activites: Activite[];

  /** Diplômes et autorisations d'exercice */
  diplomesEtAutorisations: DiplomeEtAutorisation[];

  /** Savoir-faire et compétences */
  savoirFaire: SavoirFaire[];

  /** Cartes CPS / CPF */
  cartesCps: CarteCps[];

  /** Messageries MSSanté (boîtes aux lettres personnelles) */
  messageriesMssante: MessagerieMssante[];

  /** Données FHIR brutes pour usage avancé */
  fhir: FhirData;

  /** Métadonnées sur les sources interrogées */
  metadata: {
    sources: SourceStatus[];
    queriedAt: string;
    totalDurationMs: number;
  };
}

// ──────────────── Recherche ────────────────

/** Critères de recherche — au moins un champ obligatoire */
export interface RppsSearchCriteria {
  /** Nom d'exercice (recherche partielle, insensible à la casse) */
  nom?: string;

  /** Prénom d'exercice (recherche partielle, insensible à la casse) */
  prenom?: string;

  /** Code postal de la structure d'exercice (recherche exacte ou partielle) */
  codePostal?: string;
}

/** Résumé d'un praticien trouvé par recherche */
export interface RppsSearchResult {
  rpps: string;
  identificationNationale: string;
  civilite: string;
  nomExercice: string;
  prenomExercice: string;
  profession: CodeLabel;
  categorieProfessionnelle: CodeLabel;
  modeExercice: CodeLabel;
  savoirFaire: CodeLabel;
  structure: {
    raisonSociale: string;
    codePostal: string;
    libelleCommune: string;
    departement: string;
  };
}

/** Réponse paginée de recherche */
export interface RppsSearchResponse {
  results: RppsSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  durationMs: number;
  criteria: RppsSearchCriteria;
}

// ──────────────── Configuration du client ────────────────

export interface RppsClientOptions {
  /** URL de base de l'API FHIR (défaut: https://gateway.api.esante.gouv.fr/fhir/v2) */
  fhirBaseUrl?: string;

  /**
   * Clé API FHIR (ESANTE-API-KEY).
   * Obtenue via le portail Gravitee : https://portal.api.esante.gouv.fr
   * Sans cette clé, la source FHIR sera automatiquement désactivée.
   */
  fhirApiKey?: string;

  /** URL de base de l'API Tabular data.gouv.fr (défaut: https://tabular-api.data.gouv.fr/api/resources) */
  tabularBaseUrl?: string;

  /** Timeout en ms pour chaque requête (défaut: 30000) */
  timeout?: number;

  /** Nombre max de lignes par requête tabular (défaut: 100) */
  tabularPageSize?: number;

  /** Désactiver certaines sources */
  disabledSources?: SourceName[];

  /** Headers HTTP supplémentaires */
  headers?: Record<string, string>;
}

// ──────────────── Types internes (raw rows data.gouv) ────────────────

export type TabularRow = Record<string, string | number | boolean | null>;

export interface TabularResponse {
  data: TabularRow[];
  links: {
    next?: string;
    prev?: string;
  };
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
}
