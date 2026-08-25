import { Box, ButtonBase, TextField, Typography } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import languagesIcon from "@/assets/cv-builder/languages-line.svg";
import styles from "../pages/CvBuilderPage.module.css";
import {
  CvBuilderFormPanel,
  CvBuilderSectionHeader,
} from "./CvBuilderFormPrimitives";
import { LANGUAGES_LIST } from "../types/cvBuilder";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";

const CvBuilderLanguagesForm = () => {
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<CvBuilderFormValues>();
  const languages = useWatch({ control, name: "languages" }) ?? [];
  const formError =
    (
      errors.languages as
        | { root?: { message?: string }; message?: string }
        | undefined
    )?.root?.message ??
    (errors.languages as { message?: string } | undefined)?.message;

  const toggleLanguage = (language: string) => {
    const current = getValues("languages");
    const isSelected = current.includes(language);
    setValue(
      "languages",
      isSelected
        ? current.filter((l) => l !== language)
        : [...current, language],
      { shouldDirty: true, shouldValidate: true },
    );
    if (isSelected && language === "Other") {
      setValue("otherLanguage", "", { shouldDirty: true });
    }
  };

  return (
    <CvBuilderFormPanel>
      <CvBuilderSectionHeader iconSrc={languagesIcon} title="Languages" />

      {formError && (
        <Typography component="p" sx={{ color: "#d32f2f", marginBottom: 2 }}>
          {formError}
        </Typography>
      )}

      <Box className={styles.languagesGrid}>
        {LANGUAGES_LIST.map((language) => {
          const isSelected = languages.includes(language);
          return (
            <ButtonBase
              key={language}
              type="button"
              onClick={() => toggleLanguage(language)}
              className={`${styles.languageCheckItem} ${isSelected ? styles.languageCheckItemSelected : ""}`}
              disableRipple
            >
              <Box
                className={`${styles.languageCheckbox} ${isSelected ? styles.languageCheckboxChecked : ""}`}
                aria-hidden="true"
              >
                {isSelected && (
                  <Box component="span" className={styles.languageCheckmark}>
                    ✓
                  </Box>
                )}
              </Box>
              <Typography
                component="span"
                className={styles.languageCheckLabel}
              >
                {language}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      {languages.includes("Other") && (
        <Box sx={{ marginTop: 2 }}>
          <Typography component="label" className={styles.fieldLabel}>
            Other language
          </Typography>
          <Controller
            name="otherLanguage"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                placeholder="Enter language"
                className={styles.fieldControl}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Box>
      )}
    </CvBuilderFormPanel>
  );
};

export default CvBuilderLanguagesForm;
