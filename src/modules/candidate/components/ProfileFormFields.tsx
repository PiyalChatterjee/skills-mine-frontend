import {
  Box,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  type TextFieldProps,
} from "@mui/material";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { type ReactNode, useId } from "react";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import dropdownChevronIconSrc from "@/assets/icons/dropdown-chevron.svg";
import styles from "@/modules/candidate/pages/ProfilePage.module.css";

type BaseFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  inputClassName?: string;
  disabledClassName?: string;
  type?: TextFieldProps["type"];
  maxLength?: number;
  slotProps?: TextFieldProps["slotProps"];
};

type SelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  options?: readonly string[];
  fullWidth?: boolean;
  disabled?: boolean;
  inputClassName?: string;
  disabledClassName?: string;
  multiple?: boolean;
};

const DropdownIcon = ({ className }: { className?: string }) => (
  <img
    className={className}
    src={dropdownChevronIconSrc}
    alt=""
    aria-hidden="true"
  />
);

type ProfileFieldBlockProps = {
  label: string;
  fullWidth?: boolean;
  htmlFor: string;
  children: ReactNode;
};

export const formatProfileLabel = (label: string) =>
  label.replace(/(^|[\s-])([a-z])/g, (_, prefix: string, character: string) =>
    `${prefix}${character.toUpperCase()}`,
  );

const ProfileFieldBlock = ({
  label,
  fullWidth,
  htmlFor,
  children,
}: ProfileFieldBlockProps) => (
  <Box
    className={`${styles.fieldBlock} ${fullWidth ? styles.fieldBlockFull : ""}`}
  >
    <Typography component="label" htmlFor={htmlFor} className={styles.fieldLabel}>
      {formatProfileLabel(label)}
    </Typography>
    {children}
  </Box>
);

const getInputClassName = (
  baseClassName: string,
  disabledClassName: string,
  disabled: boolean,
) => `${baseClassName} ${disabled ? disabledClassName : ""}`;

export const ProfileTextField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  fullWidth,
  disabled = false,
  inputClassName = styles.readonlyInput,
  disabledClassName = styles.readonlyInputDisabled,
  type,
  maxLength,
  slotProps,
}: BaseFieldProps<TFieldValues>) => {
  const inputId = useId();

  return (
    <ProfileFieldBlock label={label} fullWidth={fullWidth} htmlFor={inputId}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <TextField
            id={inputId}
            variant="outlined"
            fullWidth
            type={type}
            value={typeof field.value === "string" ? field.value : ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            placeholder={placeholder ?? label}
            disabled={disabled}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            className={getInputClassName(
              inputClassName,
              disabledClassName,
              disabled,
            )}
            slotProps={{
              ...slotProps,
              htmlInput: {
                ...slotProps?.htmlInput,
                ...(maxLength !== undefined ? { maxLength } : {}),
              },
            }}
          />
        )}
      />
    </ProfileFieldBlock>
  );
};

export const ProfileSelectField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options = [],
  fullWidth,
  disabled = false,
  inputClassName = styles.readonlyInput,
  disabledClassName = styles.readonlyInputDisabled,
  multiple = false,
}: SelectFieldProps<TFieldValues>) => {
  const inputId = useId();

  return (
    <ProfileFieldBlock label={label} fullWidth={fullWidth} htmlFor={inputId}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const placeholderText = placeholder ?? label;
          const selectedValue =
            typeof field.value === "string" ? field.value : "";
          const selectedValues = selectedValue
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

          return (
            <TextField
              id={inputId}
              variant="outlined"
              fullWidth
              select
              value={multiple ? selectedValues : selectedValue}
              onChange={(event) => {
                const nextValue = event.target.value;
                field.onChange(
                  Array.isArray(nextValue) ? nextValue.join(", ") : nextValue,
                );
              }}
              onBlur={field.onBlur}
              inputRef={field.ref}
              disabled={disabled}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              className={getInputClassName(
                inputClassName,
                disabledClassName,
                disabled,
              )}
              slotProps={{
                select: {
                  displayEmpty: true,
                  multiple,
                  IconComponent: DropdownIcon,
                  MenuProps: {
                    slotProps: {
                      paper: {
                        sx: { maxHeight: 360 },
                      },
                    },
                  },
                  renderValue: (selected: unknown) => {
                    const currentValue = Array.isArray(selected)
                      ? selected.join(", ")
                      : typeof selected === "string"
                        ? selected
                        : "";
                    if (!currentValue) {
                      return (
                        <span className={styles.selectPlaceholder}>
                          {placeholderText}
                        </span>
                      );
                    }
                    return currentValue
                      .split(", ")
                      .map(formatEnumLabel)
                      .join(", ");
                  },
                },
              }}
            >
              {!multiple && (
                <MenuItem value="" disabled>
                  {placeholderText}
                </MenuItem>
              )}
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {multiple ? (
                    <Checkbox checked={selectedValues.includes(option)} />
                  ) : null}
                  {formatEnumLabel(option)}
                </MenuItem>
              ))}
            </TextField>
          );
        }}
      />
    </ProfileFieldBlock>
  );
};
