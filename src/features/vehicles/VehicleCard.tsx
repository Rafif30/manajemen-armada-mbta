import type { KeyboardEvent } from 'react'
import type { Vehicle } from '../../types/domain'
import { StatusBadge } from './StatusBadge'
import { Skeleton } from '../../components/Skeleton'
import { EMPTY, formatCoordinate, formatDateTime, formatRelative } from '../../lib/format'

interface VehicleCardProps {
  vehicle: Vehicle
  now: Date
  onSelect: (vehicle: Vehicle) => void
}

/** Card kendaraan (FR-2). Dapat diklik dan difokus keyboard (FR-2.6). */
export function VehicleCard({ vehicle, now, onSelect }: VehicleCardProps) {
  const label = vehicle.label ?? EMPTY

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(vehicle)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Lihat detail kendaraan ${label}`}
      onClick={() => onSelect(vehicle)}
      onKeyDown={onKeyDown}
      className="flex cursor-pointer flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:border-primary-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-lg font-semibold text-neutral-900" title={label}>
          {label}
        </h3>
        <StatusBadge status={vehicle.status} rawStatus={vehicle.rawStatus} />
      </div>

      {vehicle.route && (
        <p className="truncate text-xs text-neutral-500" title={vehicle.route.name}>
          Rute {vehicle.route.name}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Latitude</dt>
          <dd className="font-mono text-sm tabular-nums text-neutral-900">
            {formatCoordinate(vehicle.latitude)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Longitude
          </dt>
          <dd className="font-mono text-sm tabular-nums text-neutral-900">
            {formatCoordinate(vehicle.longitude)}
          </dd>
        </div>
      </dl>

      <div className="border-t border-neutral-200 pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Diperbarui</p>
        <p className="text-sm text-neutral-900">
          <time dateTime={vehicle.updatedAt}>{formatDateTime(vehicle.updatedAt)}</time>
          <span className="text-neutral-500"> · {formatRelative(vehicle.updatedAt, now)}</span>
        </p>
      </div>
    </article>
  )
}

export function VehicleCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <Skeleton className="h-3 w-40" />
      <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="space-y-1.5 border-t border-neutral-200 pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  )
}
