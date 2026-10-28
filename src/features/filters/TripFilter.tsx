import { MultiSelectDropdown } from './MultiSelectDropdown'
import type { useTripsInfinite } from '../../hooks/useTripsInfinite'

interface TripFilterProps {
  source: ReturnType<typeof useTripsInfinite>
  selected: string[]
  onChange: (next: string[]) => void
}

export function TripFilter({ source, selected, onChange }: TripFilterProps) {
  return (
    <MultiSelectDropdown
      label="Trip"
      options={source.options}
      selected={selected}
      onChange={onChange}
      onReachEnd={source.loadMore}
      hasMore={source.hasMore}
      isLoading={source.isLoading}
      isFetchingMore={source.isFetchingMore}
      error={source.error}
      onRetry={source.retry}
      disabled={!source.enabled}
      helperText={source.enabled ? undefined : 'Pilih rute terlebih dahulu'}
      emptyText="Tidak ada trip untuk rute terpilih"
    />
  )
}
