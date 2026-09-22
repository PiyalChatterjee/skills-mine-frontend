import { Box, Button } from "@mui/material";
import type { MouseEvent } from "react";
import { useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import skillsGenerateIcon from "@/assets/cv-builder/skills-generate.svg";
import { useCandidateResourceId } from "@/modules/candidate/hooks/useCandidateQueries";
import { useGenerateSkillsMutation } from "@/store/api/apiSlice";
import { pushNotification } from "@/store/slices/notificationSlice";
import styles from "../pages/CvBuilderPage.module.css";
import type { CvBuilderFormValues } from "@/app/validation.schema";

type CvBuilderSkillsGenerateActionProps = {
  replaceSkills: (skills: { name: string }[]) => void;
};

// Lives in the Skills section title row so it stays visible on the single-page review layout.
const CvBuilderSkillsGenerateAction = ({
  replaceSkills,
}: CvBuilderSkillsGenerateActionProps) => {
  const { getValues, clearErrors } = useFormContext<CvBuilderFormValues>();
  const candidateId = useCandidateResourceId();
  const dispatch = useDispatch();
  const [generateSkills, { isLoading: isGenerating }] =
    useGenerateSkillsMutation();

  const handleGenerateSkills = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

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
      replaceSkills(suggestedSkills.map((skill) => ({ name: skill.skillName })));
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error && typeof error.message === "string"
          ? error.message
          : "We could not generate skills right now. Please try again.";
      dispatch(
        pushNotification({
          title: "Skill generation failed",
          message,
          level: "error",
        }),
      );
    }
  };

  return (
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
  );
};

export default CvBuilderSkillsGenerateAction;
