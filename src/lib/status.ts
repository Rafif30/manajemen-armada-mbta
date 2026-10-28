import type { VehicleStatus } from '../types/domain'

export const VEHICLE_STATUSES: readonly VehicleStatus[] = [
  'IN_TRANSIT_TO',
  'STOPPED_AT',
  'INCOMING_AT',
]

export function isVehicleStatus(value: unknown): value is VehicleStatus {
  return typeof value === 'string' && (VEHICLE_STATUSES as readonly string[]).includes(value)
}

export interface StatusPresentation {
  label: string
  badgeClass: string
  dotClass: string
}

const STATUS_PRESENTATION: Record<VehicleStatus, StatusPresentation> = {
  IN_TRANSIT_TO: {
    label: 'Dalam perjalanan',
    badgeClass: 'bg-green-100 text-green-800',
    dotClass: 'bg-green-600',
  },
  STOPPED_AT: {
    label: 'Berhenti di halte',
    badgeClass: 'bg-orange-100 text-orange-800',
    dotClass: 'bg-orange-500',
  },
  INCOMING_AT: {
    label: 'Akan tiba',
    badgeClass: 'bg-blue-100 text-blue-800',
    dotClass: 'bg-blue-600',
  },
}

const UNKNOWN_PRESENTATION: StatusPresentation = {
  label: 'Tidak diketahui',
  badgeClass: 'bg-slate-100 text-slate-700',
  dotClass: 'bg-slate-400',
}

export function getStatusPresentation(status: VehicleStatus | null): StatusPresentation {
  return status ? STATUS_PRESENTATION[status] : UNKNOWN_PRESENTATION
}

/** Kata depan untuk nama halte sesuai status: "Berhenti di Halte X", "Menuju Halte X". */
export function getStopPrefix(status: VehicleStatus | null): string {
  switch (status) {
    case 'STOPPED_AT':
      return 'Berhenti di'
    case 'INCOMING_AT':
      return 'Akan tiba di'
    case 'IN_TRANSIT_TO':
      return 'Menuju'
    default:
      return 'Halte'
  }
}

const OCCUPANCY_LABELS: Record<string, string> = {
  MANY_SEATS_AVAILABLE: 'Banyak kursi kosong',
  FEW_SEATS_AVAILABLE: 'Sedikit kursi kosong',
  STANDING_ROOM_ONLY: 'Hanya tempat berdiri',
  CRUSHED_STANDING_ROOM_ONLY: 'Sangat penuh',
  FULL: 'Penuh',
  NOT_ACCEPTING_PASSENGERS: 'Tidak menerima penumpang',
  NO_DATA_AVAILABLE: 'Tidak ada data',
  NOT_BOARDABLE: 'Tidak dapat dinaiki',
}

export function getOccupancyLabel(code: string | null): string | null {
  if (!code) return null
  return OCCUPANCY_LABELS[code] ?? code
}
