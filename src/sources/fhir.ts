import type {
  FhirBundle,
  FhirData,
  FhirPractitioner,
  FhirPractitionerRole,
} from '../types.js';
import { fetchJson } from '../utils.js';

const DEFAULT_FHIR_BASE = 'https://gateway.api.esante.gouv.fr/fhir/v2';

interface FhirOptions {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/** Interroge l'API FHIR Annuaire Santé pour un praticien via son RPPS */
export async function fetchFhirByRpps(
  rpps: string,
  options: FhirOptions = {},
): Promise<FhirData> {
  const base = options.baseUrl ?? DEFAULT_FHIR_BASE;
  const fetchOpts = { timeout: options.timeout, headers: options.headers };

  // Requête Practitioner par identifiant RPPS
  const practitionerUrl = `${base}/Practitioner?identifier=${encodeURIComponent(rpps)}&_count=1`;
  const practitionerBundle = await fetchJson<FhirBundle<FhirPractitioner>>(
    practitionerUrl,
    fetchOpts,
  );

  const practitioner = practitionerBundle.entry?.[0]?.resource ?? null;

  // Si trouvé, chercher les PractitionerRole associés
  let practitionerRoles: FhirPractitionerRole[] = [];
  if (practitioner?.id) {
    const roleUrl = `${base}/PractitionerRole?practitioner=${encodeURIComponent(practitioner.id)}&_count=50`;
    const roleBundle = await fetchJson<FhirBundle<FhirPractitionerRole>>(
      roleUrl,
      fetchOpts,
    );
    practitionerRoles =
      roleBundle.entry
        ?.map((e) => e.resource)
        .filter((r): r is FhirPractitionerRole => r !== undefined) ?? [];
  }

  return { practitioner, practitionerRoles };
}
