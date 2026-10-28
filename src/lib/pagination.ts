import type { PageLinks, PageMeta } from '../types/domain'

export const PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]
export const DEFAULT_PAGE_SIZE: PageSize = 12

/** Ukuran halaman untuk dropdown rute/trip (infinite scroll). */
export const OPTIONS_PAGE_SIZE = 20

export function isPageSize(value: number): value is PageSize {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
}

export function toOffset(page: number, limit: number): number {
  return Math.max(0, (page - 1) * limit)
}

/**
 * Ambil nilai `page[offset]` dari URL pada `links` JSON:API.
 * Menerima bentuk ter-encode (`page%5Boffset%5D`) maupun tidak.
 */
export function offsetFromLink(link: string | null | undefined): number | null {
  if (!link) return null
  try {
    const url = new URL(link, 'https://api-v3.mbta.com')
    const raw = url.searchParams.get('page[offset]')
    if (raw === null) return null
    const value = Number(raw)
    return Number.isInteger(value) && value >= 0 ? value : null
  } catch {
    return null
  }
}

export interface PaginationInput {
  page: number
  limit: number
  /** Jumlah item yang diterima pada halaman ini. */
  count: number
  links: PageLinks | null | undefined
}

/**
 * Hitung meta pagination dari `links` JSON:API MBTA (PRD 6.3).
 *
 * Hasil verifikasi API (27 Okt 2026):
 * - `links.last` selalu ada bila ada data; offset-nya kelipatan `limit`,
 *   sehingga `totalPages = lastOffset / limit + 1` bernilai pasti.
 * - Total item hanya pasti saat berada di halaman terakhir
 *   (`offset + count`). Di halaman lain dipakai perkiraan `lastOffset + limit`
 *   dan ditandai `isTotalEstimate`.
 * - Respons kosong mengembalikan `links: null`.
 * - Offset melewati halaman terakhir tetap mengembalikan `links.last`
 *   dengan `data` kosong.
 */
export function getPaginationMeta({ page, limit, count, links }: PaginationInput): PageMeta {
  const offset = toOffset(page, limit)
  const from = count > 0 ? offset + 1 : 0
  const to = count > 0 ? offset + count : 0
  const hasPrev = page > 1
  const lastOffset = offsetFromLink(links?.last)

  if (lastOffset === null) {
    // Tanpa links.last: total tidak diketahui, andalkan links.next.
    const hasNext = Boolean(links?.next)
    const isEmptyFirstPage = count === 0 && page === 1
    return {
      page,
      limit,
      offset,
      count,
      totalItems: hasNext ? null : isEmptyFirstPage ? 0 : count === 0 ? null : to,
      isTotalEstimate: false,
      totalPages: hasNext ? null : isEmptyFirstPage ? 0 : count === 0 ? null : page,
      from,
      to,
      hasPrev,
      hasNext,
    }
  }

  const totalPages = Math.floor(lastOffset / limit) + 1
  const isLastPage = offset === lastOffset
  const beyondLast = offset > lastOffset

  return {
    page,
    limit,
    offset,
    count,
    totalItems: isLastPage ? offset + count : lastOffset + limit,
    isTotalEstimate: !isLastPage,
    totalPages,
    from,
    to,
    hasPrev,
    hasNext: !isLastPage && !beyondLast,
  }
}

export type PageToken = number | 'ellipsis'

/**
 * Daftar nomor halaman untuk kontrol pagination, maksimum 7 slot.
 * Contoh (total 10): [1,2,3,4,5,…,10], [1,…,4,5,6,…,10], [1,…,6,7,8,9,10].
 */
export function getPageNumbers(current: number, total: number): PageToken[] {
  if (total <= 0) return []
  const range = (start: number, end: number): number[] =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  if (total <= 7) return range(1, total)
  if (current <= 4) return [...range(1, 5), 'ellipsis', total]
  if (current >= total - 3) return [1, 'ellipsis', ...range(total - 4, total)]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

/** Teks rentang data (FR-3.1): "Menampilkan 1-12 dari 48 data". */
export function rangeText(meta: PageMeta): string {
  if (meta.count === 0) return 'Tidak ada data yang ditampilkan'
  if (meta.totalItems === null) return `Menampilkan ${meta.from}-${meta.to} dari ${meta.to}+ data`
  const total = meta.isTotalEstimate ? `±${meta.totalItems}` : String(meta.totalItems)
  return `Menampilkan ${meta.from}-${meta.to} dari ${total} data`
}
