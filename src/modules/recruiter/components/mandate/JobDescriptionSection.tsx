import type { Control } from 'react-hook-form'
import { Controller, useFormState } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
}

export const JobDescriptionSection = ({ control }: Props) => {
  const { errors } = useFormState({ control })

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Job description *</h2>
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
}
