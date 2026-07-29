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
}: BaseFieldProps<TFieldValues>) => (
  <Box
    className={`${styles.fieldBlock} ${fullWidth ? styles.fieldBlockFull : ""}`}
  >
    <Typography className={styles.fieldLabel}>{label}</Typography>
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
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
          className={`${inputClassName} ${disabled ? disabledClassName : ""}`}
          slotProps={slotProps}
        />
      )}
    />
  </Box>
);

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
}: SelectFieldProps<TFieldValues>) => (
  <Box
    className={`${styles.fieldBlock} ${fullWidth ? styles.fieldBlockFull : ""}`}
  >
    <Typography className={styles.fieldLabel}>{label}</Typography>
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const placeholderText = placeholder ?? label;
        const selectedValue =
          typeof field.value === "string" ? field.value : "";

        return (
          <TextField
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
            className={`${inputClassName} ${disabled ? disabledClassName : ""}`}
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
  </Box>
);
