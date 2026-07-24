import { useState, type ChangeEvent } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

type UseSearchQueryStateOptions = {
  minCharacters?: number
  debounceMs?: number
  initialValue?: string
}

export const useSearchQueryState = ({
  minCharacters = 3,
  debounceMs = 250,
  initialValue = '',
}: UseSearchQueryStateOptions = {}) => {
  const [inputValue, setInputValue] = useState(initialValue)
  const normalizedValue = inputValue.trim()
  const debouncedValue = useDebouncedValue(normalizedValue, debounceMs)

  const shouldFilter = normalizedValue.length >= minCharacters
  const shouldUseDebouncedQuery = debouncedValue.length >= minCharacters

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const clear = () => {
    setInputValue('')
  }

  return {
    inputValue,
    normalizedValue,
    debouncedValue,
    shouldFilter,
    shouldUseDebouncedQuery,
    handleInputChange,
    clear,
    setInputValue,
  }
}