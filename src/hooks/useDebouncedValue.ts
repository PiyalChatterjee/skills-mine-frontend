import { useEffect, useState } from 'react'

export const useDebouncedValue = <T>(value: T, delayMs = 250): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [delayMs, value])

  return debouncedValue
}