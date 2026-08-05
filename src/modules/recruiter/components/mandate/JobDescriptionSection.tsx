import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
}

export const JobDescriptionSection = ({ control, errors }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>Job description</h2>
    <div className={styles.field}>
      <Controller
        name="jobDescription"
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            rows={5}
            className={`${styles.textarea} ${errors.jobDescription ? styles.hasError : ''}`}
            placeholder="Describe the role..."
          />
        )}
      />
      {errors.jobDescription && <p className={styles.errorText}>{errors.jobDescription.message}</p>}
    </div>
  </section>
)
