import { IconButton, InputAdornment } from "@mui/material";
import type { MouseEvent } from "react";
import passwordEyeFigmaIcon from "@/assets/icons/password-eye-figma.svg";

type PasswordVisibilityAdornmentProps = {
  visible: boolean;
  onToggle: () => void;
  buttonClassName?: string;
  iconClassName?: string;
};

export const PasswordVisibilityAdornment = ({
  visible,
  onToggle,
  buttonClassName,
  iconClassName,
}: PasswordVisibilityAdornmentProps) => {
  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <InputAdornment position="end">
      <IconButton
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={onToggle}
        onMouseDown={handleMouseDown}
        edge="end"
        className={buttonClassName}
        disableRipple
        disableFocusRipple
      >
        <img
          src={passwordEyeFigmaIcon}
          alt=""
          aria-hidden="true"
          width={21.6373}
          height={18}
          className={iconClassName}
        />
      </IconButton>
    </InputAdornment>
  );
};
