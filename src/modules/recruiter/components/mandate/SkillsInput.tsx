import { useRef, useState, useCallback } from 'react'
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
}

const CHIP_COLORS = [
  styles.skillChip0,
  styles.skillChip1,
  styles.skillChip2,
  styles.skillChip3,
  styles.skillChip4,
]

const MAX_SKILLS = 30

export const SkillsInput = ({ control, errors }: Props) => {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Skills</h2>
      <Controller
        name="skills"
        control={control}
        render={({ field }) => {
          const skills: string[] = field.value as string[]

          const addSkill = useCallback((val: string) => {
            const trimmed = val.trim()
            if (!trimmed || skills.includes(trimmed) || skills.length >= MAX_SKILLS) return
            field.onChange([...skills, trimmed])
            setInputValue('')
            setIsTyping(false)
          }, [skills, field])

          const removeSkill = (idx: number) => {
            field.onChange(skills.filter((_, i) => i !== idx))
          }

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSkill(inputValue)
            }
            if (e.key === 'Escape') {
              setInputValue('')
              setIsTyping(false)
            }
          }

          return (
            <div className={styles.field}>
              <div className={styles.chipRow}>
                {skills.map((skill, i) => (
                  <span key={skill} className={`${styles.chip} ${CHIP_COLORS[i % CHIP_COLORS.length]}`}>
                    {skill}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => removeSkill(i)}
                      aria-label={`Remove ${skill}`}
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
                        if (inputValue.trim()) addSkill(inputValue)
                        else { setIsTyping(false); setInputValue('') }
                      }}
                      placeholder="Type & press Enter"
                      autoFocus
                    />
                  </span>
                ) : (
                  skills.length < MAX_SKILLS && (
                    <button
                      type="button"
                      className={styles.addChipBtn}
                      onClick={() => { setIsTyping(true); setTimeout(() => inputRef.current?.focus(), 0) }}
                    >
                      + Add skill
                    </button>
                  )
                )}
              </div>
              {errors.skills && (
                <p className={styles.errorText}>
                  {typeof errors.skills.message === 'string' ? errors.skills.message : 'At least one skill is required'}
                </p>
              )}
            </div>
          )
        }}
      />
    </section>
  )
}
