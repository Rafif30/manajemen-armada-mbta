import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { getRoutes } from '../api/routes'
import { queryKeys } from '../lib/queryKeys'
import { getErrorMessage } from '../lib/errors'

export const OPTIONS_STALE_TIME = 5 * 60_000

/** Opsi rute dengan infinite scroll (FR-4.3, FR-4.4). */
export function useRoutesInfinite(enabled = true) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.routes,
    queryFn: ({ pageParam, signal }) => getRoutes({ offset: pageParam, signal }),
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
    options,
    hasMore: query.hasNextPage,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    error: query.error ? getErrorMessage(query.error) : undefined,
    loadMore,
    retry,
  }
}
