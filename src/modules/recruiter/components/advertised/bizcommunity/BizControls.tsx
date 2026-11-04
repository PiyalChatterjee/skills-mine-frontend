import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './BizControls.module.css'

type BizFieldProps = {
  /** Floating (notched) label. Omit for fields whose caption is the placeholder itself. */
  label?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export const BizField = ({ label, required, children, className }: BizFieldProps) => (
  <label className={`${styles.field} ${className ?? ''}`}>
    {label && (
      <span className={styles.floatLabel}>
        {label}
        {required && ' *'}
      </span>
    )}
    {children}
  </label>
)

export const BizInput = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${styles.control} ${className ?? ''}`} {...rest} />
)

/** Currency input with the grey "R" prefix. */
export const BizRandInput = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <span className={styles.prefixWrap}>
    <span className={styles.prefix} aria-hidden="true">R</span>
    <input className={`${styles.control} ${styles.withPrefix} ${className ?? ''}`} inputMode="numeric" {...rest} />
  </span>
)

const Caret = () => (
  <svg className={styles.caret} width="8" height="5" viewBox="0 0 8 5" aria-hidden="true">
    <path d="M0 0h8L4 5z" fill="currentColor" />
  </svg>
)

type BizSelectProps = {
  value: string
  options: string[]
  onChange: (value: string) => void
  ariaLabel: string
  /** Text shown for the empty option */
  placeholder?: string
  disabled?: boolean
}

export const BizSelect = ({ value, options, onChange, ariaLabel, placeholder = '', disabled }: BizSelectProps) => {
  const items = value && !options.includes(value) ? [value, ...options] : options
  return (
    <span className={styles.selectWrap}>
      <select
        aria-label={ariaLabel}
        className={`${styles.control} ${styles.select}`}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <Caret />
    </span>
  )
}

type BizSwitchProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const BizSwitch = ({ label, checked, onChange }: BizSwitchProps) => (
  <div className={styles.switchRow}>
    <span id={`biz-switch-${label}`} className={styles.switchLabel}>{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`biz-switch-${label}`}
      className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.thumb} />
    </button>
  </div>
)
