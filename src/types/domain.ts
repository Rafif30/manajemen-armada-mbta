/**
 * Model domain datar yang dipakai komponen.
 * Komponen tidak mengenal bentuk JSON:API; pemetaan ada di lib/mappers.ts.
 */

export type VehicleStatus = 'IN_TRANSIT_TO' | 'STOPPED_AT' | 'INCOMING_AT'

export interface VehicleRoute {
  id: string
  /** Nama tampilan gabungan, contoh "28 · Mattapan Station - Ruggles Station". */
  name: string
  shortName: string | null
  longName: string | null
  color: string | null
  textColor: string | null
  directionNames: (string | null)[]
}

export interface VehicleTrip {
  id: string
  headsign: string | null
  directionId: 0 | 1 | null
}

export interface VehicleStop {
  id: string
  name: string
}

export interface Vehicle {
  id: string
  label: string | null
  status: VehicleStatus | null
  /** Nilai mentah dari API, untuk tooltip bila status di luar yang dikenal. */
  rawStatus: string | null
  latitude: number | null
  longitude: number | null
  /** ISO 8601 */
  updatedAt: string
  bearing: number | null
  speed: number | null
  directionId: 0 | 1 | null
  occupancyStatus: string | null
  currentStopSequence: number | null
  route: VehicleRoute | null
  trip: VehicleTrip | null
  stop: VehicleStop | null
}

export interface PageLinks {
  first?: string
  last?: string
  prev?: string
  next?: string
}

export interface VehiclesPage {
  items: Vehicle[]
  links: PageLinks | null
  /** Parameter yang dipakai saat request, agar meta pagination konsisten dengan data. */
  page: number
  limit: number
}

export interface PageMeta {
  page: number
  limit: number
  offset: number
  /** Jumlah item pada halaman ini. */
  count: number
  /** null bila tidak diketahui sama sekali. */
  totalItems: number | null
  /** true bila totalItems merupakan perkiraan (belum sampai halaman terakhir). */
  isTotalEstimate: boolean
  totalPages: number | null
  from: number
  to: number
  hasPrev: boolean
  hasNext: boolean
}

export interface OptionItem {
  value: string
  label: string
  hint?: string
  /** Pengelompokan opsional, dipakai trip untuk menyimpan id rute induknya. */
  group?: string
}

export interface OptionsPage {
  items: OptionItem[]
  /** Offset halaman berikutnya, null bila sudah habis. */
  nextOffset: number | null
}
