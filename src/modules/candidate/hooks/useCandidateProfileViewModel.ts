import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { extractErrorMessage } from "@/app/errorUtils";
import { useZodForm } from "@/hooks/useZodForm";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { saveProfileThunk } from "@/store/slices/candidateThunks";
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
} from "@/modules/candidate/hooks/useCandidateQueries";

export const useCandidateProfileViewModel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
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
  const resolvedCandidateProfile = candidateProfile ?? null;
  const {
    control,
    formState: { isDirty },
    getValues,
    reset,
    trigger,
  } = useZodForm(profileFormSchema, {
    defaultValues: getProfileFormValues(null),
  });
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [isDesiredEditing, setIsDesiredEditing] = useState(false);
  const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<string | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const industryOptions = useIndustryOptions(PROFILE_SELECT_OPTIONS.targetedIndustries);

  useEffect(() => {
    reset(getProfileFormValues(resolvedCandidateProfile));
  }, [resolvedCandidateProfile, reset]);

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

    const nextPreviewUrl = URL.createObjectURL(file);
    setProfilePhotoPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return nextPreviewUrl;
    });
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
      const isFormValid = await trigger();
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
        const updatedProfile = await dispatch(
          saveProfileThunk({ userId, candidateId: profileCandidateId, payload }),
        ).unwrap();

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
    // No backend endpoint for profile photos yet — preview is local-only, never uploaded.
    profilePhotoPreviewUrl ?? resolvedCandidateProfile?.personalDetails?.profileImageUrl ?? null;

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