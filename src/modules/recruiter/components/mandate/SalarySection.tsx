import type { Control } from 'react-hook-form'
import { Controller, useFormState } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
}

export const SalarySection = ({ control }: Props) => {
  const { errors } = useFormState({ control })

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Salary Range (ZAR)</h2>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Minimum *</label>
          <Controller
            name="salaryMin"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                className={`${styles.input} ${errors.salaryMin ? styles.hasError : ''}`}
                placeholder="0"
                onChange={e => field.onChange(e.target.valueAsNumber)}
              />
            )}
          />
          {errors.salaryMin && <p className={styles.errorText}>{errors.salaryMin.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Maximum *</label>
          <Controller
            name="salaryMax"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                className={`${styles.input} ${errors.salaryMax ? styles.hasError : ''}`}
                placeholder="0"
                onChange={e => field.onChange(e.target.valueAsNumber)}
              />
            )}
          />
          {errors.salaryMax && <p className={styles.errorText}>{errors.salaryMax.message}</p>}
        </div>
      </div>
      <Controller
        name="isSalaryHidden"
        control={control}
        render={({ field }) => (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={field.value}
              onChange={e => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            Hide salary range from candidate
          </label>
        )}
      />
    </section>
  )
}
