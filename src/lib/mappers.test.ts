import { describe, expect, it } from 'vitest'
import {
  indexIncluded,
  mapRouteOption,
  mapTripOption,
  mapVehicle,
  mapVehiclesResponse,
  routeDisplayName,
} from './mappers'
import type { RouteResource, TripResource, VehicleResource, StopResource } from '../types/jsonapi'

const route: RouteResource = {
  id: '28',
  type: 'route',
  attributes: {
    short_name: '28',
    long_name: 'Mattapan Station - Ruggles Station',
    description: 'Frequent Bus',
    color: 'FFC72C',
    text_color: '000000',
    type: 3,
    direction_names: ['Outbound', 'Inbound'],
  },
}

const trip: TripResource = {
  id: '78591413',
  type: 'trip',
  attributes: { headsign: 'Mattapan', name: '', direction_id: 0 },
  relationships: { route: { data: { id: '28', type: 'route' } } },
}

const stop: StopResource = {
  id: '1709',
  type: 'stop',
  attributes: { name: 'Blue Hill Ave @ Greenock St', latitude: 42.28, longitude: -71.08 },
}

const vehicle: VehicleResource = {
  id: 'y1210',
  type: 'vehicle',
  attributes: {
    bearing: null,
    current_status: 'STOPPED_AT',
    current_stop_sequence: 23,
    direction_id: 0,
    label: '1210',
    latitude: 42.291971,
    longitude: -71.089071,
    occupancy_status: 'MANY_SEATS_AVAILABLE',
    speed: null,
    updated_at: '2026-10-27T12:48:59-04:00',
  },
  relationships: {
    route: { data: { id: '28', type: 'route' } },
    trip: { data: { id: '78591413', type: 'trip' } },
    stop: { data: { id: '1709', type: 'stop' } },
  },
}

describe('mapVehicle', () => {
  it('menggabungkan route, trip, dan stop dari included', () => {
    const result = mapVehicle(vehicle, indexIncluded([route, trip, stop]))
    expect(result).toMatchObject({
      id: 'y1210',
      label: '1210',
      status: 'STOPPED_AT',
      rawStatus: 'STOPPED_AT',
      latitude: 42.291971,
      longitude: -71.089071,
      directionId: 0,
      currentStopSequence: 23,
      occupancyStatus: 'MANY_SEATS_AVAILABLE',
      route: {
        id: '28',
        name: '28 · Mattapan Station - Ruggles Station',
        directionNames: ['Outbound', 'Inbound'],
      },
      trip: { id: '78591413', headsign: 'Mattapan', directionId: 0 },
      stop: { id: '1709', name: 'Blue Hill Ave @ Greenock St' },
    })
  })

  it('tetap mengisi id relasi bila included tidak memuatnya', () => {
    const result = mapVehicle(vehicle, indexIncluded([]))
    expect(result.route).toEqual(expect.objectContaining({ id: '28', name: '28' }))
    expect(result.trip).toEqual({ id: '78591413', headsign: null, directionId: null })
    expect(result.stop).toBeNull()
  })

  it('status di luar yang dikenal menjadi null tapi nilai mentah tersimpan', () => {
    const odd: VehicleResource = {
      ...vehicle,
      attributes: { ...vehicle.attributes, current_status: 'SOMETHING_NEW', label: '  ' },
    }
    const result = mapVehicle(odd, indexIncluded([]))
    expect(result.status).toBeNull()
    expect(result.rawStatus).toBe('SOMETHING_NEW')
    expect(result.label).toBeNull()
  })
})

describe('mapVehiclesResponse', () => {
  it('membawa links serta page dan limit yang dipakai', () => {
    const result = mapVehiclesResponse(
      { data: [vehicle], included: [route, trip], links: { first: 'a', last: 'b', next: 'c' } },
      2,
      12,
    )
    expect(result.items).toHaveLength(1)
    expect(result.links).toEqual({ first: 'a', last: 'b', next: 'c', prev: undefined })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(12)
  })

  it('links null tetap null', () => {
    expect(mapVehiclesResponse({ data: [], links: null }, 1, 12).links).toBeNull()
  })
})

describe('routeDisplayName & opsi', () => {
  it('menggabungkan short dan long name, jatuh ke id bila kosong', () => {
    expect(routeDisplayName('28', 'Mattapan - Ruggles', '28')).toBe('28 · Mattapan - Ruggles')
    expect(routeDisplayName('', 'Red Line', 'Red')).toBe('Red Line')
    expect(routeDisplayName(null, null, 'X')).toBe('X')
  })

  it('mapRouteOption memakai short_name sebagai label dan long_name sebagai hint', () => {
    expect(mapRouteOption(route)).toEqual({
      value: '28',
      label: '28',
      hint: 'Mattapan Station - Ruggles Station',
    })
    const red: RouteResource = {
      ...route,
      id: 'Red',
      attributes: { ...route.attributes, short_name: '', long_name: 'Red Line' },
    }
    expect(mapRouteOption(red)).toEqual({ value: 'Red', label: 'Red Line', hint: 'Frequent Bus' })
  })

  it('mapTripOption menyimpan rute induk pada group', () => {
    expect(mapTripOption(trip)).toEqual({
      value: '78591413',
      label: 'Trip 78591413',
      hint: '→ Mattapan · Arah 0',
      group: '28',
    })
  })
})
