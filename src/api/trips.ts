import type { JsonApiListResponse, TripResource } from '../types/jsonapi'
import type { OptionsPage } from '../types/domain'
import { apiClient, type QueryParams } from './client'
import { mapOptionsResponse, mapTripOption } from '../lib/mappers'
import { OPTIONS_PAGE_SIZE } from '../lib/pagination'

export interface GetTripsParams {
  /** Wajib: MBTA menolak /trips tanpa filter (400 "At least one filter[] is required"). */
  routes: string[]
  offset: number
  limit?: number
  signal?: AbortSignal
}

/** GET /trips?filter[route]&page[limit]&page[offset] (FR-4.4, FR-4.6) */
export async function getTrips({
  routes,
  offset,
  limit = OPTIONS_PAGE_SIZE,
  signal,
}: GetTripsParams): Promise<OptionsPage> {
  if (routes.length === 0) return { items: [], nextOffset: null }
  const params: QueryParams = {
    'filter[route]': routes.join(','),
    'page[limit]': limit,
    'page[offset]': offset,
  }
  const { data } = await apiClient.get<JsonApiListResponse<TripResource>>('/trips', {
    params,
    signal,
  })
  return mapOptionsResponse(data, mapTripOption)
}
