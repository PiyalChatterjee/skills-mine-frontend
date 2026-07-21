import {
  useQuery,
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { mapQueryError } from '@/app/queryErrorHandler'
import type { ApiError } from '@/types'

export function useStandardQuery<TQueryFnData, TData = TQueryFnData>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TQueryFnData, QueryKey>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, ApiError, TData, QueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<TQueryFnData, ApiError, TData, QueryKey>({
    queryKey,
    queryFn,
    ...options,
    throwOnError: false,
    meta: {
      ...options?.meta,
      handledError: true,
    },
  })
}

export { mapQueryError }
