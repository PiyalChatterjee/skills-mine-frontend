import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './FormControls.module.css'

type FieldProps = {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  className?: string
  /** Use a div instead of a label when the control contains buttons (a label would forward clicks to the first one). */
  group?: boolean
}

export const Field = ({ label, required, hint, children, className, group }: FieldProps) => {
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

export const TextInput = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${styles.input} ${className ?? ''}`} {...rest} />
)

const DoubleChevron = () => (
  <svg className={styles.doubleChevron} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M1.5 2.5L5 5.2l3.5-2.7M1.5 5.5L5 8.2l3.5-2.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Chevron = () => (
  <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 3.5L5 6.5l3-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type SelectFieldProps = {
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel: string
}

export const SelectField = ({ value, options, onChange, placeholder, ariaLabel }: SelectFieldProps) => {
  const items = value && !options.includes(value) ? [value, ...options] : options
  return (
    <span className={styles.selectWrap}>
      <select
        aria-label={ariaLabel}
        className={`${styles.input} ${styles.select}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <DoubleChevron />
    </span>
  )
}

type ChipSelectProps = {
  values: string[]
  options: string[]
  onChange: (values: string[]) => void
  ariaLabel: string
}

export const ChipSelect = ({ values, options, onChange, ariaLabel }: ChipSelectProps) => {
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
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
      <select
        aria-label={ariaLabel}
        className={styles.chipSelect}
        value=""
        onChange={(event) => event.target.value && onChange([...values, event.target.value])}
      >
        <option value="" />
        {remaining.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Chevron />
    </span>
  )
}
