import { useCallback, useMemo } from 'react'
import { AppHeader } from './components/AppHeader'
import { FilterToolbar } from './features/filters/FilterToolbar'
import { VehicleGrid } from './features/vehicles/VehicleGrid'
import { VehicleDetailModal } from './features/vehicles/VehicleDetailModal'
import { Pagination } from './features/pagination/Pagination'
import { useUrlState } from './hooks/useUrlState'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useVehicles } from './hooks/useVehicles'
import type { VehiclesKeyParams } from './lib/queryKeys'
import type { Vehicle } from './types/domain'

export default function App() {
  const url = useUrlState()

  // Satu objek parameter yang di-debounce bersama agar tidak ada request
  // dengan kombinasi filter/halaman yang setengah jadi (R-2).
  const params = useMemo<VehiclesKeyParams>(
    () => ({ page: url.page, limit: url.limit, routes: url.routes, trips: url.trips }),
    [url.page, url.limit, url.routes, url.trips],
  )
  const debouncedParams = useDebouncedValue(params, 300)
  const isSettling = debouncedParams !== params

  const vehicles = useVehicles(debouncedParams)
  const hasActiveFilters = url.routes.length > 0 || url.trips.length > 0

  const openVehicle = useCallback((vehicle: Vehicle) => url.setVehicle(vehicle.id), [url])
  const closeVehicle = useCallback(() => url.setVehicle(null), [url])
  const refresh = useCallback(() => void vehicles.refetch(), [vehicles])
  const goToFirstPage = useCallback(() => url.setPage(1), [url])

  const showPagination =
    !vehicles.isLoading &&
    !(vehicles.error && vehicles.items.length === 0) &&
    vehicles.meta.count > 0

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        onRefresh={refresh}
        isRefreshing={vehicles.isFetching}
        dataUpdatedAt={vehicles.dataUpdatedAt}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        <FilterToolbar
          routes={url.routes}
          trips={url.trips}
          debouncedRoutes={debouncedParams.routes}
          onRoutesChange={url.setRoutes}
          onTripsChange={url.setTrips}
          onReset={url.resetFilters}
        />

        <VehicleGrid
          items={vehicles.items}
          meta={vehicles.meta}
          limit={url.limit}
          isLoading={vehicles.isLoading}
          isFetching={vehicles.isFetching || isSettling}
          error={vehicles.error}
          hasActiveFilters={hasActiveFilters}
          onRetry={refresh}
          onResetFilters={url.resetFilters}
          onGoToFirstPage={goToFirstPage}
          onSelect={openVehicle}
        />

        {showPagination && (
          <Pagination
            meta={vehicles.meta}
            isFetching={vehicles.isFetching || isSettling}
            onPageChange={url.setPage}
            onLimitChange={url.setLimit}
          />
        )}
      </main>

      <VehicleDetailModal vehicleId={url.vehicle} onClose={closeVehicle} />
    </div>
  )
}
