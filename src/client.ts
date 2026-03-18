import type {
  RppsClientOptions,
  RppsFullProfile,
  RppsSearchCriteria,
  RppsSearchResponse,
  SourceName,
  SourceStatus,
} from './types.js';
import { timed, validateRpps } from './utils.js';
import { fetchFhirByRpps } from './sources/fhir.js';
import { fetchPersonneActivite, searchPersonneActivite } from './sources/personne-activite.js';
import { fetchDiplomes } from './sources/diplomes.js';
import { fetchSavoirFaire } from './sources/savoir-faire.js';
import { fetchCartesCps } from './sources/carte-cps.js';
import { fetchMssante } from './sources/mssante.js';

interface ResolvedConfig {
  fhirBaseUrl: string;
  fhirApiKey: string;
  tabularBaseUrl: string;
  timeout: number;
  tabularPageSize: number;
  headers: Record<string, string>;
  disabledSources: SourceName[];
}

const DEFAULTS: ResolvedConfig = {
  fhirBaseUrl: 'https://gateway.api.esante.gouv.fr/fhir/v2',
  fhirApiKey: '',
  tabularBaseUrl: 'https://tabular-api.data.gouv.fr/api/resources',
  timeout: 30_000,
  tabularPageSize: 100,
  headers: {},
  disabledSources: [],
};

/**
 * Client SDK pour interroger l'ensemble des sources RPPS.
 *
 * Agrège en une seule requête les données de :
 * - API FHIR Annuaire Santé (ANS)
 * - Fichier personne-activité (data.gouv.fr)
 * - Fichier diplômes/autorisations (data.gouv.fr)
 * - Fichier savoir-faire (data.gouv.fr)
 * - Fichier cartes CPS/CPF (data.gouv.fr)
 * - Fichier MSSanté (data.gouv.fr)
 */
export class RppsClient {
  private readonly config: ResolvedConfig;

  constructor(options: RppsClientOptions = {}) {
    const fhirApiKey = options.fhirApiKey ?? '';
    const disabledSources = [...(options.disabledSources ?? DEFAULTS.disabledSources)];

    // Désactiver automatiquement FHIR si pas de clé API
    if (!fhirApiKey && !disabledSources.includes('fhir')) {
      disabledSources.push('fhir');
    }

    this.config = {
      fhirBaseUrl: options.fhirBaseUrl ?? DEFAULTS.fhirBaseUrl,
      fhirApiKey,
      tabularBaseUrl: options.tabularBaseUrl ?? DEFAULTS.tabularBaseUrl,
      timeout: options.timeout ?? DEFAULTS.timeout,
      tabularPageSize: options.tabularPageSize ?? DEFAULTS.tabularPageSize,
      headers: options.headers ?? DEFAULTS.headers,
      disabledSources,
    };
  }

  private isEnabled(source: SourceName): boolean {
    return !this.config.disabledSources.includes(source);
  }

  private tabularOpts() {
    return {
      baseUrl: this.config.tabularBaseUrl,
      timeout: this.config.timeout,
      pageSize: this.config.tabularPageSize,
      headers: this.config.headers,
    };
  }

  /**
   * Récupère le profil complet d'un praticien à partir de son numéro RPPS.
   * Interroge toutes les sources en parallèle et fusionne les résultats.
   *
   * @param rpps - Numéro RPPS (11 chiffres)
   * @returns Profil complet du praticien avec métadonnées
   * @throws Si le numéro RPPS est invalide
   */
  async getByRpps(rpps: string): Promise<RppsFullProfile> {
    const cleanRpps = validateRpps(rpps);
    const startTime = performance.now();
    const sources: SourceStatus[] = [];

    // Lancer toutes les requêtes en parallèle
    const [
      fhirResult,
      personneActiviteResult,
      diplomesResult,
      savoirFaireResult,
      cartesCpsResult,
      mssanteResult,
    ] = await Promise.all([
      this.safeQuery('fhir', () =>
        fetchFhirByRpps(cleanRpps, {
          baseUrl: this.config.fhirBaseUrl,
          timeout: this.config.timeout,
          headers: {
            ...this.config.headers,
            ...(this.config.fhirApiKey ? { 'ESANTE-API-KEY': this.config.fhirApiKey } : {}),
          },
        }),
      ),
      this.safeQuery('personne-activite', () =>
        fetchPersonneActivite(cleanRpps, this.tabularOpts()),
      ),
      this.safeQuery('diplomes', () =>
        fetchDiplomes(cleanRpps, this.tabularOpts()),
      ),
      this.safeQuery('savoir-faire', () =>
        fetchSavoirFaire(cleanRpps, this.tabularOpts()),
      ),
      this.safeQuery('carte-cps', () =>
        fetchCartesCps(cleanRpps, this.tabularOpts()),
      ),
      this.safeQuery('mssante', () =>
        fetchMssante(cleanRpps, this.tabularOpts()),
      ),
    ]);

    // Collecter les statuts
    sources.push(fhirResult.status);
    sources.push(personneActiviteResult.status);
    sources.push(diplomesResult.status);
    sources.push(savoirFaireResult.status);
    sources.push(cartesCpsResult.status);
    sources.push(mssanteResult.status);

    // Extraire les résultats (avec valeurs par défaut si erreur)
    const fhir = fhirResult.data ?? { practitioner: null, practitionerRoles: [] };
    const personneActivite = personneActiviteResult.data ?? {
      identite: {
        civilite: { code: '', libelle: '' },
        civiliteExercice: { code: '', libelle: '' },
        nomExercice: '',
        prenomExercice: '',
      },
      identificationNationale: '',
      profession: { code: '', libelle: '', categorie: { code: '', libelle: '' } },
      activites: [],
    };
    const diplomes = diplomesResult.data ?? [];
    const savoirFaire = savoirFaireResult.data ?? [];
    const cartesCps = cartesCpsResult.data ?? [];
    const mssante = mssanteResult.data ?? [];

    const totalDurationMs = Math.round(performance.now() - startTime);

    return {
      rpps: cleanRpps,
      identificationNationale: personneActivite.identificationNationale,
      identite: personneActivite.identite,
      profession: personneActivite.profession,
      activites: personneActivite.activites,
      diplomesEtAutorisations: diplomes,
      savoirFaire,
      cartesCps,
      messageriesMssante: mssante,
      fhir,
      metadata: {
        sources,
        queriedAt: new Date().toISOString(),
        totalDurationMs,
      },
    };
  }

  /**
   * Recherche des praticiens par nom, prénom et/ou code postal.
   * Au moins un critère est obligatoire. La recherche est partielle (%valeur%).
   *
   * @param criteria - Critères de recherche (nom, prenom, codePostal)
   * @param options - Options de pagination
   * @returns Liste paginée de résultats
   * @throws Si aucun critère n'est fourni
   */
  async search(
    criteria: RppsSearchCriteria,
    options: { page?: number; pageSize?: number } = {},
  ): Promise<RppsSearchResponse> {
    const { nom, prenom, codePostal } = criteria;

    if (!nom && !prenom && !codePostal) {
      throw new Error(
        'Au moins un critère de recherche est obligatoire (nom, prenom ou codePostal).',
      );
    }

    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? this.config.tabularPageSize;

    const { result, durationMs } = await timed(() =>
      searchPersonneActivite(criteria, {
        baseUrl: this.config.tabularBaseUrl,
        timeout: this.config.timeout,
        pageSize,
        page,
        headers: this.config.headers,
      }),
    );

    return {
      results: result.results,
      total: result.total,
      page,
      pageSize,
      durationMs,
      criteria,
    };
  }

  /** Exécute une requête source avec gestion d'erreur et mesure de temps */
  private async safeQuery<T>(
    source: SourceName,
    fn: () => Promise<T>,
  ): Promise<{ data: T | null; status: SourceStatus }> {
    if (!this.isEnabled(source)) {
      return {
        data: null,
        status: { source, success: true, rowCount: 0, durationMs: 0, error: 'disabled' },
      };
    }

    try {
      const { result, durationMs } = await timed(fn);
      const rowCount = Array.isArray(result) ? result.length : 1;
      return {
        data: result,
        status: { source, success: true, rowCount, durationMs },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        data: null,
        status: { source, success: false, rowCount: 0, durationMs: 0, error: message },
      };
    }
  }
}
