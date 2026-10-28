/**
 * Tipe respons JSON:API dari MBTA V3.
 * Hanya atribut yang dipakai aplikasi yang dideklarasikan.
 */

export interface JsonApiResourceIdentifier {
  id: string
  type: string
}

export interface JsonApiRelationship {
  data?: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null
  links?: Record<string, string>
}

export interface JsonApiResource<TAttributes, TType extends string = string> {
  id: string
  type: TType
  attributes: TAttributes
  relationships?: Record<string, JsonApiRelationship | undefined>
  links?: { self?: string }
}

export interface JsonApiLinks {
  first?: string
  last?: string
  prev?: string
  next?: string
  self?: string
}

export interface JsonApiListResponse<TData> {
  data: TData[]
  included?: IncludedResource[]
  links?: JsonApiLinks | null
  jsonapi?: { version: string }
}

export interface JsonApiSingleResponse<TData> {
  data: TData
  included?: IncludedResource[]
  jsonapi?: { version: string }
}

export interface JsonApiError {
  code?: string
  status?: string
  title?: string
  detail?: string
  source?: { parameter?: string; pointer?: string }
}

export interface JsonApiErrorResponse {
  errors: JsonApiError[]
}

export interface VehicleAttributes {
  bearing: number | null
  current_status: string | null
  current_stop_sequence: number | null
  direction_id: number | null
  label: string | null
  latitude: number | null
  longitude: number | null
  occupancy_status: string | null
  speed: number | null
  updated_at: string
  revenue?: string | null
}

export interface RouteAttributes {
  long_name: string | null
  short_name: string | null
  description: string | null
  color: string | null
  text_color: string | null
  type: number
  direction_names?: (string | null)[]
  direction_destinations?: (string | null)[]
  sort_order?: number
}

export interface TripAttributes {
  headsign: string | null
  name: string | null
  direction_id: number | null
  block_id?: string | null
}

export interface StopAttributes {
  name: string
  latitude: number | null
  longitude: number | null
  municipality?: string | null
  description?: string | null
}

export type VehicleResource = JsonApiResource<VehicleAttributes, 'vehicle'>
export type RouteResource = JsonApiResource<RouteAttributes, 'route'>
export type TripResource = JsonApiResource<TripAttributes, 'trip'>
export type StopResource = JsonApiResource<StopAttributes, 'stop'>

export type IncludedResource = RouteResource | TripResource | StopResource
