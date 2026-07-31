import {
  useQuery,
  type QueryFunction,
  type QueryKey,
  type UseQueryResult,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { mapQueryError } from '@/app/queryErrorHandler'
import type { ApiError } from '@/types'

type StandardQueryOptions<TQueryFnData, TData, TKey extends QueryKey> = Omit<
  UseQueryOptions<TQueryFnData, ApiError, TData, TKey>,
  'queryKey' | 'queryFn'
> & {
  onSuccess?: (data: TData) => void
  onError?: (error: ApiError) => void
}

export function useStandardQuery<TQueryFnData, TData = TQueryFnData, TKey extends QueryKey = QueryKey>(
  queryKey: TKey,
  queryFn: QueryFunction<TQueryFnData, TKey>,
  options?: StandardQueryOptions<TQueryFnData, TData, TKey>,
): UseQueryResult<TData, ApiError> {
  const { onSuccess, onError, ...queryOptions } = options ?? {}
  const lastDataUpdateRef = useRef(0)
  const lastErrorUpdateRef = useRef(0)

  const query = useQuery<TQueryFnData, ApiError, TData, TKey>({
    queryKey,
    queryFn,
    ...queryOptions,
    throwOnError: false,
    meta: {
      ...queryOptions.meta,
      handledError: true,
    },
  })

  useEffect(() => {
    if (!onSuccess) return
    if (!query.isSuccess) return
    if (query.dataUpdatedAt <= lastDataUpdateRef.current) return

    lastDataUpdateRef.current = query.dataUpdatedAt
    onSuccess(query.data)
  }, [onSuccess, query.data, query.dataUpdatedAt, query.isSuccess])

  useEffect(() => {
    if (!onError) return
    if (!query.isError) return
    if (query.errorUpdatedAt <= lastErrorUpdateRef.current) return

    lastErrorUpdateRef.current = query.errorUpdatedAt
    onError(query.error)
  }, [onError, query.error, query.errorUpdatedAt, query.isError])

  return query
}

export { mapQueryError }
