import { useEffect, useState } from 'react'
import { industryApi } from '@/services/api/industryApi'

export const useIndustryOptions = (fallbackOptions: readonly string[] = []) => {
  const [options, setOptions] = useState<string[]>(() => [...fallbackOptions])

  useEffect(() => {
    let isMounted = true

    industryApi
      .getIndustries()
      .then((envelope) => {
        if (!isMounted) return

        const industryNames = envelope.data
          .map((industry) => industry.name)
          .filter(Boolean)

        setOptions(industryNames.length > 0 ? industryNames : [...fallbackOptions])
      })
      .catch(() => {
        if (isMounted) {
          setOptions([...fallbackOptions])
        }
      })

    return () => {
      isMounted = false
    }
  }, [fallbackOptions])

  return options
}