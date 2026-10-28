import type { JsonApiListResponse, JsonApiSingleResponse, VehicleResource } from '../types/jsonapi'
import type { Vehicle, VehiclesPage } from '../types/domain'
import { apiClient, type QueryParams } from './client'
import { mapVehicleResponse, mapVehiclesResponse } from '../lib/mappers'
import { toOffset } from '../lib/pagination'
import { AppError, ERROR_MESSAGES, isAppError } from '../lib/errors'

export interface GetVehiclesParams {
  page: number
  limit: number
  routes: string[]
  trips: string[]
  signal?: AbortSignal
}

/** GET /vehicles?page[limit]&page[offset]&include=route,trip&filter[route]&filter[trip] (FR-1.1, FR-1.2, FR-3.5, FR-4.5) */
export async function getVehicles({
  page,
  limit,
  routes,
  trips,
  signal,
}: GetVehiclesParams): Promise<VehiclesPage> {
  const params: QueryParams = {
    'page[limit]': limit,
    'page[offset]': toOffset(page, limit),
    include: 'route,trip',
  }
  if (routes.length) params['filter[route]'] = routes.join(',')
  if (trips.length) params['filter[trip]'] = trips.join(',')

  const { data } = await apiClient.get<JsonApiListResponse<VehicleResource>>('/vehicles', {
    params,
    signal,
  })
  return mapVehiclesResponse(data, page, limit)
}

/** GET /vehicles/{id}?include=route,trip,stop (FR-5.4) */
export async function getVehicle(id: string, signal?: AbortSignal): Promise<Vehicle> {
  try {
    const { data } = await apiClient.get<JsonApiSingleResponse<VehicleResource>>(
      `/vehicles/${encodeURIComponent(id)}`,
      { params: { include: 'route,trip,stop' }, signal },
    )
    return mapVehicleResponse(data)
  } catch (error) {
    if (isAppError(error) && error.status === 404) {
      throw new AppError('http', ERROR_MESSAGES.vehicleNotFound, 404)
    }
    throw error
  }
}
