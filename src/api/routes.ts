import type { JsonApiListResponse, RouteResource } from '../types/jsonapi'
import type { OptionsPage } from '../types/domain'
import { apiClient, type QueryParams } from './client'
import { mapOptionsResponse, mapRouteOption } from '../lib/mappers'
import { OPTIONS_PAGE_SIZE } from '../lib/pagination'

export interface GetRoutesParams {
  offset: number
  limit?: number
  signal?: AbortSignal
}

/** GET /routes?page[limit]&page[offset] (FR-4.4) */
export async function getRoutes({
  offset,
  limit = OPTIONS_PAGE_SIZE,
  signal,
}: GetRoutesParams): Promise<OptionsPage> {
  const params: QueryParams = {
    'page[limit]': limit,
    'page[offset]': offset,
    sort: 'sort_order',
  }
  const { data } = await apiClient.get<JsonApiListResponse<RouteResource>>('/routes', {
    params,
    signal,
  })
  return mapOptionsResponse(data, mapRouteOption)
}
