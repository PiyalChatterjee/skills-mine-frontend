import {
  Box,
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
      {label}
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
            slotProps={slotProps}
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

          return (
            <TextField
              id={inputId}
              variant="outlined"
              fullWidth
              select
              value={selectedValue}
              onChange={(event) => field.onChange(event.target.value)}
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
                  IconComponent: DropdownIcon,
                  renderValue: (selected: unknown) => {
                    const currentValue =
                      typeof selected === "string" ? selected : "";
                    if (!currentValue) {
                      return (
                        <span className={styles.selectPlaceholder}>
                          {placeholderText}
                        </span>
                      );
                    }
                    return currentValue;
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                {placeholderText}
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          );
        }}
      />
    </ProfileFieldBlock>
  );
};
