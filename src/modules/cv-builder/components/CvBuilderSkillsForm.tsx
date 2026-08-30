import { Box, Button, TextField, Typography } from "@mui/material";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import skillsGenerateIcon from "@/assets/cv-builder/skills-generate.svg";
import skillsSparkleIcon from "@/assets/cv-builder/skills-sparkle.svg";
import { useCandidateResourceId } from "@/modules/candidate/hooks/useCandidateQueries";
import { useGenerateSkillsMutation } from "@/store/api/apiSlice";
import { pushNotification } from "@/store/slices/notificationSlice";
import styles from "../pages/CvBuilderPage.module.css";
import CvBuilderRemoveItemButton from "./CvBuilderRemoveItemButton";
import {
  CvBuilderFormPanel,
  CvBuilderSectionHeader,
} from "./CvBuilderFormPrimitives";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";

const CvBuilderSkillsForm = () => {
  const {
    control,
    getValues,
    formState: { errors },
    clearErrors,
  } = useFormContext<CvBuilderFormValues>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "skills",
  });
  const formError = (
    errors.skills as { root?: { message?: string } } | undefined
  )?.root?.message;

  const candidateId = useCandidateResourceId();
  const dispatch = useDispatch();
  const [generateSkills, { isLoading: isGenerating }] =
    useGenerateSkillsMutation();

  const handleAddSkill = () => {
    clearErrors("skills");
    append({ name: "" });
  };

  const handleGenerateSkills = async () => {
    const careerHistory = (getValues("careerHistory") ?? [])
      .filter((entry) => entry.companyName?.trim() && entry.positionHeld?.trim())
      .map((entry) => ({
        companyName: entry.companyName,
        positionHeld: entry.positionHeld,
        responsibilities: (entry.tasks ?? []).filter((task) => task?.trim()),
        projects: (entry.projects ?? []).filter((project) => project?.trim()),
      }))
      .filter((entry) => entry.responsibilities.length > 0);

    if (!candidateId || careerHistory.length === 0) {
      dispatch(
        pushNotification({
          title: "Add career history first",
          message:
            "Fill in at least one job's company, position and responsibilities before generating skills.",
          level: "info",
        }),
      );
      return;
    }

    try {
      const suggestedSkills = await generateSkills({
        candidateId,
        careerHistory,
      }).unwrap();

      if (suggestedSkills.length === 0) {
        dispatch(
          pushNotification({
            title: "No skills found",
            message: "We could not suggest any skills from your career history.",
            level: "info",
          }),
        );
        return;
      }

      clearErrors("skills");
      replace(suggestedSkills.map((skill) => ({ name: skill.skillName })));
    } catch {
      dispatch(
        pushNotification({
          title: "Skill generation failed",
          message: "We could not generate skills right now. Please try again.",
          level: "error",
        }),
      );
    }
  };

  return (
    <CvBuilderFormPanel>
      <Box className={styles.skillsFormHeader}>
        <CvBuilderSectionHeader
          iconSrc={skillsSparkleIcon}
          title="Your skills"
        />
        <Button
          type="button"
          className={`${styles.generateButton} no-global-hover`}
          disableRipple
          disabled={isGenerating}
          onClick={handleGenerateSkills}
        >
          {isGenerating ? "Generating…" : "Generate"}
          <Box
            component="img"
            src={skillsGenerateIcon}
            alt=""
            className={styles.generateButtonIcon}
            aria-hidden="true"
          />
        </Button>
      </Box>

      {formError && (
        <Typography component="p" sx={{ color: "#d32f2f", marginBottom: 2 }}>
          {formError}
        </Typography>
      )}

      <Typography className={styles.skillsSubHeading} sx={{ mt: 1 }}>
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
