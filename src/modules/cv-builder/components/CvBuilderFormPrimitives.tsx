import { Box, MenuItem, TextField, Typography } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import chevronDownIcon from "@/assets/cv-builder/chevron-down.svg";
import styles from "../pages/CvBuilderPage.module.css";

export type FieldSpan = "full" | "two" | "one";

type CvBuilderFormPanelProps = {
  children: ReactNode;
};

type CvBuilderSectionHeaderProps = {
  iconSrc: string;
  title: string;
};

type CvBuilderLabeledFieldProps = {
  label: string;
  span?: FieldSpan;
  children: ReactNode;
  // Path matching the react-hook-form field name, used to scroll/focus this
  // field when it's the first error after a failed validation.
  fieldName?: string;
};

type CvBuilderSelectFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  options: string[];
  // Formats an option's raw (submitted) value into a human-readable label.
  getOptionLabel?: (option: string) => string;
  span?: FieldSpan;
  allowEmptyOption?: boolean;
  emptyLabel?: string;
  displayEmpty?: boolean;
  error?: boolean;
  helperText?: string;
  name?: string;
};

type CvBuilderControlledTextFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  span?: FieldSpan;
  placeholder?: string;
  showError?: boolean;
  rules?: RegisterOptions<TFieldValues>;
};

const spanClassNameMap: Record<FieldSpan, string> = {
  full: styles.fieldGroupFull,
  two: styles.fieldGroupTwo,
  one: styles.fieldGroupOne,
};

const toTitleCase = (label: string) =>
  label.replace(/\b\w/g, (character) => character.toUpperCase());

const renderSelectValue = (
  value: unknown,
  emptyLabel: string,
  getOptionLabel: (option: string) => string,
) =>
  value ? (
    getOptionLabel(String(value))
  ) : (
    <span className={styles.placeholderText}>{emptyLabel}</span>
  );

type SelectChevronIconProps = {
  className?: string;
};

export const SelectChevronIcon = ({ className }: SelectChevronIconProps) => (
  <Box
    component="img"
    src={chevronDownIcon}
    alt=""
    className={className}
    aria-hidden="true"
  />
);

export const CvBuilderFormPanel = ({ children }: CvBuilderFormPanelProps) => (
  <Box className={styles.formPanel}>{children}</Box>
);

export const CvBuilderSectionHeader = ({
  iconSrc,
  title,
}: CvBuilderSectionHeaderProps) => (
  <Box className={styles.formHeader}>
    <Box className={styles.formIconBadge} aria-hidden="true">
      <Box component="img" src={iconSrc} alt="" className={styles.formIcon} />
    </Box>
    <Typography component="h2" className={styles.sectionTitle}>
      {title}
    </Typography>
  </Box>
);

export const CvBuilderLabeledField = ({
  label,
  span = "one",
  children,
  fieldName,
}: CvBuilderLabeledFieldProps) => (
  <Box
    className={`${styles.fieldGroup} ${spanClassNameMap[span]}`}
    data-field={fieldName}
  >
    <Typography component="label" className={styles.fieldLabel}>
      {toTitleCase(label)}
    </Typography>
    {children}
  </Box>
);

export const CvBuilderSelectField = ({
  label,
  value,
  onChange,
  onBlur,
  options,
  getOptionLabel = (option) => option,
  span = "one",
  allowEmptyOption = true,
  emptyLabel = "Select",
  displayEmpty = true,
  error = false,
  helperText,
  name,
}: CvBuilderSelectFieldProps) => (
  <CvBuilderLabeledField label={label} span={span} fieldName={name}>
    <TextField
      select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
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
                renderValue: (selectedValue: unknown) =>
                  renderSelectValue(selectedValue, emptyLabel, getOptionLabel),
              }
            : {}),
        },
      }}
    >
      {allowEmptyOption ? (
        <MenuItem value="">
          <span className={styles.placeholderText}>{emptyLabel}</span>
        </MenuItem>
      ) : null}
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {getOptionLabel(option)}
        </MenuItem>
      ))}
    </TextField>
  </CvBuilderLabeledField>
);

export const CvBuilderControlledTextField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  span = "one",
  placeholder,
  showError = true,
  rules,
}: CvBuilderControlledTextFieldProps<TFieldValues>) => (
  <CvBuilderLabeledField label={label} span={span} fieldName={name}>
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          error={showError ? Boolean(fieldState.error) : false}
          helperText={showError ? fieldState.error?.message : undefined}
          placeholder={placeholder}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      )}
    />
  </CvBuilderLabeledField>
);
