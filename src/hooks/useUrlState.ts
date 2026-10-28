import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { parseUrlState, serializeUrlState, type UrlState } from '../lib/urlState'
import type { PageSize } from '../lib/pagination'

const URL_CHANGE_EVENT = 'app:urlchange'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange)
  window.addEventListener(URL_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(URL_CHANGE_EVENT, onChange)
  }
}

function getSnapshot(): string {
  return window.location.search
}

function getServerSnapshot(): string {
  return ''
}

type HistoryMode = 'push' | 'replace'

function writeUrl(next: UrlState, mode: HistoryMode): void {
  const search = serializeUrlState(next)
  const url = `${window.location.pathname}${search}${window.location.hash}`
  if (`${window.location.search}` === search) return
  if (mode === 'push') window.history.pushState(null, '', url)
  else window.history.replaceState(null, '', url)
  window.dispatchEvent(new Event(URL_CHANGE_EVENT))
}

/**
 * URL query string sebagai sumber kebenaran tunggal untuk filter, pagination,
 * dan kendaraan yang sedang dibuka (design 6.4).
 */
export function useUrlState() {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state = useMemo(() => parseUrlState(search), [search])

  const update = useCallback((patch: Partial<UrlState>, mode: HistoryMode = 'push') => {
    const current = parseUrlState(window.location.search)
    writeUrl({ ...current, ...patch }, mode)
  }, [])

  const setPage = useCallback((page: number) => update({ page: Math.max(1, page) }), [update])
  const setLimit = useCallback((limit: PageSize) => update({ limit, page: 1 }), [update])
  const setRoutes = useCallback(
    (routes: string[], trips?: string[]) =>
      update(trips ? { routes, trips, page: 1 } : { routes, page: 1 }),
    [update],
  )
  const setTrips = useCallback((trips: string[]) => update({ trips, page: 1 }), [update])
  const resetFilters = useCallback(() => update({ routes: [], trips: [], page: 1 }), [update])
  const setVehicle = useCallback(
    (vehicle: string | null) => update({ vehicle }, 'replace'),
    [update],
  )

  return { ...state, setPage, setLimit, setRoutes, setTrips, resetFilters, setVehicle }
}
