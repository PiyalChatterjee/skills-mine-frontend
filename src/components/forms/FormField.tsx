import { useId } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import styles from "./FormField.module.css";

export type FormFieldProps = Omit<TextFieldProps, "label"> & {
  label: string;
};

export function FormField({
  label, id, required, className, slotProps, ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label id={`${fieldId}-label`} htmlFor={fieldId} className={styles.label}>
        {label}{required ? "*" : ""}
      </label>
      <TextField
        {...props}
        id={fieldId}
        required={required}
        fullWidth
        variant="outlined"
        className={styles.control}
        slotProps={{
          ...slotProps,
          htmlInput: (ownerState) => ({
            "aria-label": label,
            ...(typeof slotProps?.htmlInput === "function"
              ? slotProps.htmlInput(ownerState) : slotProps?.htmlInput),
          }),
          select: (ownerState) => ({
            "aria-label": label,
            ...(typeof slotProps?.select === "function"
              ? slotProps.select(ownerState) : slotProps?.select),
          }),
        }}
      />
    </div>
  );
}
