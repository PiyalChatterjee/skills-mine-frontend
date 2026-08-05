import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
  name: keyof Pick<MandateFormValues, 'requirements' | 'responsibilities' | 'benefits'>
  label: string
  placeholder?: string
}

/** Reusable bullet textarea — used for Requirements, Responsibilities, Benefits */
export const BulletTextareaSection = ({ control, errors, name, label, placeholder }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{label}</h2>
    <div className={styles.field}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const lines = (field.value as string).split('\n').filter(l => l.trim())
          return (
            <>
              <textarea
                {...field}
                rows={5}
                className={`${styles.textarea} ${errors[name] ? styles.hasError : ''}`}
                placeholder={placeholder ?? `Enter each item on a new line...`}
                style={{ borderRadius: lines.length > 0 ? '8px 8px 0 0' : '8px' }}
              />
              {lines.length > 0 && (
                <div className={styles.bulletPreview}>
                  {lines.map((line, i) => (
                    <div key={i} className={styles.bulletItem}>
                      <span className={styles.bulletDot}>•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        }}
      />
      {errors[name] && <p className={styles.errorText}>{(errors[name] as { message?: string })?.message}</p>}
    </div>
  </section>
)
