import { DEFAULT_PAGE_SIZE, isPageSize, type PageSize } from './pagination'

/**
 * Bentuk state yang disimpan di query string (FR-4.8).
 * `?route=1,Red&trip=123&page=2&limit=12&vehicle=y1234`
 */
export interface UrlState {
  routes: string[]
  trips: string[]
  page: number
  limit: PageSize
  vehicle: string | null
}

export const DEFAULT_URL_STATE: UrlState = {
  routes: [],
  trips: [],
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  vehicle: null,
}

function parseList(raw: string | null): string[] {
  if (!raw) return []
  const seen = new Set<string>()
  for (const part of raw.split(',')) {
    const value = part.trim()
    if (value) seen.add(value)
  }
  return [...seen]
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (raw === null) return fallback
  const value = Number(raw)
  return Number.isInteger(value) && value >= 1 ? value : fallback
}

export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)
  const limitRaw = Number(params.get('limit'))
  return {
    routes: parseList(params.get('route')),
    trips: parseList(params.get('trip')),
    page: parsePositiveInt(params.get('page'), DEFAULT_URL_STATE.page),
    limit: isPageSize(limitRaw) ? limitRaw : DEFAULT_URL_STATE.limit,
    vehicle: params.get('vehicle')?.trim() || null,
  }
}

/** Serialisasi; nilai default tidak ditulis agar URL tetap ringkas. */
export function serializeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  if (state.routes.length) params.set('route', state.routes.join(','))
  if (state.trips.length) params.set('trip', state.trips.join(','))
  if (state.page !== DEFAULT_URL_STATE.page) params.set('page', String(state.page))
  if (state.limit !== DEFAULT_URL_STATE.limit) params.set('limit', String(state.limit))
  if (state.vehicle) params.set('vehicle', state.vehicle)
  const query = params.toString()
  return query ? `?${query}` : ''
}
