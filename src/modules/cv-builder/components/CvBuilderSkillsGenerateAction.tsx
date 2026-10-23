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

type SkillGenerationDetails = {
  isVisitor: boolean;
  candidateId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  careerHistory: CvBuilderFormValues["careerHistory"];
};

const hasCompany = (entry: CvBuilderFormValues["careerHistory"][number]) =>
  Boolean(entry.companyName.trim());

const hasPosition = (entry: CvBuilderFormValues["careerHistory"][number]) =>
  Boolean(entry.positionHeld.trim());

const hasResponsibilities = (entry: CvBuilderFormValues["careerHistory"][number]) =>
  entry.tasks.some((task) => task.trim());

const getJobCompletionScore = (entry: CvBuilderFormValues["careerHistory"][number]) =>
  Number(hasCompany(entry)) + Number(hasPosition(entry)) + Number(hasResponsibilities(entry));

const getMissingJobFields = (careerHistory: CvBuilderFormValues["careerHistory"]) => {
  if (careerHistory.some((entry) => hasCompany(entry) && hasPosition(entry) && hasResponsibilities(entry))) {
    return [];
  }

  const bestEntry = careerHistory.reduce<typeof careerHistory[number] | undefined>(
    (best, entry) =>
      !best || getJobCompletionScore(entry) > getJobCompletionScore(best) ? entry : best,
    undefined,
  );

  return [
    !bestEntry || !hasCompany(bestEntry) ? "company" : "",
    !bestEntry || !hasPosition(bestEntry) ? "position" : "",
    !bestEntry || !hasResponsibilities(bestEntry) ? "responsibilities" : "",
  ].filter(Boolean);
};

export const getMissingSkillGenerationFields = ({
  isVisitor,
  candidateId,
  fullName,
  email,
  phoneNumber,
  careerHistory,
}: SkillGenerationDetails) => {
  const missingFields: string[] = [];

  if (isVisitor) {
    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!nameParts[0]) missingFields.push("first name");
    if (!nameParts[1]) missingFields.push("last name");
    if (!email.trim()) missingFields.push("email");
    if (!toSouthAfricaApiPhoneNumber(phoneNumber)) missingFields.push("phone number");
  } else if (!candidateId) {
    missingFields.push("candidate profile");
  }

  return [...missingFields, ...getMissingJobFields(careerHistory)];
};

const formatMissingFields = (fields: string[]) => {
  if (fields.length < 2) return fields[0] ?? "";
  if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
  return `${fields.slice(0, -1).join(", ")}, and ${fields.at(-1)}`;
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

    const missingFields = getMissingSkillGenerationFields({
      isVisitor,
      candidateId,
      fullName: personalDetails.fullName,
      email: personalDetails.email,
      phoneNumber: personalDetails.phoneNumber,
      careerHistory: getValues("careerHistory") ?? [],
    });

    if (missingFields.length > 0) {
      dispatch(
        pushNotification({
          title: "Complete required details",
          message: `Missing: ${formatMissingFields(missingFields)}. Add these details before generating skills.`,
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
