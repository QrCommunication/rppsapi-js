// ─────────────────────────────────────────────────────────────
// SDK RPPS — Annuaire Santé (ANS / data.gouv.fr)
//
// Interroge en une seule requête l'ensemble des sources de
// données RPPS pour obtenir le profil complet d'un praticien.
//
// Sources :
//   - API FHIR Annuaire Santé (gateway.api.esante.gouv.fr)
//   - Personne-Activité (data.gouv.fr Tabular API)
//   - Diplômes & Autorisations (data.gouv.fr Tabular API)
//   - Savoir-faire (data.gouv.fr Tabular API)
//   - Cartes CPS/CPF (data.gouv.fr Tabular API)
//   - Messageries MSSanté (data.gouv.fr Tabular API)
// ─────────────────────────────────────────────────────────────

export { RppsClient } from './client.js';

// Types principaux
export type {
  RppsFullProfile,
  RppsClientOptions,
  Identite,
  Profession,
  Activite,
  Structure,
  AdresseStructure,
  Diplome,
  Autorisation,
  DiplomeEtAutorisation,
  SavoirFaire,
  CarteCps,
  MessagerieMssante,
  CodeLabel,
  SourceName,
  SourceStatus,
  RppsSearchCriteria,
  RppsSearchResult,
  RppsSearchResponse,
} from './types.js';

// Types FHIR
export type {
  FhirData,
  FhirPractitioner,
  FhirPractitionerRole,
  FhirBundle,
  FhirIdentifier,
  FhirHumanName,
  FhirQualification,
} from './types.js';

// Sources individuelles (pour usage avancé)
export { fetchFhirByRpps } from './sources/fhir.js';
export { fetchPersonneActivite, searchPersonneActivite } from './sources/personne-activite.js';
export { fetchDiplomes } from './sources/diplomes.js';
export { fetchSavoirFaire } from './sources/savoir-faire.js';
export { fetchCartesCps } from './sources/carte-cps.js';
export { fetchMssante } from './sources/mssante.js';

// Utilitaires
export { validateRpps } from './utils.js';
