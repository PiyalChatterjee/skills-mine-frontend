import { useGetIndustriesQuery } from '@/store/api/apiSlice'

export const useIndustryOptions = (fallbackOptions: readonly string[] = []) => {
  const { data } = useGetIndustriesQuery()

  return data && data.length > 0 ? data : [...fallbackOptions]
}