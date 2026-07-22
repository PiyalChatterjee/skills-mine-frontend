import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { useZodForm } from "@/hooks/useZodForm";
import { loginSchema, type LoginFormValues } from "@/modules/auth/types";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { authApi, mapLoginResponseToSession } from "@/services/api/authApi";
import loginFaceImage from "@/assets/login-face-img.jpg";
import loginVectorImage from "@/assets/login-vector.svg";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(loginSchema, {
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitError(null);

      const response = await authApi.login(values);
      login(mapLoginResponseToSession(response));
      navigate(ROUTE_PATHS.portal, { replace: true });
    } catch {
      setSubmitError("Login failed. Check your credentials and try again.");
    }
  };

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.heroSection}>
        <Box
          component="img"
          src={loginVectorImage}
          alt=""
          className={styles.heroVector}
        />
        <Box
          component="img"
          src={loginFaceImage}
          alt=""
          className={styles.heroPortrait}
        />
        <Box className={styles.heroOverlay} />
        <Box className={styles.heroHeadlineWrap}>
          <Typography className={styles.heroHeadline}>
            Where talent meets opportunity.
          </Typography>
        </Box>
      </Box>

      <Box className={styles.formSection}>
        <Typography className={styles.formHeading}>
          Log in using your email and provided password.
        </Typography>

        <form className={styles.formFields} onSubmit={handleSubmit(onSubmit)}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <TextField
            label="Email"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register("email")}
            className={styles.inputField}
          />

          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register("password")}
            className={styles.inputField}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Signing in..." : "Log In"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default LoginPage;
