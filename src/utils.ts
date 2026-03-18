import type { TabularResponse } from './types.js';

/** Fetch JSON avec timeout et gestion d'erreurs */
export async function fetchJson<T>(
  url: string,
  options: { timeout?: number; headers?: Record<string, string> } = {},
): Promise<T> {
  const { timeout = 30_000, headers = {} } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} — ${url}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Mesure le temps d'exécution d'une Promise */
export async function timed<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  return { result, durationMs };
}

/** Lit une valeur string depuis une row tabular, retourne '' si null/undefined */
export function str(row: Record<string, unknown>, key: string): string {
  const val = row[key];
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/** Construit un CodeLabel depuis une row tabular */
export function codeLabel(
  row: Record<string, unknown>,
  codeKey: string,
  labelKey: string,
): { code: string; libelle: string } {
  return {
    code: str(row, codeKey),
    libelle: str(row, labelKey),
  };
}

/** Valide un numéro RPPS (11 chiffres) */
export function validateRpps(rpps: string): string {
  const cleaned = rpps.trim();
  if (!/^\d{11}$/.test(cleaned)) {
    throw new Error(
      `Numéro RPPS invalide : "${rpps}". Le RPPS doit contenir exactement 11 chiffres.`,
    );
  }
  return cleaned;
}

/** Construit l'URL pour l'API Tabular data.gouv.fr (filtre unique exact) */
export function buildTabularUrl(
  baseUrl: string,
  resourceId: string,
  filterColumn: string,
  filterValue: string,
  pageSize: number,
): string {
  const params = new URLSearchParams({
    [`${filterColumn}__exact`]: filterValue,
    page_size: String(pageSize),
    page: '1',
  });
  return `${baseUrl}/${resourceId}/data/?${params.toString()}`;
}

/** Filtre Tabular API : colonne + opérateur */
export interface TabularFilter {
  column: string;
  value: string;
  operator: 'exact' | 'contains';
}

/** Construit l'URL pour l'API Tabular avec filtres multiples */
export function buildTabularSearchUrl(
  baseUrl: string,
  resourceId: string,
  filters: TabularFilter[],
  pageSize: number,
  page: number = 1,
): string {
  const params = new URLSearchParams({
    page_size: String(pageSize),
    page: String(page),
  });
  for (const filter of filters) {
    params.set(`${filter.column}__${filter.operator}`, filter.value);
  }
  return `${baseUrl}/${resourceId}/data/?${params.toString()}`;
}

/** Récupère toutes les pages d'une requête Tabular API */
export async function fetchAllTabularPages(
  url: string,
  options: { timeout?: number; headers?: Record<string, string> } = {},
): Promise<TabularResponse['data']> {
  const firstPage = await fetchJson<TabularResponse>(url, options);
  const allData = [...firstPage.data];

  let nextUrl = firstPage.links?.next;
  while (nextUrl) {
    const page = await fetchJson<TabularResponse>(nextUrl, options);
    allData.push(...page.data);
    nextUrl = page.links?.next;
  }

  return allData;
}
