import { format, formatDistanceStrict, isValid, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export const EMPTY = '—'

export function formatCoordinate(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : EMPTY
}

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const date = parseISO(iso)
  return isValid(date) ? date : null
}

/** "27 Okt 2026, 14:05" dalam zona waktu perangkat pengguna. */
export function formatDateTime(iso: string | null | undefined): string {
  const date = parseDate(iso)
  return date ? format(date, 'd MMM yyyy, HH:mm', { locale: localeId }) : EMPTY
}

/** "2 menit yang lalu" relatif terhadap `now`. */
export function formatRelative(iso: string | null | undefined, now: Date = new Date()): string {
  const date = parseDate(iso)
  return date ? formatDistanceStrict(date, now, { addSuffix: true, locale: localeId }) : EMPTY
}

const COMPASS = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'] as const

/** "90° (T)" */
export function formatBearing(bearing: number | null | undefined): string {
  if (typeof bearing !== 'number' || !Number.isFinite(bearing)) return EMPTY
  const normalized = ((bearing % 360) + 360) % 360
  const compass = COMPASS[Math.round(normalized / 45) % COMPASS.length]
  return `${Math.round(normalized)}° (${compass})`
}

/** Kecepatan dari API dalam m/s; tampilkan km/jam dan nilai asli. */
export function formatSpeed(mps: number | null | undefined): string {
  if (typeof mps !== 'number' || !Number.isFinite(mps)) return EMPTY
  return `${Math.round(mps * 3.6)} km/jam (${mps.toFixed(1)} m/s)`
}

export function formatDirection(
  directionId: 0 | 1 | null | undefined,
  directionNames: (string | null)[] = [],
): string {
  if (directionId !== 0 && directionId !== 1) return EMPTY
  const name = directionNames[directionId]
  return name ? `${name} (${directionId})` : `Arah ${directionId}`
}
