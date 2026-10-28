import { MultiSelectDropdown } from './MultiSelectDropdown'
import type { useRoutesInfinite } from '../../hooks/useRoutesInfinite'

interface RouteFilterProps {
  source: ReturnType<typeof useRoutesInfinite>
  selected: string[]
  onChange: (next: string[]) => void
}

export function RouteFilter({ source, selected, onChange }: RouteFilterProps) {
  return (
    <MultiSelectDropdown
      label="Rute"
      options={source.options}
      selected={selected}
      onChange={onChange}
      onReachEnd={source.loadMore}
      hasMore={source.hasMore}
      isLoading={source.isLoading}
      isFetchingMore={source.isFetchingMore}
      error={source.error}
      onRetry={source.retry}
      emptyText="Tidak ada rute"
    />
  )
}
