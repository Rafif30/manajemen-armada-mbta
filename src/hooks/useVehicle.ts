import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { getVehicle } from '../api/vehicles'
import { queryKeys } from '../lib/queryKeys'
import type { Vehicle, VehiclesPage } from '../types/domain'
import { VEHICLES_STALE_TIME } from './useVehicles'

/** Cari kendaraan di cache daftar agar popup langsung terisi (FR-5.4). */
function findVehicleInListCache(client: QueryClient, id: string): Vehicle | undefined {
  for (const [, page] of client.getQueriesData<VehiclesPage>({ queryKey: ['vehicles'] })) {
    const found = page?.items.find((vehicle) => vehicle.id === id)
    if (found) return found
  }
  return undefined
}

/**
 * Detail kendaraan untuk popup. Data dari list dipakai sebagai `placeholderData`
 * (bukan `initialData`) supaya request segar tetap dilakukan dan field yang belum
 * ada (misalnya stop) ditampilkan sebagai skeleton.
 */
export function useVehicle(id: string | null) {
  const client = useQueryClient()
  const placeholder = id ? findVehicleInListCache(client, id) : undefined

  return useQuery({
    queryKey: queryKeys.vehicle(id ?? ''),
    queryFn: ({ signal }) => {
      if (!id) throw new Error('Vehicle id is required')
      return getVehicle(id, signal)
    },
    enabled: id !== null,
    staleTime: VEHICLES_STALE_TIME,
    placeholderData: placeholder,
  })
}
