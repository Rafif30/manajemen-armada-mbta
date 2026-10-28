import type {
  IncludedResource,
  JsonApiLinks,
  JsonApiListResponse,
  JsonApiResource,
  JsonApiSingleResponse,
  RouteResource,
  TripResource,
  VehicleResource,
} from '../types/jsonapi'
import type {
  OptionItem,
  OptionsPage,
  PageLinks,
  Vehicle,
  VehicleRoute,
  VehicleStop,
  VehicleTrip,
  VehiclesPage,
} from '../types/domain'
import { isVehicleStatus } from './status'
import { offsetFromLink } from './pagination'

export type IncludedIndex = Map<string, IncludedResource>

export function indexIncluded(included: IncludedResource[] | undefined): IncludedIndex {
  const index: IncludedIndex = new Map()
  for (const resource of included ?? []) {
    index.set(`${resource.type}:${resource.id}`, resource)
  }
  return index
}

function relationshipId(resource: JsonApiResource<unknown>, key: string): string | null {
  const data = resource.relationships?.[key]?.data
  if (!data || Array.isArray(data)) return null
  return data.id
}

function toDirectionId(value: number | null | undefined): 0 | 1 | null {
  return value === 0 || value === 1 ? value : null
}

export function routeDisplayName(
  shortName: string | null,
  longName: string | null,
  id: string,
): string {
  const short = shortName?.trim() || null
  const long = longName?.trim() || null
  if (short && long && short !== long) return `${short} · ${long}`
  return long ?? short ?? id
}

export function mapRoute(route: RouteResource): VehicleRoute {
  const { short_name, long_name, color, text_color, direction_names } = route.attributes
  return {
    id: route.id,
    name: routeDisplayName(short_name, long_name, route.id),
    shortName: short_name?.trim() || null,
    longName: long_name?.trim() || null,
    color: color ?? null,
    textColor: text_color ?? null,
    directionNames: direction_names ?? [],
  }
}

export function mapTrip(trip: TripResource): VehicleTrip {
  return {
    id: trip.id,
    headsign: trip.attributes.headsign?.trim() || null,
    directionId: toDirectionId(trip.attributes.direction_id),
  }
}

export function mapVehicle(vehicle: VehicleResource, index: IncludedIndex): Vehicle {
  const attrs = vehicle.attributes

  const routeId = relationshipId(vehicle, 'route')
  const tripId = relationshipId(vehicle, 'trip')
  const stopId = relationshipId(vehicle, 'stop')

  const routeResource = routeId ? index.get(`route:${routeId}`) : undefined
  const tripResource = tripId ? index.get(`trip:${tripId}`) : undefined
  const stopResource = stopId ? index.get(`stop:${stopId}`) : undefined

  let route: VehicleRoute | null = null
  if (routeResource?.type === 'route') {
    route = mapRoute(routeResource)
  } else if (routeId) {
    route = {
      id: routeId,
      name: routeId,
      shortName: null,
      longName: null,
      color: null,
      textColor: null,
      directionNames: [],
    }
  }

  let trip: VehicleTrip | null = null
  if (tripResource?.type === 'trip') {
    trip = mapTrip(tripResource)
  } else if (tripId) {
    trip = { id: tripId, headsign: null, directionId: null }
  }

  let stop: VehicleStop | null = null
  if (stopResource?.type === 'stop') {
    stop = { id: stopResource.id, name: stopResource.attributes.name }
  }

  return {
    id: vehicle.id,
    label: attrs.label?.trim() || null,
    status: isVehicleStatus(attrs.current_status) ? attrs.current_status : null,
    rawStatus: attrs.current_status ?? null,
    latitude: attrs.latitude ?? null,
    longitude: attrs.longitude ?? null,
    updatedAt: attrs.updated_at,
    bearing: attrs.bearing ?? null,
    speed: attrs.speed ?? null,
    directionId: toDirectionId(attrs.direction_id),
    occupancyStatus: attrs.occupancy_status ?? null,
    currentStopSequence: attrs.current_stop_sequence ?? null,
    route,
    trip,
    stop,
  }
}

export function toPageLinks(links: JsonApiLinks | null | undefined): PageLinks | null {
  if (!links) return null
  return { first: links.first, last: links.last, prev: links.prev, next: links.next }
}

export function mapVehiclesResponse(
  response: JsonApiListResponse<VehicleResource>,
  page: number,
  limit: number,
): VehiclesPage {
  const index = indexIncluded(response.included)
  return {
    items: response.data.map((vehicle) => mapVehicle(vehicle, index)),
    links: toPageLinks(response.links),
    page,
    limit,
  }
}

export function mapVehicleResponse(response: JsonApiSingleResponse<VehicleResource>): Vehicle {
  return mapVehicle(response.data, indexIncluded(response.included))
}

export function mapRouteOption(route: RouteResource): OptionItem {
  const { short_name, long_name, description } = route.attributes
  const short = short_name?.trim() || null
  const long = long_name?.trim() || null
  return {
    value: route.id,
    label: short ?? long ?? route.id,
    hint: short && long ? long : (description ?? undefined),
  }
}

export function mapTripOption(trip: TripResource): OptionItem {
  const headsign = trip.attributes.headsign?.trim() || null
  const direction = toDirectionId(trip.attributes.direction_id)
  const hintParts = [
    headsign ? `→ ${headsign}` : null,
    direction === null ? null : `Arah ${direction}`,
  ]
  return {
    value: trip.id,
    label: `Trip ${trip.id}`,
    hint: hintParts.filter(Boolean).join(' · ') || undefined,
    group: relationshipId(trip, 'route') ?? undefined,
  }
}

export function mapOptionsResponse<T extends RouteResource | TripResource>(
  response: JsonApiListResponse<T>,
  mapItem: (item: T) => OptionItem,
): OptionsPage {
  return {
    items: response.data.map(mapItem),
    nextOffset: offsetFromLink(response.links?.next),
  }
}
