import { Box, MenuItem, TextField, Typography } from '@mui/material'
import type { ChangeEvent, ReactNode } from 'react'
import chevronDownIcon from '@/assets/cv-builder/chevron-down.svg'
import styles from '../pages/CvBuilderPage.module.css'

export type FieldSpan = 'full' | 'two' | 'one'

type CvBuilderFormPanelProps = {
  children: ReactNode
}

type CvBuilderSectionHeaderProps = {
  iconSrc: string
  title: string
}

type CvBuilderLabeledFieldProps = {
  label: string
  span?: FieldSpan
  children: ReactNode
}

type CvBuilderSelectFieldProps = {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  options: string[]
  span?: FieldSpan
  allowEmptyOption?: boolean
  emptyLabel?: string
  displayEmpty?: boolean
  error?: boolean
  helperText?: string
}

const spanClassNameMap: Record<FieldSpan, string> = {
  full: styles.fieldGroupFull,
  two: styles.fieldGroupTwo,
  one: styles.fieldGroupOne,
}

const renderSelectValue = (value: unknown, emptyLabel: string) =>
  value ? String(value) : <span className={styles.placeholderText}>{emptyLabel}</span>

type SelectChevronIconProps = {
  className?: string
}

export const SelectChevronIcon = ({ className }: SelectChevronIconProps) => (
  <Box component="img" src={chevronDownIcon} alt="" className={className} aria-hidden="true" />
)

export const CvBuilderFormPanel = ({ children }: CvBuilderFormPanelProps) => (
  <Box className={styles.formPanel}>{children}</Box>
)

export const CvBuilderSectionHeader = ({ iconSrc, title }: CvBuilderSectionHeaderProps) => (
  <Box className={styles.formHeader}>
    <Box className={styles.formIconBadge} aria-hidden="true">
      <Box component="img" src={iconSrc} alt="" className={styles.formIcon} />
    </Box>
    <Typography component="h2" className={styles.sectionTitle}>
      {title}
    </Typography>
  </Box>
)

export const CvBuilderLabeledField = ({
  label,
  span = 'one',
  children,
}: CvBuilderLabeledFieldProps) => (
  <Box className={`${styles.fieldGroup} ${spanClassNameMap[span]}`}>
    <Typography component="label" className={styles.fieldLabel}>
      {label}
    </Typography>
    {children}
  </Box>
)

export const CvBuilderSelectField = ({
  label,
  value,
  onChange,
  options,
  span = 'one',
  allowEmptyOption = true,
  emptyLabel = 'Select',
  displayEmpty = true,
  error = false,
  helperText,
}: CvBuilderSelectFieldProps) => (
  <CvBuilderLabeledField label={label} span={span}>
    <TextField
      select
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      className={styles.fieldControl}
      variant="outlined"
      fullWidth
      slotProps={{
        select: {
          IconComponent: SelectChevronIcon,
          ...(displayEmpty
            ? {
                displayEmpty: true,
                renderValue: (selectedValue: unknown) => renderSelectValue(selectedValue, emptyLabel),
              }
            : {}),
        },
      }}
    >
      {allowEmptyOption ? <MenuItem value=""><span className={styles.placeholderText}>{emptyLabel}</span></MenuItem> : null}
      {options.map((option) => (
        <MenuItem key={option} value={option}>{option}</MenuItem>
      ))}
    </TextField>
  </CvBuilderLabeledField>
)
