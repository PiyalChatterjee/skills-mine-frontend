import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
}

const WORK_TYPES = ['Remote', 'Hybrid', 'On-site'] as const
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Temporary'] as const
const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'] as const
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const

const todayStr = new Date().toISOString().split('T')[0]

export const BasicInformationSection = ({ control, errors }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>Basic Information</h2>

    {/* Company Name */}
    <div className={styles.field}>
      <label className={styles.label}>Company Name *</label>
      <Controller
        name="companyName"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            className={`${styles.input} ${errors.companyName ? styles.hasError : ''}`}
            placeholder="Enter company name"
          />
        )}
      />
      {errors.companyName && <p className={styles.errorText}>{errors.companyName.message}</p>}
    </div>

    {/* Position Title */}
    <div className={styles.field}>
      <label className={styles.label}>Position Title *</label>
      <Controller
        name="positionTitle"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            className={`${styles.input} ${errors.positionTitle ? styles.hasError : ''}`}
            placeholder="Enter position title"
          />
        )}
      />
      {errors.positionTitle && <p className={styles.errorText}>{errors.positionTitle.message}</p>}
    </div>

    {/* Location + Fill By Date */}
    <div className={styles.row}>
      <div className={styles.field}>
        <label className={styles.label}>Location</label>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className={styles.input}
              placeholder="Johannesburg, Gauteng"
            />
          )}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Fill By Date *</label>
        <Controller
          name="fillByDate"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="date"
              min={todayStr}
              className={`${styles.input} ${errors.fillByDate ? styles.hasError : ''}`}
            />
          )}
        />
        {errors.fillByDate && <p className={styles.errorText}>{errors.fillByDate.message}</p>}
      </div>
    </div>

    {/* Work Type + Employment Type */}
    <div className={styles.row}>
      <div className={styles.field}>
        <label className={styles.label}>Work Type</label>
        <div className={styles.selectWrap}>
          <Controller
            name="workType"
            control={control}
            render={({ field }) => (
              <select {...field} className={`${styles.select} ${errors.workType ? styles.hasError : ''}`}>
                <option value="">Select...</option>
                {WORK_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          />
        </div>
        {errors.workType && <p className={styles.errorText}>{errors.workType.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Employment Type</label>
        <div className={styles.selectWrap}>
          <Controller
            name="employmentType"
            control={control}
            render={({ field }) => (
              <select {...field} className={`${styles.select} ${errors.employmentType ? styles.hasError : ''}`}>
                <option value="">Select...</option>
                {EMPLOYMENT_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          />
        </div>
        {errors.employmentType && <p className={styles.errorText}>{errors.employmentType.message}</p>}
      </div>
    </div>

    {/* Experience Level + Priority */}
    <div className={styles.row}>
      <div className={styles.field}>
        <label className={styles.label}>Experience Level</label>
        <div className={styles.selectWrap}>
          <Controller
            name="experienceLevel"
            control={control}
            render={({ field }) => (
              <select {...field} className={`${styles.select} ${errors.experienceLevel ? styles.hasError : ''}`}>
                <option value="">Select...</option>
                {EXPERIENCE_LEVELS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          />
        </div>
        {errors.experienceLevel && <p className={styles.errorText}>{errors.experienceLevel.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Priority</label>
        <div className={styles.selectWrap}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <select {...field} className={`${styles.select} ${errors.priority ? styles.hasError : ''}`}>
                <option value="">Select...</option>
                {PRIORITIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          />
        </div>
        {errors.priority && <p className={styles.errorText}>{errors.priority.message}</p>}
      </div>
    </div>
  </section>
)
