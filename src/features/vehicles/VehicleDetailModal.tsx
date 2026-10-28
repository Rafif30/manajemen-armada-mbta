import { lazy, Suspense, useId, useRef, type ReactNode } from 'react'
import { Modal } from '../../components/Modal'
import { Skeleton } from '../../components/Skeleton'
import { Spinner } from '../../components/Spinner'
import { ErrorState } from '../../components/ErrorState'
import { Button } from '../../components/Button'
import { CloseIcon, MapPinIcon } from '../../components/icons'
import { StatusBadge } from './StatusBadge'
import { useVehicle } from '../../hooks/useVehicle'
import { useNow } from '../../hooks/useNow'
import { getErrorMessage } from '../../lib/errors'
import {
  EMPTY,
  formatBearing,
  formatCoordinate,
  formatDateTime,
  formatDirection,
  formatRelative,
  formatSpeed,
} from '../../lib/format'
import { getOccupancyLabel, getStopPrefix } from '../../lib/status'
import type { Vehicle } from '../../types/domain'

const VehicleMap = lazy(() => import('./VehicleMap'))

interface VehicleDetailModalProps {
  vehicleId: string | null
  onClose: () => void
}

interface FieldProps {
  label: string
  children: ReactNode
  loading?: boolean
  mono?: boolean
  className?: string
}

function Field({ label, children, loading = false, mono = false, className }: FieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd
        className={
          mono ? 'font-mono text-sm tabular-nums text-neutral-900' : 'text-sm text-neutral-900'
        }
      >
        {loading ? <Skeleton className="mt-1 h-4 w-32" /> : children}
      </dd>
    </div>
  )
}

function MapPlaceholder({ loading, message }: { loading?: boolean; message?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-sm text-neutral-500">
      {loading ? <Spinner label="Memuat peta" /> : <MapPinIcon className="h-6 w-6" />}
      <span>{message ?? 'Memuat peta…'}</span>
    </div>
  )
}

function hasCoordinates(
  vehicle: Vehicle | undefined,
): vehicle is Vehicle & { latitude: number; longitude: number } {
  return typeof vehicle?.latitude === 'number' && typeof vehicle?.longitude === 'number'
}

/** Popup detail kendaraan (FR-5). */
export function VehicleDetailModal({ vehicleId, onClose }: VehicleDetailModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const now = useNow()
  const { data: vehicle, isPlaceholderData, isFetching, error, refetch } = useVehicle(vehicleId)

  /** true saat data segar dari /vehicles/{id} belum tiba (placeholder dari list atau belum ada data). */
  const awaitingFresh = isFetching && (isPlaceholderData || !vehicle)
  const label = vehicle?.label ?? (vehicle ? EMPTY : '')

  const extraFields: { key: string; label: string; value: string }[] = []
  if (vehicle) {
    if (vehicle.bearing !== null)
      extraFields.push({
        key: 'bearing',
        label: 'Arah hadap',
        value: formatBearing(vehicle.bearing),
      })
    if (vehicle.speed !== null)
      extraFields.push({ key: 'speed', label: 'Kecepatan', value: formatSpeed(vehicle.speed) })
    if (vehicle.directionId !== null)
      extraFields.push({
        key: 'direction',
        label: 'Arah perjalanan',
        value: formatDirection(vehicle.directionId, vehicle.route?.directionNames),
      })
    const occupancy = getOccupancyLabel(vehicle.occupancyStatus)
    if (occupancy) extraFields.push({ key: 'occupancy', label: 'Okupansi', value: occupancy })
    if (vehicle.currentStopSequence !== null)
      extraFields.push({
        key: 'stopSequence',
        label: 'Urutan halte',
        value: String(vehicle.currentStopSequence),
      })
  }

  return (
    <Modal
      open={vehicleId !== null}
      onClose={onClose}
      labelledBy={titleId}
      initialFocusRef={closeButtonRef}
    >
      <header className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Detail kendaraan
          </p>
          <h2 id={titleId} className="truncate text-lg font-semibold text-primary-900">
            {vehicle ? label : 'Memuat…'}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {vehicle && <StatusBadge status={vehicle.status} rawStatus={vehicle.rawStatus} />}
          {awaitingFresh && vehicle && <Spinner size="sm" label="Memperbarui data" />}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {error && !vehicle ? (
          <ErrorState
            title="Detail tidak dapat dimuat"
            message={getErrorMessage(error)}
            onRetry={() => void refetch()}
          />
        ) : (
          <div className="space-y-5">
            {error && vehicle && (
              <ErrorState
                compact
                message={`Data segar gagal dimuat, menampilkan data dari daftar. ${getErrorMessage(error)}`}
                onRetry={() => void refetch()}
              />
            )}

            <div className="h-56 overflow-hidden rounded-xl border border-neutral-200 sm:h-72">
              {!vehicle ? (
                <Skeleton className="h-full w-full rounded-none" />
              ) : hasCoordinates(vehicle) ? (
                <Suspense fallback={<MapPlaceholder loading />}>
                  <VehicleMap
                    latitude={vehicle.latitude}
                    longitude={vehicle.longitude}
                    label={label}
                  />
                </Suspense>
              ) : (
                <MapPlaceholder message="Lokasi belum tersedia" />
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Field label="Latitude" mono loading={!vehicle}>
                {formatCoordinate(vehicle?.latitude)}
              </Field>
              <Field label="Longitude" mono loading={!vehicle}>
                {formatCoordinate(vehicle?.longitude)}
              </Field>
              <Field label="Diperbarui" loading={!vehicle} className="col-span-2">
                {vehicle && (
                  <>
                    <time dateTime={vehicle.updatedAt}>{formatDateTime(vehicle.updatedAt)}</time>
                    <span className="text-neutral-500">
                      {' '}
                      ({formatRelative(vehicle.updatedAt, now)})
                    </span>
                  </>
                )}
              </Field>
            </dl>

            <dl className="grid grid-cols-1 gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-2">
              <Field label="Rute" loading={!vehicle}>
                {vehicle?.route ? vehicle.route.name : EMPTY}
              </Field>
              <Field label="Trip" loading={!vehicle}>
                {vehicle?.trip ? (
                  <>
                    <span className="font-mono tabular-nums">{vehicle.trip.id}</span>
                    {vehicle.trip.headsign && (
                      <span className="text-neutral-500"> → {vehicle.trip.headsign}</span>
                    )}
                  </>
                ) : (
                  EMPTY
                )}
              </Field>
            </dl>

            <section
              aria-labelledby={`${titleId}-extra`}
              className="border-t border-neutral-200 pt-4"
            >
              <h3 id={`${titleId}-extra`} className="mb-3 text-sm font-semibold text-neutral-900">
                Data lain
              </h3>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {extraFields.map((field) => (
                  <Field key={field.key} label={field.label}>
                    {field.value}
                  </Field>
                ))}
                {(vehicle?.stop || awaitingFresh) && (
                  <Field
                    label="Halte"
                    loading={!vehicle?.stop && awaitingFresh}
                    className="col-span-2 sm:col-span-3"
                  >
                    {vehicle?.stop && `${getStopPrefix(vehicle.status)} ${vehicle.stop.name}`}
                  </Field>
                )}
                {!vehicle && (
                  <>
                    <Field label="Arah hadap" loading>
                      {null}
                    </Field>
                    <Field label="Kecepatan" loading>
                      {null}
                    </Field>
                    <Field label="Okupansi" loading>
                      {null}
                    </Field>
                  </>
                )}
              </dl>
              {vehicle && !awaitingFresh && extraFields.length === 0 && !vehicle.stop && (
                <p className="text-sm text-neutral-500">
                  Tidak ada data tambahan untuk kendaraan ini.
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      <footer className="flex justify-end border-t border-neutral-200 px-5 py-3">
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </footer>
    </Modal>
  )
}
