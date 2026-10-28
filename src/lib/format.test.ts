import { describe, expect, it } from 'vitest'
import {
  EMPTY,
  formatBearing,
  formatCoordinate,
  formatDirection,
  formatRelative,
  formatSpeed,
} from './format'

describe('format', () => {
  it('koordinat 6 desimal, kosong menjadi —', () => {
    expect(formatCoordinate(-6.2087631)).toBe('-6.208763')
    expect(formatCoordinate(null)).toBe(EMPTY)
    expect(formatCoordinate(Number.NaN)).toBe(EMPTY)
  })

  it('arah hadap dengan mata angin', () => {
    expect(formatBearing(90)).toBe('90° (T)')
    expect(formatBearing(0)).toBe('0° (U)')
    expect(formatBearing(359)).toBe('359° (U)')
    expect(formatBearing(null)).toBe(EMPTY)
  })

  it('kecepatan m/s menjadi km/jam', () => {
    expect(formatSpeed(10)).toBe('36 km/jam (10.0 m/s)')
    expect(formatSpeed(null)).toBe(EMPTY)
  })

  it('arah perjalanan memakai nama dari rute bila ada', () => {
    expect(formatDirection(0, ['Outbound', 'Inbound'])).toBe('Outbound (0)')
    expect(formatDirection(1)).toBe('Arah 1')
    expect(formatDirection(null)).toBe(EMPTY)
  })

  it('waktu relatif berbahasa Indonesia', () => {
    const now = new Date('2026-10-27T14:07:00Z')
    expect(formatRelative('2026-10-27T14:05:00Z', now)).toBe('2 menit yang lalu')
    expect(formatRelative('tidak valid', now)).toBe(EMPTY)
  })
})
