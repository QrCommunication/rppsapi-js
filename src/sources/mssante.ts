import type { MessagerieMssante, TabularRow } from '../types.js';
import { buildTabularUrl, codeLabel, fetchAllTabularPages, str } from '../utils.js';

/** Resource ID sur data.gouv.fr : extraction-correspondance-mssante.txt */
const RESOURCE_ID = 'afe01105-d9a1-41fe-921f-e40ea48b2ba6';
const FILTER_COLUMN = 'Identifiant PP';

function mapMssante(row: TabularRow): MessagerieMssante {
  const dematRaw = row['Dématérialisation'];
  const dematerialisation =
    dematRaw === true || dematRaw === 'True' || dematRaw === 'true' || dematRaw === '1';

  return {
    typeBal: str(row, 'Type de BAL'),
    adresseBal: str(row, 'Adresse BAL'),
    dematerialisation,
    savoirFaire: codeLabel(row, 'Code savoir-faire', 'Libellé savoir-faire'),
    structure: {
      identifiant: str(row, 'Identification Structure'),
      typeIdentifiant: str(row, 'Type identifiant structure'),
      serviceRattachement: str(row, 'Service de rattachement'),
      raisonSociale: str(row, 'Raison Sociale structure BAL'),
      enseigneCommerciale: str(row, 'Enseigne commerciale structure BAL'),
      adresse: {
        complementLocalisation: str(row, 'L2COMPLEMENTLOCALISATION structure BAL'),
        complementDistribution: str(row, 'L3COMPLEMENTDISTRIBUTION structure BAL'),
        numeroVoie: str(row, 'L4NUMEROVOIE structure BAL'),
        complementNumeroVoie: str(row, 'L4COMPLEMENTNUMEROVOIE structure BAL'),
        typeVoie: str(row, 'NL4TYPEVOIE structure BAL'),
        libelleVoie: str(row, 'L4LIBELLEVOIE structure BAL'),
        lieuDit: str(row, 'L5LIEUDITMENTION structure BAL'),
        ligneAcheminement: str(row, 'L6LIGNEACHEMINEMENT structure BAL'),
        codePostal: str(row, 'Code postal structure BAL'),
        departement: str(row, 'Département structure BAL'),
        pays: str(row, 'Pays structure BAL'),
      },
    },
  };
}

export async function fetchMssante(
  rpps: string,
  options: { baseUrl?: string; timeout?: number; pageSize?: number; headers?: Record<string, string> } = {},
): Promise<MessagerieMssante[]> {
  const baseUrl = options.baseUrl ?? 'https://tabular-api.data.gouv.fr/api/resources';
  const url = buildTabularUrl(baseUrl, RESOURCE_ID, FILTER_COLUMN, rpps, options.pageSize ?? 100);
  const rows = await fetchAllTabularPages(url, {
    timeout: options.timeout,
    headers: options.headers,
  });

  // Filtrer les BAL personnelles (PER) — les organisationnelles n'ont pas d'Identifiant PP
  return rows.map(mapMssante);
}
