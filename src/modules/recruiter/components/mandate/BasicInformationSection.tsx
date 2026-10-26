import { useEffect, useRef, useState } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { Controller, useFormState } from 'react-hook-form'
import type { MandateFormValues } from './types'
import { mandateApi } from '@/services/api/mandateApi'
import { getPhoneNumberInputProps } from '@/app/phoneNumber'
import { LocationSelect } from './LocationSelect'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  setValue: UseFormSetValue<MandateFormValues>
}

/** Contact details keyed by company name (first post found per company is used) */
type ContactInfo = { name: string; email: string; phone: string; clientRate: string }

const WORK_TYPES = ['Remote', 'Hybrid', 'On-site'] as const
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Temporary', 'Freelance'] as const
const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'] as const
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const

const todayStr = new Date().toISOString().split('T')[0]

export const BasicInformationSection = ({ control, setValue }: Props) => {
  const { errors } = useFormState({ control })
  const [companyOptions, setCompanyOptions] = useState<string[]>([])
  const [contactMap, setContactMap] = useState<Map<string, ContactInfo>>(new Map())
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)

  // Fetch employers once on mount — build name list + contact map
  useEffect(() => {
    mandateApi
      .getCompanies()
      .then((companies) => {
        const names = companies.map((company) => company.clientName).sort()
        setCompanyOptions(names)

        const map = new Map<string, ContactInfo>()
        for (const company of companies) {
          map.set(company.clientName, {
            name: company.contactName,
            email: company.contactEmail,
            phone: company.contactPhoneNumber,
            clientRate: '',
          })
        }
        setContactMap(map)
      })
      .catch(() => {
        // silently degrade — user can still type a new name
      })
  }, [])

  /** When a known company is selected, populate the contact fields and client rate */
  const applyContactInfo = (companyName: string) => {
    const info = contactMap.get(companyName)
    if (!info) return
    setValue('contactPerson',      info.name,       { shouldValidate: true, shouldDirty: true })
    setValue('contactPersonEmail', info.email,      { shouldValidate: true, shouldDirty: true })
    setValue('contactPersonPhone', info.phone,      { shouldValidate: true, shouldDirty: true })
    setValue('clientRate',         info.clientRate, { shouldValidate: true, shouldDirty: true })
  }

  return (
  <>
    {/* ── Company Information ── */}
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Company Information</h2>

      {/* Company Name + Client Rate */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Company Name *</label>
          <Controller
            name="companyName"
            control={control}
            render={({ field }) => {
              const inputVal = field.value as string

              // Filter to names that contain the typed text (case-insensitive)
              const suggestions = companyOptions.filter((name) =>
                name.toLowerCase().includes(inputVal.toLowerCase()),
              )

              const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (!showSuggestions) return
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActiveIndex((prev) => Math.max(prev - 1, -1))
                } else if (e.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
                  e.preventDefault()
                  field.onChange(suggestions[activeIndex])
                  applyContactInfo(suggestions[activeIndex])
                  setShowSuggestions(false)
                  setActiveIndex(-1)
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false)
                  setActiveIndex(-1)
                }
              }

              const handleBlur = () => {
                // Delay so a suggestion click registers before blur fires
                setTimeout(() => {
                  if (!listRef.current?.contains(document.activeElement)) {
                    setShowSuggestions(false)
                    setActiveIndex(-1)
                  }
                }, 150)
                field.onBlur()
              }

              return (
                <div style={{ position: 'relative' }}>
                  <input
                    {...field}
                    className={`${styles.input} ${errors.companyName ? styles.hasError : ''}`}
                    placeholder="Company Name"
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                    aria-activedescendant={
                      activeIndex >= 0 ? `company-option-${activeIndex}` : undefined
                    }
                    onChange={(e) => {
                      field.onChange(e)
                      setShowSuggestions(true)
                      setActiveIndex(-1)
                    }}
                    onFocus={() => {
                      setShowSuggestions(true)
                      setActiveIndex(-1)
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <ul
                      ref={listRef}
                      className={`${styles.industryDropdown} ${styles.companyDropdown}`}
                      role="listbox"
                      aria-label="Company name suggestions"
                    >
                      {suggestions.map((name, idx) => (
                        <li
                          key={name}
                          id={`company-option-${idx}`}
                          role="option"
                          aria-selected={idx === activeIndex}
                          className={`${styles.industryOption} ${idx === activeIndex ? styles.industryOptionActive : ''}`}
                          onMouseDown={(e) => {
                            // prevent blur from firing before click
                            e.preventDefault()
                            field.onChange(name)
                            applyContactInfo(name)
                            setShowSuggestions(false)
                            setActiveIndex(-1)
                          }}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            }}
          />
          {errors.companyName && <p className={styles.errorText}>{errors.companyName.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Client Rate *</label>
          <Controller
            name="clientRate"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className={`${styles.input} ${errors.clientRate ? styles.hasError : ''}`}
                placeholder="R/h"
              />
            )}
          />
          {errors.clientRate && <p className={styles.errorText}>{errors.clientRate.message}</p>}
        </div>
      </div>

      {/* Contact Person */}
      <div className={styles.field}>
        <label className={styles.label}>Contact Person *</label>
        <Controller
          name="contactPerson"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className={`${styles.input} ${errors.contactPerson ? styles.hasError : ''}`}
              placeholder="Contact Person"
            />
          )}
        />
        {errors.contactPerson && <p className={styles.errorText}>{errors.contactPerson.message}</p>}
      </div>

      {/* Contact Person Email + Contact Person Phone Number */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Contact Person Email *</label>
          <Controller
            name="contactPersonEmail"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                inputMode="email"
                autoComplete="email"
                className={`${styles.input} ${errors.contactPersonEmail ? styles.hasError : ''}`}
                placeholder="Contact Person Email"
              />
            )}
          />
          {errors.contactPersonEmail && (
            <p className={styles.errorText}>{errors.contactPersonEmail.message}</p>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Contact Person Phone Number *</label>
          <Controller
            name="contactPersonPhone"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                {...getPhoneNumberInputProps(field.value, field.onChange)}
                inputMode="numeric"
                autoComplete="tel-national"
                aria-label="Contact Person Phone Number"
                className={`${styles.input} ${errors.contactPersonPhone ? styles.hasError : ''}`}
                placeholder="Contact Person Phone Number"
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.contactPersonPhone && (
            <p className={styles.errorText}>{errors.contactPersonPhone.message}</p>
          )}
        </div>
      </div>
    </section>

    {/* ── Position Details ── */}
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Position Details</h2>

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
              placeholder="Position Title"
            />
          )}
        />
        {errors.positionTitle && <p className={styles.errorText}>{errors.positionTitle.message}</p>}
      </div>

      {/* Location + Fill By Date */}
      <div className={styles.row}>
        <LocationSelect control={control} setValue={setValue} />
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
          <label className={styles.label}>Work Type *</label>
          <div className={styles.selectWrap}>
            <Controller
              name="workType"
              control={control}
              render={({ field }) => (
                <select {...field} className={`${styles.select} ${errors.workType ? styles.hasError : ''}`}>
                  <option value="">Select</option>
                  {WORK_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
            />
          </div>
          {errors.workType && <p className={styles.errorText}>{errors.workType.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Employment Type *</label>
          <div className={styles.selectWrap}>
            <Controller
              name="employmentType"
              control={control}
              render={({ field }) => (
                <select {...field} className={`${styles.select} ${errors.employmentType ? styles.hasError : ''}`}>
                  <option value="">Select</option>
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
          <label className={styles.label}>Experience Level *</label>
          <div className={styles.selectWrap}>
            <Controller
              name="experienceLevel"
              control={control}
              render={({ field }) => (
                <select {...field} className={`${styles.select} ${errors.experienceLevel ? styles.hasError : ''}`}>
                  <option value="">Select</option>
                  {EXPERIENCE_LEVELS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
            />
          </div>
          {errors.experienceLevel && <p className={styles.errorText}>{errors.experienceLevel.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Priority *</label>
          <div className={styles.selectWrap}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <select {...field} className={`${styles.select} ${errors.priority ? styles.hasError : ''}`}>
                  <option value="">Select</option>
                  {PRIORITIES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
            />
          </div>
          {errors.priority && <p className={styles.errorText}>{errors.priority.message}</p>}
        </div>
      </div>
    </section>
  </>
  )
}
