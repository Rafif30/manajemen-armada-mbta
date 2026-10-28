import { useMemo } from 'react'
import { RouteFilter } from './RouteFilter'
import { TripFilter } from './TripFilter'
import { FilterChips, type Chip } from './FilterChips'
import { useRoutesInfinite } from '../../hooks/useRoutesInfinite'
import { useTripsInfinite } from '../../hooks/useTripsInfinite'
import { Button } from '../../components/Button'

interface FilterToolbarProps {
  routes: string[]
  trips: string[]
  /** Rute yang sudah di-debounce, dipakai untuk memuat daftar trip. */
  debouncedRoutes: string[]
  onRoutesChange: (routes: string[], trips: string[]) => void
  onTripsChange: (trips: string[]) => void
  onReset: () => void
}

/**
 * Toolbar filter Rute dan Trip (FR-4).
 * Memegang kedua sumber opsi agar bisa menampilkan label chip dan
 * membuang trip yang tidak lagi relevan saat rute berubah (FR-4.6).
 */
export function FilterToolbar({
  routes,
  trips,
  debouncedRoutes,
  onRoutesChange,
  onTripsChange,
  onReset,
}: FilterToolbarProps) {
  const routeSource = useRoutesInfinite()
  const tripSource = useTripsInfinite(debouncedRoutes)

  const routeLabels = useMemo(
    () => new Map(routeSource.options.map((o) => [o.value, o.label])),
    [routeSource.options],
  )
  const tripRouteIndex = useMemo(
    () => new Map(tripSource.options.map((o) => [o.value, o.group])),
    [tripSource.options],
  )

  const handleRoutesChange = (nextRoutes: string[]) => {
    if (nextRoutes.length === 0) {
      onRoutesChange([], [])
      return
    }
    // Buang trip yang diketahui milik rute yang tidak lagi dipilih.
    // Trip yang asal rutenya belum diketahui (misalnya dari URL) dipertahankan.
    const keptTrips = trips.filter((trip) => {
      const routeId = tripRouteIndex.get(trip)
      return routeId === undefined || nextRoutes.includes(routeId)
    })
    onRoutesChange(nextRoutes, keptTrips)
  }

  const chips: Chip[] = [
    ...routes.map((value) => ({
      kind: 'route' as const,
      value,
      label: routeLabels.get(value) ?? value,
    })),
    ...trips.map((value) => ({ kind: 'trip' as const, value, label: value })),
  ]

  const removeChip = (chip: Chip) => {
    if (chip.kind === 'route') handleRoutesChange(routes.filter((r) => r !== chip.value))
    else onTripsChange(trips.filter((t) => t !== chip.value))
  }

  const hasFilters = chips.length > 0

  return (
    <section
      aria-label="Filter kendaraan"
      className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        <RouteFilter source={routeSource} selected={routes} onChange={handleRoutesChange} />
        <TripFilter source={tripSource} selected={trips} onChange={onTripsChange} />
        {hasFilters && (
          <Button variant="ghost" onClick={onReset} className="sm:ml-auto">
            Reset filter
          </Button>
        )}
      </div>
      <FilterChips chips={chips} onRemove={removeChip} onClearAll={onReset} />
    </section>
  )
}
