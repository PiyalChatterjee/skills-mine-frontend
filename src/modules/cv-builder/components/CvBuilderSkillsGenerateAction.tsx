import { Box, Button } from "@mui/material";
import type { MouseEvent } from "react";
import { useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import skillsGenerateIcon from "@/assets/cv-builder/skills-generate.svg";
import { useCandidateResourceId } from "@/modules/candidate/hooks/useCandidateQueries";
import { useAuth } from "@/app/auth/AuthContext";
import { useGenerateSkillsMutation } from "@/store/api/apiSlice";
import { pushNotification } from "@/store/slices/notificationSlice";
import styles from "../pages/CvBuilderPage.module.css";
import type { CvBuilderFormValues } from "@/app/validation.schema";
import { toSouthAfricaApiPhoneNumber } from "@/app/phoneNumber";

type CvBuilderSkillsGenerateActionProps = {
  replaceSkills: (skills: { name: string }[]) => void;
  visitorId?: string;
};

// Lives in the Skills section title row so it stays visible on the single-page review layout.
const CvBuilderSkillsGenerateAction = ({
  replaceSkills,
  visitorId,
}: CvBuilderSkillsGenerateActionProps) => {
  const { getValues, clearErrors } = useFormContext<CvBuilderFormValues>();
  const candidateId = useCandidateResourceId();
  const { user } = useAuth();
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
        startDate: entry.startDate,
        endDate: entry.endDate,
        isCurrentRole: entry.isCurrentRole,
        responsibilities: (entry.tasks ?? []).filter((task) => task?.trim()),
        projects: (entry.projects ?? []).filter((project) => project?.trim()),
      }))
      .filter((entry) => entry.responsibilities.length > 0);

    const isVisitor = !user;
    const personalDetails = getValues("personalDetails");
    const nameParts = personalDetails.fullName.trim().split(/\s+/);
    const visitorRegistration = {
      email: personalDetails.email.trim(),
      firstName: nameParts[0] ?? "",
      lastName: nameParts.slice(1).join(" "),
      phoneNumber: toSouthAfricaApiPhoneNumber(personalDetails.phoneNumber),
    };

    if (
      (user && !candidateId) ||
      careerHistory.length === 0 ||
      (isVisitor &&
        (!visitorRegistration.email ||
          !visitorRegistration.firstName ||
          !visitorRegistration.lastName ||
          !visitorRegistration.phoneNumber))
    ) {
      dispatch(
        pushNotification({
          title: isVisitor ? "Add your details first" : "Add career history first",
          message:
            isVisitor
              ? "Fill in your full name, email and phone number, plus at least one job's company, position and responsibilities before generating skills."
              : "Fill in at least one job's company, position and responsibilities before generating skills.",
          level: "info",
        }),
      );
      return;
    }

    try {
      const suggestedSkills = await generateSkills({
        candidateId: user ? candidateId : visitorId,
        subjectType: user ? "CANDIDATE" : "VISITOR",
        ...(isVisitor && !visitorId ? { visitorRegistration } : {}),
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
