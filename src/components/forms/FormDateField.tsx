import { useState, type Ref } from "react";
import { IconButton, InputAdornment, Popover } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import chevronDown from "@/assets/crm/chevron-down.svg";
import { FormField } from "./FormField";

type FormDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  name?: string;
  disabled?: boolean;
  disableFuture?: boolean;
  minDate?: string;
  error?: boolean;
  helperText?: string;
};

export function FormDateField({
  label, value, onChange, onBlur, inputRef, name, disabled, disableFuture, minDate, error, helperText,
}: FormDateFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const parsed = value ? dayjs(value) : null;

  return (
    <>
      <FormField
        label={label}
        placeholder="Select date"
        value={value}
        name={name}
        inputRef={inputRef}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !disabled) {
            event.preventDefault();
            setAnchorEl(event.currentTarget);
          }
        }}
        disabled={disabled}
        error={error}
        helperText={helperText}
        slotProps={{
          htmlInput: { "aria-label": label },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={`Choose ${label.toLowerCase()}`}
                  aria-haspopup="dialog"
                  aria-expanded={Boolean(anchorEl)}
                  disabled={disabled}
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                  edge="end"
                >
                  <img src={chevronDown} alt="" aria-hidden="true" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); onBlur?.(); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { role: "dialog", "aria-label": `${label} calendar` } }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={parsed?.isValid() ? parsed : null}
            onChange={(date) => {
              onChange(date ? date.format("YYYY-MM-DD") : "");
              setAnchorEl(null);
              onBlur?.();
            }}
            disabled={disabled}
            disableFuture={disableFuture}
            minDate={minDate ? dayjs(minDate) : undefined}
          />
        </LocalizationProvider>
      </Popover>
    </>
  );
}
