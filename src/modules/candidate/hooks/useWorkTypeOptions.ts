import { useGetWorkOptionsQuery } from '@/store/api/apiSlice'

export const useWorkTypeOptions = () => {
  const { data } = useGetWorkOptionsQuery()

  return data ?? []
}