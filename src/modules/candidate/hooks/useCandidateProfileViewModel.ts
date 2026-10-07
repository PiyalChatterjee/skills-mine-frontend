import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { extractErrorMessage } from "@/app/errorUtils";
import { validateAndFocusForm } from "@/app/formValidation";
import { useZodForm } from "@/hooks/useZodForm";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { useIndustryOptions } from "@/modules/candidate/hooks/useIndustryOptions";
import {
  getCandidateProfileUpdatePayload,
  getProfileFormValues,
  PROFILE_SELECT_OPTIONS,
  profileFormSchema,
} from "@/modules/candidate/pages/profileForm.config";
import {
  useCandidateProfileQuery,
  useCandidateResourceId,
  useUpdateCandidateProfileMutation,
} from "@/modules/candidate/hooks/useCandidateQueries";
import { candidateApi } from "@/services/api/candidateApi";
import {
  formatProfilePhotoTimestamp,
  sanitizeProfilePhotoFileNamePart,
} from "@/modules/candidate/utils/profilePhoto";

export const useCandidateProfileViewModel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId;
  const candidateId = useCandidateResourceId();
  const {
    data: candidateProfile,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCandidateProfileQuery(candidateId, userId, Boolean(candidateId));
  const updateProfileMutation = useUpdateCandidateProfileMutation();
  const resolvedCandidateProfile = candidateProfile ?? null;
  const {
    control,
    formState: { isDirty },
    getValues,
    getFieldState,
    reset,
    trigger,
  } = useZodForm(profileFormSchema, {
    defaultValues: getProfileFormValues(null),
  });
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [isDesiredEditing, setIsDesiredEditing] = useState(false);
  const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<string | null>(null);
  const [profilePhotoDocumentUrl, setProfilePhotoDocumentUrl] = useState<string | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const industryOptions = useIndustryOptions(PROFILE_SELECT_OPTIONS.targetedIndustries);

  useEffect(() => {
    reset(getProfileFormValues(resolvedCandidateProfile));
  }, [resolvedCandidateProfile, reset]);

  useEffect(() => {
    if (!candidateId) return;
    let active = true;

    void candidateApi.listOwnerDocuments(candidateId).then(async (documents) => {
      const identityDocument = documents.find(
        (document) =>
          document.documentType?.toUpperCase() === "IDENTITY_DOCUMENT" &&
          document.lifecycleStatus?.toUpperCase() !== "DELETED",
      );
      if (!identityDocument?.documentId) return;

      const detail = await candidateApi.getDocument(identityDocument.documentId);
      const documentUrl = detail.viewUrl ?? detail.downloadUrl;
      if (active && documentUrl) {
        setProfilePhotoDocumentUrl(documentUrl);
      }
    }).catch(() => undefined);

    return () => {
      active = false;
    };
  }, [candidateId]);

  const handleEditPersonal = () => {
    setIsPersonalEditing(true);
  };

  const handleEditDesired = () => {
    setIsDesiredEditing(true);
  };

  const handleUploadPhotoClick = () => {
    profilePhotoInputRef.current?.click();
  };

  const handleProfilePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setProfilePhotoPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return nextPreviewUrl;
    });
    const fullName = getValues("fullName");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${candidateId ?? userId ?? "candidate"}_${sanitizeProfilePhotoFileNamePart(fullName)}_GTMT${formatProfilePhotoTimestamp(new Date())}.${extension}`;
    if (candidateId) {
      void candidateApi
        .uploadDocument(candidateId, file, fileName, "IDENTITY_DOCUMENT")
        .catch(() => undefined);
    }
    event.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (profilePhotoPreviewUrl) {
        URL.revokeObjectURL(profilePhotoPreviewUrl);
      }
    };
  }, [profilePhotoPreviewUrl]);

  const handleDashboard = async () => {
    if (!userId || isLoading || isFetching) {
      return;
    }

    if (isDirty) {
      const isFormValid = await validateAndFocusForm({ trigger, getValues, getFieldState });
      if (!isFormValid) {
        return;
      }

      const payload = getCandidateProfileUpdatePayload(
        getValues(),
        resolvedCandidateProfile,
      );

      try {
        const profileCandidateId =
          resolvedCandidateProfile?.candidateId ?? candidateId;
        const updatedProfile = await updateProfileMutation.mutateAsync({
          userId,
          candidateId: profileCandidateId,
          payload,
        });

        reset(getProfileFormValues(updatedProfile));
        setIsPersonalEditing(false);
        setIsDesiredEditing(false);
        navigate(ROUTE_PATHS.candidateDashboard);
      } catch {
        return;
      }

      return;
    }
    navigate(ROUTE_PATHS.candidateDashboard);
  };

  const activeProfilePhotoUrl =
    profilePhotoPreviewUrl ??
    profilePhotoDocumentUrl ??
    resolvedCandidateProfile?.personalDetails?.profileImageUrl ??
    null;

  return {
    activeProfilePhotoUrl,
    control,
    handleDashboard,
    handleEditDesired,
    handleEditPersonal,
    handleProfilePhotoSelect,
    handleUploadPhotoClick,
    industryOptions,
    isDesiredEditing,
    isDirty,
    isError,
    isFetching,
    isInitialProfileLoading: (isLoading || isFetching) && !resolvedCandidateProfile,
    isLoading,
    isMissingUser: !userId,
    isPersonalEditing,
    loadErrorMessage: extractErrorMessage(error, "Failed to load profile."),
    profilePhotoInputRef,
  };
};