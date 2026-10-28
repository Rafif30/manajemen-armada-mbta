import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getVehicles } from '../api/vehicles'
import { getPaginationMeta } from '../lib/pagination'
import { queryKeys, type VehiclesKeyParams } from '../lib/queryKeys'

export const VEHICLES_STALE_TIME = 30_000

/**
 * Daftar kendaraan per halaman (FR-1.4, FR-3.7).
 * Meta pagination dihitung dari data yang sedang tampil (termasuk placeholder),
 * sehingga teks rentang selalu konsisten dengan grid.
 */
export function useVehicles(params: VehiclesKeyParams) {
  const query = useQuery({
    queryKey: queryKeys.vehicles(params),
    queryFn: ({ signal }) => getVehicles({ ...params, signal }),
    placeholderData: keepPreviousData,
    staleTime: VEHICLES_STALE_TIME,
  })

  const data = query.data
  const meta = useMemo(
    () =>
      getPaginationMeta({
        page: data?.page ?? params.page,
        limit: data?.limit ?? params.limit,
        count: data?.items.length ?? 0,
        links: data?.links ?? null,
      }),
    [data, params.page, params.limit],
  )

  return {
    items: data?.items ?? [],
    meta,
    /** Muat awal tanpa data apa pun (skeleton). */
    isLoading: query.isPending,
    /** Sedang mengambil data baru sementara data lama masih tampil. */
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    error: query.error,
    dataUpdatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
  }
}
