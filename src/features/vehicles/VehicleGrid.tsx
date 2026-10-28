import type { PageMeta, Vehicle } from '../../types/domain'
import { VehicleCard, VehicleCardSkeleton } from './VehicleCard'
import { ErrorState } from '../../components/ErrorState'
import { EmptyState } from '../../components/EmptyState'
import { getErrorMessage } from '../../lib/errors'
import { cn } from '../../lib/cn'
import { useNow } from '../../hooks/useNow'

interface VehicleGridProps {
  items: Vehicle[]
  meta: PageMeta
  limit: number
  isLoading: boolean
  isFetching: boolean
  error: unknown
  hasActiveFilters: boolean
  onRetry: () => void
  onResetFilters: () => void
  onGoToFirstPage: () => void
  onSelect: (vehicle: Vehicle) => void
}

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

/** Grid kendaraan dengan empat state: loading, kosong, error, berhasil (design 5). */
export function VehicleGrid({
  items,
  meta,
  limit,
  isLoading,
  isFetching,
  error,
  hasActiveFilters,
  onRetry,
  onResetFilters,
  onGoToFirstPage,
  onSelect,
}: VehicleGridProps) {
  const now = useNow()

  if (isLoading) {
    return (
      <div className={GRID_CLASS} aria-busy="true" aria-label="Memuat daftar kendaraan">
        {Array.from({ length: limit }, (_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <ErrorState
        title="Gagal memuat kendaraan"
        message={getErrorMessage(error)}
        onRetry={onRetry}
      />
    )
  }

  if (items.length === 0) {
    const outOfRange =
      meta.totalPages !== null && meta.totalPages > 0 && meta.page > meta.totalPages
    if (outOfRange) {
      return (
        <EmptyState
          title="Halaman tidak tersedia"
          message={`Halaman ${meta.page} melebihi jumlah halaman yang ada (${meta.totalPages}).`}
          action={{ label: 'Ke halaman pertama', onClick: onGoToFirstPage }}
        />
      )
    }
    return (
      <EmptyState
        title="Tidak ada kendaraan"
        message={
          hasActiveFilters
            ? 'Tidak ada kendaraan yang cocok dengan filter ini.'
            : 'Belum ada kendaraan aktif yang dilaporkan saat ini.'
        }
        action={
          hasActiveFilters
            ? { label: 'Reset filter', onClick: onResetFilters }
            : { label: 'Muat ulang', onClick: onRetry }
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <ErrorState
          compact
          message={`Data terbaru gagal dimuat, menampilkan data sebelumnya. ${getErrorMessage(error)}`}
          onRetry={onRetry}
        />
      )}
      <div
        className={cn(GRID_CLASS, 'transition-opacity', isFetching && 'opacity-60')}
        aria-busy={isFetching}
      >
        {items.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} now={now} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
