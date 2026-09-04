import { useGetLocationsQuery } from '@/store/api/apiSlice'

export const useLocationOptions = (fallbackOptions: readonly string[] = []) => {
  const { data } = useGetLocationsQuery()

  return data && data.length > 0 ? data : [...fallbackOptions]
}
