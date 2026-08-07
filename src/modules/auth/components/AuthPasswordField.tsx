import { useState } from "react";
import { TextField, Typography } from "@mui/material";
import type { UseFormRegisterReturn } from "react-hook-form";
import { PasswordVisibilityAdornment } from "@/components/PasswordVisibilityAdornment";

interface AuthPasswordFieldProps {
  label: string;
  placeholder: string;
  value?: string;
  error: boolean;
  helperText?: string;
  registration: UseFormRegisterReturn;
  fieldGroupClassName: string;
  fieldLabelClassName: string;
  inputFieldClassName: string;
  toggleButtonClassName: string;
  toggleIconClassName: string;
  autoComplete?: string;
}

const AuthPasswordField = ({
  label,
  placeholder,
  value,
  error,
  helperText,
  registration,
  fieldGroupClassName,
  fieldLabelClassName,
  inputFieldClassName,
  toggleButtonClassName,
  toggleIconClassName,
  autoComplete,
}: AuthPasswordFieldProps) => {
  const [isVisible, setVisible] = useState(false);
  const hasValue = Boolean(value?.length);

  return (
    <div className={fieldGroupClassName}>
      <Typography className={fieldLabelClassName}>{label}</Typography>
      <TextField
        placeholder={placeholder}
        type={hasValue && isVisible ? "text" : "password"}
        autoComplete={autoComplete}
        error={error}
        helperText={helperText}
        slotProps={{
          input: {
            endAdornment: hasValue ? (
              <PasswordVisibilityAdornment
                visible={isVisible}
                onToggle={() => {
                  setVisible((previous) => !previous);
                }}
                buttonClassName={toggleButtonClassName}
                iconClassName={toggleIconClassName}
              />
            ) : null,
          },
        }}
        {...registration}
        className={inputFieldClassName}
      />
    </div>
  );
};

export default AuthPasswordField;
