import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
}

export const SalarySection = ({ control, errors }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>Salary Range (ZAR)</h2>
    <div className={styles.row}>
      <div className={styles.field}>
        <label className={styles.label}>Minimum</label>
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
        <label className={styles.label}>Maximum</label>
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
  </section>
)
