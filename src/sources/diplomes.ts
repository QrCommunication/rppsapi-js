import type { DiplomeEtAutorisation, TabularRow } from '../types.js';
import { buildTabularUrl, codeLabel, fetchAllTabularPages, str } from '../utils.js';

/** Resource ID sur data.gouv.fr : ps-libreacces-dipl-autexerc.txt */
const RESOURCE_ID = '41ae70ac-90c8-4c4e-8644-4ef1b100f045';
const FILTER_COLUMN = 'Identifiant PP';

function mapDiplomeEtAutorisation(row: TabularRow): DiplomeEtAutorisation {
  const hasDiplome = str(row, 'Code diplôme obtenu') !== '';
  const hasAutorisation = str(row, 'Code type autorisation') !== '';

  return {
    diplome: hasDiplome
      ? {
          typeDiplome: codeLabel(row, 'Code type diplôme obtenu', 'Libellé type diplôme obtenu'),
          diplome: codeLabel(row, 'Code diplôme obtenu', 'Libellé diplôme obtenu'),
        }
      : null,
    autorisation: hasAutorisation
      ? {
          typeAutorisation: codeLabel(row, 'Code type autorisation', 'Libellé type autorisation'),
          disciplineAutorisation: codeLabel(
            row,
            'Code discipline autorisation',
            'Libellé discipline autorisation',
          ),
        }
      : null,
  };
}

export async function fetchDiplomes(
  rpps: string,
  options: { baseUrl?: string; timeout?: number; pageSize?: number; headers?: Record<string, string> } = {},
): Promise<DiplomeEtAutorisation[]> {
  const baseUrl = options.baseUrl ?? 'https://tabular-api.data.gouv.fr/api/resources';
  const url = buildTabularUrl(baseUrl, RESOURCE_ID, FILTER_COLUMN, rpps, options.pageSize ?? 100);
  const rows = await fetchAllTabularPages(url, {
    timeout: options.timeout,
    headers: options.headers,
  });

  return rows.map(mapDiplomeEtAutorisation);
}
