import { Box, MenuItem, TextField, Typography, type TextFieldProps } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import chevronDownIcon from "@/assets/cv-builder/chevron-down.svg";
import { getPhoneNumberInputProps } from "@/app/phoneNumber";
import styles from "../pages/CvBuilderPage.module.css";

export type FieldSpan = "full" | "two" | "one";

type CvBuilderFormPanelProps = {
  children: ReactNode;
  requiredHint?: string;
};

type CvBuilderSectionHeaderProps = {
  iconSrc: string;
  title: string;
};

type CvBuilderLabeledFieldProps = {
  label: string;
  span?: FieldSpan;
  required?: boolean;
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
  required?: boolean;
  allowEmptyOption?: boolean;
  emptyLabel?: string;
  displayEmpty?: boolean;
  error?: boolean;
  helperText?: string;
  name?: string;
  inputRef?: TextFieldProps["inputRef"];
};

type CvBuilderControlledTextFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  span?: FieldSpan;
  required?: boolean;
  placeholder?: string;
  showError?: boolean;
  rules?: RegisterOptions<TFieldValues>;
  onBlur?: (value: string) => void;
  transformValue?: (value: string) => string;
  type?: "text" | "tel";
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

export const CvBuilderFormPanel = ({
  children,
  requiredHint = "*Required fields",
}: CvBuilderFormPanelProps) => (
  <Box className={styles.formPanel}>
    {children}
    <Typography component="p" className={styles.requiredHint}>
      {requiredHint}
    </Typography>
  </Box>
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
  required = false,
  children,
  fieldName,
}: CvBuilderLabeledFieldProps) => (
  <Box
    className={`${styles.fieldGroup} ${spanClassNameMap[span]}`}
    data-field={fieldName}
  >
    <Typography component="label" className={styles.fieldLabel}>
      {toTitleCase(label)}
      {required ? "*" : null}
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
  required = false,
  allowEmptyOption = true,
  emptyLabel = "Select",
  displayEmpty = true,
  error = false,
  helperText,
  name,
  inputRef,
}: CvBuilderSelectFieldProps) => (
  <CvBuilderLabeledField label={label} span={span} required={required} fieldName={name}>
    <TextField
      select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={inputRef}
      error={error}
      helperText={helperText}
      className={styles.fieldControl}
      variant="outlined"
      fullWidth
      slotProps={{
        select: {
          "aria-label": label,
          "aria-required": required || undefined,
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
  required = false,
  placeholder,
  showError = true,
  rules,
  onBlur,
  transformValue,
  type = "text",
}: CvBuilderControlledTextFieldProps<TFieldValues>) => (
  <CvBuilderLabeledField label={label} span={span} required={required} fieldName={name}>
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, ...field }, fieldState }) => (
        <TextField
          {...field}
          inputRef={ref}
          type={type}
          onChange={(event) => {
            const value = transformValue ? transformValue(event.target.value) : event.target.value;
            field.onChange(value);
          }}
          {...(type === "tel" ? getPhoneNumberInputProps(field.value ?? "", field.onChange) : {})}
          slotProps={{ htmlInput: { "aria-label": label, "aria-required": required || undefined, ...(type === "tel" ? { inputMode: "tel", autoComplete: "tel-national" } : {}) } }}
          onBlur={(event) => {
            field.onBlur();
            onBlur?.(event.target.value);
          }}
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
