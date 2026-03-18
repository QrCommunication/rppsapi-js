import type { SavoirFaire, TabularRow } from '../types.js';
import { buildTabularUrl, codeLabel, fetchAllTabularPages } from '../utils.js';

/** Resource ID sur data.gouv.fr : ps-libreacces-savoirfaire.txt */
const RESOURCE_ID = 'fb55f15f-bd61-4402-b551-51ef387f2fab';
const FILTER_COLUMN = 'Identifiant PP';

function mapSavoirFaire(row: TabularRow): SavoirFaire {
  return {
    profession: codeLabel(row, 'Code profession', 'Libellé profession'),
    categorieProfessionnelle: codeLabel(
      row,
      'Code catégorie professionnelle',
      'Libellé catégorie professionnelle',
    ),
    typeSavoirFaire: codeLabel(row, 'Code type savoir-faire', 'Libellé type savoir-faire'),
    savoirFaire: codeLabel(row, 'Code savoir-faire', 'Libellé savoir-faire'),
  };
}

export async function fetchSavoirFaire(
  rpps: string,
  options: { baseUrl?: string; timeout?: number; pageSize?: number; headers?: Record<string, string> } = {},
): Promise<SavoirFaire[]> {
  const baseUrl = options.baseUrl ?? 'https://tabular-api.data.gouv.fr/api/resources';
  const url = buildTabularUrl(baseUrl, RESOURCE_ID, FILTER_COLUMN, rpps, options.pageSize ?? 100);
  const rows = await fetchAllTabularPages(url, {
    timeout: options.timeout,
    headers: options.headers,
  });

  return rows.map(mapSavoirFaire);
}
