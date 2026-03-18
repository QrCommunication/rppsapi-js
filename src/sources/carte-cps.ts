import type { CarteCps, TabularRow } from '../types.js';
import { buildTabularUrl, codeLabel, fetchAllTabularPages, str } from '../utils.js';

/** Resource ID sur data.gouv.fr : porteurs-cps-cpf.txt */
const RESOURCE_ID = '210eb05e-564b-42be-994a-d1800b63e9b7';
const FILTER_COLUMN = 'Identifiant PP';

function mapCarteCps(row: TabularRow): CarteCps {
  return {
    typeCarte: codeLabel(row, 'Code type de carte', 'Libellé type de carte'),
    numeroCarte: str(row, 'Numéro carte'),
    identifiantNationalCarte: str(row, 'Identifiant national contenu dans la carte'),
    dateDebutValidite: str(row, 'Date début validité'),
    dateFinValidite: str(row, 'Date fin validité'),
    dateOpposition: str(row, 'Date opposition'),
    dateMiseAJour: str(row, 'Date de mise à jour'),
  };
}

export async function fetchCartesCps(
  rpps: string,
  options: { baseUrl?: string; timeout?: number; pageSize?: number; headers?: Record<string, string> } = {},
): Promise<CarteCps[]> {
  const baseUrl = options.baseUrl ?? 'https://tabular-api.data.gouv.fr/api/resources';
  const url = buildTabularUrl(baseUrl, RESOURCE_ID, FILTER_COLUMN, rpps, options.pageSize ?? 100);
  const rows = await fetchAllTabularPages(url, {
    timeout: options.timeout,
    headers: options.headers,
  });

  return rows.map(mapCarteCps);
}
