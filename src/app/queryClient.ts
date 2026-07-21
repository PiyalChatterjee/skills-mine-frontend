import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { mapQueryError } from './queryErrorHandler'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      mapQueryError(error)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      mapQueryError(error)
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
