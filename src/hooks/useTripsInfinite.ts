import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { getTrips } from '../api/trips'
import { queryKeys } from '../lib/queryKeys'
import { getErrorMessage } from '../lib/errors'
import { OPTIONS_STALE_TIME } from './useRoutesInfinite'

/**
 * Opsi trip dengan infinite scroll, dipersempit oleh rute terpilih (FR-4.6).
 * Nonaktif bila belum ada rute, karena MBTA menolak /trips tanpa filter (R-3).
 */
export function useTripsInfinite(routes: string[]) {
  const enabled = routes.length > 0

  const query = useInfiniteQuery({
    queryKey: queryKeys.trips(routes),
    queryFn: ({ pageParam, signal }) => getTrips({ routes, offset: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: OPTIONS_STALE_TIME,
    enabled,
  })

  const options = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data])

  const { fetchNextPage, refetch, isFetchNextPageError } = query
  const retry = useCallback(() => {
    if (isFetchNextPageError) void fetchNextPage()
    else void refetch()
  }, [fetchNextPage, refetch, isFetchNextPageError])
  const loadMore = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])

  return {
    enabled,
    options,
    hasMore: enabled && query.hasNextPage,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    error: query.error ? getErrorMessage(query.error) : undefined,
    loadMore,
    retry,
  }
}
