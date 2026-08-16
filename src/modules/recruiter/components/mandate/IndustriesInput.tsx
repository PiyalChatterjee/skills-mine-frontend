import { useEffect, useRef, useState, useCallback } from 'react'
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import type { Industry } from '@/types/api'
import { industryApi } from '@/services/api/industryApi'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
}

export const IndustriesInput = ({ control, errors }: Props) => {
  const [allIndustries, setAllIndustries] = useState<Industry[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // ── Fetch industries once on mount ──────────────────────────────────
  useEffect(() => {
    industryApi
      .getIndustries()
      .then((envelope) => setAllIndustries(envelope.data))
      .catch(() => {
        // silently degrade — user can still type free text
      })
  }, [])

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Industries</h2>
      <Controller
        name="industries"
        control={control}
        render={({ field }) => {
          const industries: string[] = field.value as string[]

          // Suggestions: match input, exclude already-selected
          const suggestions = allIndustries.filter(
            (ind) =>
              ind.name.toLowerCase().includes(inputValue.toLowerCase()) &&
              !industries.includes(ind.name),
          )

          const addIndustry = useCallback(
            (val: string) => {
              const trimmed = val.trim()
              if (!trimmed || industries.includes(trimmed)) return
              field.onChange([...industries, trimmed])
              setInputValue('')
              setIsTyping(false)
              setActiveIndex(-1)
            },
            [industries, field],
          )

          const removeIndustry = (idx: number) => {
            field.onChange(industries.filter((_, i) => i !== idx))
          }

          const openInput = () => {
            setIsTyping(true)
            setActiveIndex(-1)
            setTimeout(() => inputRef.current?.focus(), 0)
          }

          const closeInput = () => {
            setIsTyping(false)
            setInputValue('')
            setActiveIndex(-1)
          }

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((prev) => Math.max(prev - 1, -1))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              if (activeIndex >= 0 && suggestions[activeIndex]) {
                addIndustry(suggestions[activeIndex].name)
              } else if (inputValue.trim()) {
                addIndustry(inputValue)
              }
            } else if (e.key === 'Escape') {
              closeInput()
            }
          }

          const handleBlur = () => {
            // Delay so click on a suggestion registers before blur fires
            setTimeout(() => {
              if (!listRef.current?.contains(document.activeElement)) {
                closeInput()
              }
            }, 150)
          }

          return (
            <div className={styles.field}>
              <div className={styles.chipRow}>
                {industries.map((industry, i) => (
                  <span
                    key={industry + i}
                    className={`${styles.chip} ${styles.industryChip}`}
                  >
                    {industry}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => removeIndustry(i)}
                      aria-label={`Remove ${industry}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isTyping ? (
                  <span className={styles.industryAutocompleteWrap}>
                    <span className={styles.chipInputWrap}>
                      <input
                        ref={inputRef}
                        type="text"
                        className={styles.chipInput}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value)
                          setActiveIndex(-1)
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        placeholder="Search industry…"
                        autoFocus
                        autoComplete="off"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={suggestions.length > 0}
                        aria-activedescendant={
                          activeIndex >= 0
                            ? `industry-option-${activeIndex}`
                            : undefined
                        }
                      />
                    </span>

                    {suggestions.length > 0 && (
                      <ul
                        ref={listRef}
                        className={styles.industryDropdown}
                        role="listbox"
                        aria-label="Industry suggestions"
                      >
                        {suggestions.map((ind, idx) => (
                          <li
                            key={ind.industryId}
                            id={`industry-option-${idx}`}
                            role="option"
                            aria-selected={idx === activeIndex}
                            className={`${styles.industryOption} ${idx === activeIndex ? styles.industryOptionActive : ''}`}
                            onMouseDown={(e) => {
                              // prevent blur from firing before click
                              e.preventDefault()
                              addIndustry(ind.name)
                            }}
                            onMouseEnter={() => setActiveIndex(idx)}
                          >
                            {ind.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.addChipBtn}
                    onClick={openInput}
                  >
                    + Add Industry
                  </button>
                )}
              </div>

              {errors.industries && (
                <p className={styles.errorText}>
                  {typeof errors.industries.message === 'string'
                    ? errors.industries.message
                    : 'At least one industry is required'}
                </p>
              )}
            </div>
          )
        }}
      />
    </section>
  )
}
