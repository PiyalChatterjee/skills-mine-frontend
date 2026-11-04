import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './AdzunaControls.module.css'

type CardProps = {
  title: string
  aside?: ReactNode
  children: ReactNode
}

/** White card with the red marker + title header used throughout the Adzuna screen. */
export const AzCard = ({ title, aside, children }: CardProps) => (
  <section className={styles.card}>
    <header className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>
        <span className={styles.marker} aria-hidden="true" />
        {title}
      </h2>
      {aside}
    </header>
    {children}
  </section>
)

type FieldProps = {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  className?: string
  /** Render a div instead of a label when the control holds its own buttons. */
  group?: boolean
}

export const AzField = ({ label, required, hint, children, className, group }: FieldProps) => {
  const Root = group ? 'div' : 'label'
  return (
    <Root className={`${styles.field} ${className ?? ''}`}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </Root>
  )
}

export const AzInput = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${styles.input} ${className ?? ''}`} {...rest} />
)

const Chevron = () => (
  <svg className={styles.chevron} width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 3.5L5 6.5l3-3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type SelectProps = {
  value: string
  options: string[]
  onChange: (value: string) => void
  ariaLabel: string
}

export const AzSelect = ({ value, options, onChange, ariaLabel }: SelectProps) => {
  const items = value && !options.includes(value) ? [value, ...options] : options
  return (
    <span className={styles.selectWrap}>
      <select
        aria-label={ariaLabel}
        className={`${styles.input} ${styles.select}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {!value && <option value="" disabled />}
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <Chevron />
    </span>
  )
}

type ChipSelectProps = {
  values: string[]
  options: string[]
  onChange: (values: string[]) => void
  ariaLabel: string
  addLabel: string
}

export const AzChipSelect = ({ values, options, onChange, ariaLabel, addLabel }: ChipSelectProps) => {
  const remaining = options.filter((option) => !values.includes(option))
  return (
    <span className={`${styles.input} ${styles.chipBox}`}>
      {values.map((value) => (
        <span key={value} className={styles.chip}>
          {value}
          <button
            type="button"
            className={styles.chipRemove}
            aria-label={`Remove ${value}`}
            onClick={() => onChange(values.filter((item) => item !== value))}
          >
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
      {remaining.length > 0 && (
        <select
          aria-label={ariaLabel}
          className={styles.addSelect}
          value=""
          onChange={(event) => event.target.value && onChange([...values, event.target.value])}
        >
          <option value="">{addLabel}</option>
          {remaining.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </span>
  )
}
