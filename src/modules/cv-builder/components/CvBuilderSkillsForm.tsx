import { Box, Button, TextField, Typography } from "@mui/material";
import { Controller, type UseFieldArrayReturn, useFormContext } from "react-hook-form";
import styles from "../pages/CvBuilderPage.module.css";
import CvBuilderRemoveItemButton from "./CvBuilderRemoveItemButton";
import { CvBuilderFormPanel } from "./CvBuilderFormPrimitives";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";

type CvBuilderSkillsFormProps = {
  skillsFieldArray: UseFieldArrayReturn<CvBuilderFormValues, "skills">;
};

const CvBuilderSkillsForm = ({ skillsFieldArray }: CvBuilderSkillsFormProps) => {
  const {
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext<CvBuilderFormValues>();
  const { fields, append, remove } = skillsFieldArray;
  const formError = (
    errors.skills as { root?: { message?: string } } | undefined
  )?.root?.message;

  const handleAddSkill = () => {
    clearErrors("skills");
    append({ name: "" });
  };

  return (
    <CvBuilderFormPanel>
      {formError && (
        <Typography component="p" className={styles.skillsError}>
          {formError}
        </Typography>
      )}

      <Typography className={styles.skillsSubHeading}>
        List your skills
      </Typography>

      <Box className={styles.skillsList}>
        {fields.map((fieldItem, index) => (
          <Box key={fieldItem.id} className={styles.skillRow}>
            <Controller
              name={`skills.${index}.name`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder={`Skill ${index + 1}`}
                  className={styles.fieldControl}
                  variant="outlined"
                  fullWidth
                />
              )}
            />
            <CvBuilderRemoveItemButton
              canRemove={fields.length > 1}
              ariaLabel={`Remove skill ${index + 1}`}
              onClick={() => remove(index)}
            />
          </Box>
        ))}

        <Button
          type="button"
          onClick={handleAddSkill}
          className={styles.addMutedPillButton}
          disableRipple
          fullWidth
        >
          Add skill
        </Button>
      </Box>
    </CvBuilderFormPanel>
  );
};

export default CvBuilderSkillsForm;
