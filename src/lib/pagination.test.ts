import { describe, expect, it } from 'vitest'
import {
  getPageNumbers,
  getPaginationMeta,
  offsetFromLink,
  rangeText,
  toOffset,
} from './pagination'

const BASE = 'https://api-v3.mbta.com/vehicles?page[limit]=2'

describe('offsetFromLink', () => {
  it('membaca page[offset] dari URL biasa maupun ter-encode', () => {
    expect(offsetFromLink(`${BASE}&page[offset]=566`)).toBe(566)
    expect(
      offsetFromLink('https://api-v3.mbta.com/vehicles?page%5Blimit%5D=2&page%5Boffset%5D=12'),
    ).toBe(12)
  })

  it('mengembalikan null bila tidak ada atau tidak valid', () => {
    expect(offsetFromLink(undefined)).toBeNull()
    expect(offsetFromLink(null)).toBeNull()
    expect(offsetFromLink(BASE)).toBeNull()
    expect(offsetFromLink(`${BASE}&page[offset]=abc`)).toBeNull()
    expect(offsetFromLink('bukan url')).toBeNull()
  })
})

describe('toOffset', () => {
  it('menghitung offset = (page - 1) * limit', () => {
    expect(toOffset(1, 12)).toBe(0)
    expect(toOffset(3, 12)).toBe(24)
    expect(toOffset(0, 12)).toBe(0)
  })
})

describe('getPaginationMeta (bentuk links MBTA, diverifikasi 27 Okt 2026)', () => {
  it('halaman pertama dari banyak halaman: total pasti untuk halaman, perkiraan untuk item', () => {
    const meta = getPaginationMeta({
      page: 1,
      limit: 2,
      count: 2,
      links: {
        first: `${BASE}&page[offset]=0`,
        last: `${BASE}&page[offset]=566`,
        next: `${BASE}&page[offset]=2`,
      },
    })
    expect(meta).toMatchObject({
      from: 1,
      to: 2,
      totalPages: 284,
      totalItems: 568,
      isTotalEstimate: true,
      hasPrev: false,
      hasNext: true,
    })
  })

  it('halaman terakhir: total item pasti dari offset + jumlah data', () => {
    const meta = getPaginationMeta({
      page: 284,
      limit: 2,
      count: 1,
      links: {
        first: `${BASE}&page[offset]=0`,
        last: `${BASE}&page[offset]=566`,
        prev: `${BASE}&page[offset]=564`,
      },
    })
    expect(meta).toMatchObject({
      from: 567,
      to: 567,
      totalPages: 284,
      totalItems: 567,
      isTotalEstimate: false,
      hasPrev: true,
      hasNext: false,
    })
  })

  it('semua data muat dalam satu halaman (last offset 0)', () => {
    const meta = getPaginationMeta({
      page: 1,
      limit: 48,
      count: 21,
      links: { first: 'x?page[offset]=0', last: 'x?page[offset]=0' },
    })
    expect(meta).toMatchObject({
      totalPages: 1,
      totalItems: 21,
      isTotalEstimate: false,
      hasNext: false,
      hasPrev: false,
    })
  })

  it('respons kosong (links null) menghasilkan 0 data dan 0 halaman', () => {
    const meta = getPaginationMeta({ page: 1, limit: 12, count: 0, links: null })
    expect(meta).toMatchObject({
      from: 0,
      to: 0,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    })
  })

  it('offset melewati halaman terakhir: data kosong, hasNext false, totalPages tetap diketahui', () => {
    const meta = getPaginationMeta({
      page: 4501,
      limit: 2,
      count: 0,
      links: {
        first: `${BASE}&page[offset]=0`,
        last: `${BASE}&page[offset]=566`,
        prev: `${BASE}&page[offset]=8998`,
      },
    })
    expect(meta).toMatchObject({ totalPages: 284, hasNext: false, hasPrev: true, from: 0, to: 0 })
    expect(meta.page).toBeGreaterThan(meta.totalPages ?? 0)
  })

  it('tanpa links.last: total tidak diketahui, andalkan links.next', () => {
    const withNext = getPaginationMeta({
      page: 2,
      limit: 12,
      count: 12,
      links: { next: 'x?page[offset]=24' },
    })
    expect(withNext).toMatchObject({
      from: 13,
      to: 24,
      totalItems: null,
      totalPages: null,
      hasNext: true,
    })

    const withoutNext = getPaginationMeta({ page: 2, limit: 12, count: 5, links: {} })
    expect(withoutNext).toMatchObject({
      from: 13,
      to: 17,
      totalItems: 17,
      totalPages: 2,
      hasNext: false,
    })
  })
})

describe('getPageNumbers', () => {
  it('menampilkan semua halaman bila 7 atau kurang', () => {
    expect(getPageNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(getPageNumbers(3, 3)).toEqual([1, 2, 3])
    expect(getPageNumbers(1, 0)).toEqual([])
  })

  it('memakai elipsis di kanan saat di awal', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
    expect(getPageNumbers(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
  })

  it('memakai elipsis di kiri saat di akhir', () => {
    expect(getPageNumbers(10, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10])
    expect(getPageNumbers(7, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10])
  })

  it('memakai elipsis di kedua sisi saat di tengah', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
    expect(getPageNumbers(50, 284)).toEqual([1, 'ellipsis', 49, 50, 51, 'ellipsis', 284])
  })
})

describe('rangeText', () => {
  const base = {
    page: 1,
    limit: 12,
    offset: 0,
    count: 12,
    from: 1,
    to: 12,
    hasPrev: false,
    hasNext: true,
  }

  it('total pasti', () => {
    expect(rangeText({ ...base, totalItems: 48, totalPages: 4, isTotalEstimate: false })).toBe(
      'Menampilkan 1-12 dari 48 data',
    )
  })

  it('total perkiraan ditandai ±', () => {
    expect(rangeText({ ...base, totalItems: 48, totalPages: 4, isTotalEstimate: true })).toBe(
      'Menampilkan 1-12 dari ±48 data',
    )
  })

  it('total tidak diketahui memakai N+', () => {
    expect(
      rangeText({
        ...base,
        page: 2,
        offset: 12,
        from: 13,
        to: 24,
        totalItems: null,
        totalPages: null,
        isTotalEstimate: false,
      }),
    ).toBe('Menampilkan 13-24 dari 24+ data')
  })

  it('tanpa data', () => {
    expect(
      rangeText({
        ...base,
        count: 0,
        from: 0,
        to: 0,
        totalItems: 0,
        totalPages: 0,
        isTotalEstimate: false,
        hasNext: false,
      }),
    ).toBe('Tidak ada data yang ditampilkan')
  })
})
