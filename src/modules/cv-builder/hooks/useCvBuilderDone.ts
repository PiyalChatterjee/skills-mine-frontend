import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCandidateResourceId } from "@/modules/candidate/hooks/useCandidateQueries";
import {
  useSaveBuildMyCvMutation,
  useUpdateBuildMyCvMutation,
  useUploadCvResumeDocumentMutation,
  apiSlice,
} from "@/store/api/apiSlice";
import type { CandidateProfile } from "@/modules/candidate/types";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";
import {
  setBuildMyCv,
  setBuildMyCvMetadata,
} from "@/store/slices/candidateSlice";
import type { SaveBuildMyCvRequest } from "@/types";
import type { Role } from "@/types/auth";
import type { CvBuilderFormValues } from "@/app/validation.schema";
import {
  saveGuestApplicationCv,
  type GuestApplicationDraft,
} from "@/modules/candidate/utils/guestApplicationDraft";

// Not logged in => visitor; RECRUITER role => recruiter; everyone else => candidate
const resolveResumeRoleLabel = (userId?: string, role?: Role): string => {
  if (!userId) return "visitor";
  if (role === "RECRUITER") return "recruiter";
  return "candidate";
};

const resolveSuccessRoute = (roleLabel: string, candidateId: string): string => {
  if (roleLabel === "visitor") return ROUTE_PATHS.landing;
  if (roleLabel === "recruiter") {
    // TODO: Navigate to ROUTE_PATHS.recruiterCandidate when the mandate cardId is available here.
    return ROUTE_PATHS.recruiterCandidateDetail.replace(
      ":candidateId",
      candidateId,
    );
  }
  return ROUTE_PATHS.candidateDashboard;
};

const sanitizeFileNamePart = (value: string): string =>
  value.trim().replace(/[^a-zA-Z0-9]+/g, "").toLowerCase() || "candidate";

const formatFileNameTimestamp = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  // UTC keeps the timestamp unique regardless of the uploader's local timezone
  return `${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${date.getUTCFullYear()}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
};

const buildResumeFileName = (
  firstName: string,
  lastName: string,
  roleLabel: string,
): string =>
  `${sanitizeFileNamePart(firstName)}_${sanitizeFileNamePart(lastName)}_${roleLabel}_${formatFileNameTimestamp(new Date())}.pdf`;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const monthNameToIso = (value: string): string => {
  const normalized = value.trim();
  const match = normalized.match(/^([A-Za-z]+)(?:-|,\s?)(\d{4})$/);
  const month = match?.[1];
  const year = match?.[2];
  if (!month || !year || !/^\d{4}$/.test(year)) {
    return value;
  }

  const monthIndex = monthNames.findIndex((name) =>
    name.toLowerCase().startsWith(month.toLowerCase()),
  );
  if (monthIndex < 0) {
    return value;
  }

  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
};

const normalizeTextEntry = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  const entry = value as Record<string, unknown>;
  const nestedValue = entry.text ?? entry.description ?? entry.value ?? entry.name;
  return typeof nestedValue === "string" ? nestedValue.trim() : "";
};

export const isoToMonthName = (value: string): string => {
  const match = value.match(/^(19|20)\d{2}-(0[1-9]|1[0-2])(?:-\d{2})?$/);
  if (!match) {
    return value;
  }

  const year = value.slice(0, 4);
  const monthIndex = Number(value.slice(5, 7)) - 1;
  const monthName = monthNames[monthIndex];
  return monthName ? `${monthName.slice(0, 3)},${year}` : value;
};

export const buildCvBuilderPrefillData = (
  profile: CandidateProfile | undefined,
): Partial<CvBuilderFormValues> | undefined => {
  if (!profile) {
    return undefined;
  }

  const primaryExperience = Array.isArray(profile.experience)
    ? profile.experience[0]
    : undefined;

  return {
    personalDetails: {
      fullName:
        `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`.trim(),
      email: "",
      phoneNumber: "",
      race: profile.personalDetails.eeStatus ?? "",
      gender: "",
      disabilityStatus: "",
      nationality: profile.personalDetails.nationality ?? "",
      residentialLocation: profile.personalDetails.location ?? "",
      currentCompany: primaryExperience?.company ?? "",
      currentPosition:
        primaryExperience?.jobTitle ?? profile.desiredJob?.jobTitle ?? "",
      noticePeriod: profile.desiredJob?.availableFrom ?? "",
    },
  };
};

type UseCvBuilderDoneArgs = {
  candidateId?: string;
  userId?: string;
  candidateProfile?: CandidateProfile;
  getFormValues: () => CvBuilderFormValues;
  selectedLanguageEntries: string[];
  buildMyCvExists: boolean;
  validateForm?: () => Promise<boolean>;
  hasFormChanges?: boolean;
  userRole?: Role;
  guestApplicationDraft?: GuestApplicationDraft;
};

export const buildBuildMyCvRequest = ({
  formValues,
  selectedLanguageEntries,
}: {
  formValues: CvBuilderFormValues;
  selectedLanguageEntries: string[];
}): SaveBuildMyCvRequest => {
  const [firstName, ...lastNameParts] = formValues.personalDetails.fullName
    .trim()
    .split(" ");
  const languages = selectedLanguageEntries
    .filter(Boolean)
    .map((language) => ({ language, proficiency: "Conversational" }));
  const careerHistory = formValues.careerHistory
    .filter((entry) => entry.companyName.trim() || entry.positionHeld.trim())
    .map((entry) => ({
      company: entry.companyName.trim(),
      jobTitle: entry.positionHeld.trim(),
      startDate: monthNameToIso(entry.startDate.trim()),
      endDate: entry.isCurrentRole
        ? "Present"
        : monthNameToIso(entry.endDate.trim()),
      responsibilities: (entry.tasks as unknown[])
        .map(normalizeTextEntry)
        .filter(Boolean)
        .join("; "),
    }));

  return {
    personalDetails: {
      firstName: firstName || "",
      lastName: lastNameParts.join(" ").trim(),
      email: formValues.personalDetails.email?.trim() ?? "",
      phoneNumber: formValues.personalDetails.phoneNumber?.trim() ?? "",
      race: formValues.personalDetails.race.trim(),
      gender: formValues.personalDetails.gender.trim(),
      disabilityStatus: formValues.personalDetails.disabilityStatus.trim(),
      nationality: formValues.personalDetails.nationality.trim(),
      location: formValues.personalDetails.residentialLocation.trim(),
      currentCompany: formValues.personalDetails.currentCompany.trim(),
      currentPosition: formValues.personalDetails.currentPosition.trim(),
      noticePeriod: formValues.personalDetails.noticePeriod.trim(),
    },
    ...(careerHistory.length > 0 ? { careerHistory } : {}),
    skills: formValues.skills.map((skill) => skill.name.trim()).filter(Boolean),
    education: {
      tertiaryEducation: formValues.tertiaryEducation
        .filter(
          (entry) =>
            entry.institutionName.trim() && entry.degreeOrCertification.trim(),
        )
        .map((entry) => ({
          institution: entry.institutionName.trim(),
          qualification: entry.degreeOrCertification.trim(),
          yearCompleted: Number(entry.yearCompleted.trim()),
        })),
      secondaryEducation: formValues.secondaryEducation
        .filter(
          (entry) =>
            entry.institutionName.trim() && entry.highestGradePassed.trim(),
        )
        .map((entry) => ({
          schoolName: entry.institutionName.trim(),
          qualification: entry.highestGradePassed.trim(),
          yearCompleted: Number(entry.yearCompleted.trim()),
        })),
    },
    languages,
  };
};

export const useCvBuilderDone = ({
  candidateId: suppliedCandidateId,
  userId,
  getFormValues,
  selectedLanguageEntries,
  buildMyCvExists,
  validateForm,
  hasFormChanges = true,
  userRole,
  guestApplicationDraft,
}: UseCvBuilderDoneArgs) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // Must match the id used by the getBuildMyCv query so its cache tag is invalidated.
  const authenticatedCandidateId = useCandidateResourceId();
  const candidateId = suppliedCandidateId ?? authenticatedCandidateId;
  const [triggerCreate, { isLoading: isCreating }] = useSaveBuildMyCvMutation();
  const [triggerUpdate, { isLoading: isUpdating }] =
    useUpdateBuildMyCvMutation();
  const [triggerResumeUpload] = useUploadCvResumeDocumentMutation();

  const isSavingCandidateProfile = isCreating || isUpdating;

  const handleDone = useCallback(async () => {
    const isFormValid = await validateForm?.();
    if (isFormValid === false) {
      return;
    }

    const payload = buildBuildMyCvRequest({
      formValues: getFormValues(),
      selectedLanguageEntries,
    });

    if (guestApplicationDraft) {
      saveGuestApplicationCv(guestApplicationDraft.jobId, payload);
      dispatch(
        pushNotification({
          title: "CV saved",
          message: `Your application for ${guestApplicationDraft.jobTitle} is ready when you create an account.`,
          level: "success",
        }),
      );
      navigate(ROUTE_PATHS.landing);
      return;
    }

    const roleLabel = resolveResumeRoleLabel(userId, userRole);
    const successRoute = resolveSuccessRoute(roleLabel, candidateId);

    if (buildMyCvExists && !hasFormChanges) {
      dispatch(
        pushNotification({
          title: "No changes to save",
          message: "Your CV is already up to date.",
          level: "info",
        }),
      );
      navigate(successRoute);
      return;
    }

    let pdfBlob: Blob;
    let fileName: string;

    try {
      const { generateCvPdfBlobFromText } = await import(
        "../utils/downloadCvPdf"
      );
      pdfBlob = await generateCvPdfBlobFromText(JSON.stringify(payload, null, 2));
      fileName = buildResumeFileName(
        payload.personalDetails?.firstName ?? "",
        payload.personalDetails?.lastName ?? "",
        roleLabel,
      );
    } catch {
      dispatch(
        pushNotification({
          title: "PDF generation failed",
          message: "We could not generate your CV PDF. Please try again.",
          level: "error",
        }),
      );
      return;
    }

    try {
      await triggerResumeUpload({
        candidateId,
        file: pdfBlob,
        fileName,
      }).unwrap();
    } catch {
      dispatch(
        pushNotification({
          title: "Resume upload failed",
          message: "We could not upload your CV PDF. Please try again.",
          level: "error",
        }),
      );
      return;
    }

    try {
      const result = buildMyCvExists
        ? await triggerUpdate({ candidateId, payload }).unwrap()
        : await triggerCreate({ candidateId, payload }).unwrap();

      dispatch(setBuildMyCv(result));
      dispatch(
        apiSlice.util.upsertQueryData(
          "getBuildMyCv",
          { candidateId },
          result,
        ),
      );
      dispatch(
        setBuildMyCvMetadata({
          exists: true,
          lastModified: result.lastModified ?? new Date().toISOString(),
        }),
      );

      dispatch(
        pushNotification({
          title: buildMyCvExists ? "Changes saved" : "CV created",
          message: buildMyCvExists
            ? "Your CV has been updated successfully."
            : "CV information saved successfully.",
          level: "success",
        }),
      );

      navigate(successRoute);
    } catch (error) {
      const fallbackMessage =
        "We could not save your CV right now. Please try again.";
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message ?? fallbackMessage)
          : fallbackMessage;

      dispatch(
        pushNotification({
          title: "Save failed",
          message: errorMessage,
          level: "error",
        }),
      );
    }
  }, [
    buildMyCvExists,
    candidateId,
    dispatch,
    guestApplicationDraft,
    getFormValues,
    hasFormChanges,
    selectedLanguageEntries,
    triggerCreate,
    triggerUpdate,
    triggerResumeUpload,
    userId,
    userRole,
    navigate,
    validateForm,
  ]);

  return {
    handleDone,
    isSavingCandidateProfile,
  };
};
