import { useRef, useState, useCallback } from 'react'
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
}

export const IndustriesInput = ({ control, errors }: Props) => {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Industries</h2>
      <Controller
        name="industries"
        control={control}
        render={({ field }) => {
          const industries: string[] = field.value as string[]

          const addIndustry = useCallback((val: string) => {
            const trimmed = val.trim()
            if (!trimmed || industries.includes(trimmed)) return
            field.onChange([...industries, trimmed])
            setInputValue('')
            setIsTyping(false)
          }, [industries, field])

          const removeIndustry = (idx: number) => {
            field.onChange(industries.filter((_, i) => i !== idx))
          }

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addIndustry(inputValue)
            }
            if (e.key === 'Escape') {
              setInputValue('')
              setIsTyping(false)
            }
          }

          return (
            <div className={styles.field}>
              <div className={styles.chipRow}>
                {industries.map((industry, i) => (
                  <span key={industry + i} className={`${styles.chip} ${styles.industryChip}`}>
                    {industry}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => removeIndustry(i)}
                      aria-label={`Remove ${industry}`}
                      style={{ color: '#57606a' }}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isTyping ? (
                  <span className={styles.chipInputWrap}>
                    <input
                      ref={inputRef}
                      type="text"
                      className={styles.chipInput}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => {
                        if (inputValue.trim()) addIndustry(inputValue)
                        else { setIsTyping(false); setInputValue('') }
                      }}
                      placeholder="Type & press Enter"
                      autoFocus
                    />
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.addChipBtn}
                    onClick={() => { setIsTyping(true); setTimeout(() => inputRef.current?.focus(), 0) }}
                  >
                    + Add Industry
                  </button>
                )}
              </div>
              {errors.industries && (
                <p className={styles.errorText}>
                  {typeof errors.industries.message === 'string' ? errors.industries.message : 'At least one industry is required'}
                </p>
              )}
            </div>
          )
        }}
      />
    </section>
  )
}
