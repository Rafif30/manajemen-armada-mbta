import { describe, expect, it } from 'vitest'
import { parseUrlState, serializeUrlState } from './urlState'

describe('parseUrlState', () => {
  it('membaca route, trip, page, limit, vehicle', () => {
    expect(parseUrlState('?route=1,Red&trip=a,b&page=3&limit=24&vehicle=y1')).toEqual({
      routes: ['1', 'Red'],
      trips: ['a', 'b'],
      page: 3,
      limit: 24,
      vehicle: 'y1',
    })
  })

  it('memakai default untuk nilai tidak valid dan membuang duplikat', () => {
    expect(parseUrlState('?route=1,,1, Red &page=0&limit=13')).toEqual({
      routes: ['1', 'Red'],
      trips: [],
      page: 1,
      limit: 12,
      vehicle: null,
    })
    expect(parseUrlState('')).toEqual({ routes: [], trips: [], page: 1, limit: 12, vehicle: null })
  })
})

describe('serializeUrlState', () => {
  it('tidak menulis nilai default', () => {
    expect(serializeUrlState({ routes: [], trips: [], page: 1, limit: 12, vehicle: null })).toBe('')
  })

  it('bolak-balik dengan parseUrlState', () => {
    const state = {
      routes: ['1', 'Red'],
      trips: ['78181030'],
      page: 2,
      limit: 48 as const,
      vehicle: 'y1210',
    }
    expect(parseUrlState(serializeUrlState(state))).toEqual(state)
  })
})
