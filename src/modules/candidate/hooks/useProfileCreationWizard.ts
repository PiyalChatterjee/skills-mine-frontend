import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import {
  useCandidateProfileQuery,
  useUpdateCandidateProfileMutation,
} from '@/modules/candidate/hooks/useCandidateQueries'
import {
  profileCreationBasicDetailsSchema,
  profileCreationEducationExperienceSchema,
  profileCreationSchema,
} from '@/modules/candidate/schemas/profileCreationSchema'
import {
  EMPTY_PROFILE_CREATION_VALUES,
  getProfileCreationDefaultValues,
  getProfileCreationPayload,
  PROFILE_CREATION_IMPLEMENTED_STEPS,
  PROFILE_CREATION_TOTAL_STEPS,
  type ProfileCreationStepId,
  type ProfileCreationFormValues,
} from '@/modules/candidate/types/profileCreation'
import { ROUTE_PATHS } from '@/routes/routePaths'

const PROFILE_CREATION_STEP_FIELDS: Record<
  ProfileCreationStepId,
  Array<keyof ProfileCreationFormValues>
> = {
  'basic-details': [
    'fullName',
    'email',
    'phoneNumber',
    'residentialLocation',
    'preferredJobTitle',
    'targetedIndustries',
    'preferredLocations',
    'employmentType',
    'availability',
  ],
  'education-experience': [
    'certifications',
    'highestDegreeEarned',
    'currentJobTitle',
    'currentEmployer',
    'totalYearsOfExperience',
  ],
  review: [
    'fullName',
    'email',
    'phoneNumber',
    'residentialLocation',
    'preferredJobTitle',
    'targetedIndustries',
    'preferredLocations',
    'employmentType',
    'availability',
    'certifications',
    'highestDegreeEarned',
    'currentJobTitle',
    'currentEmployer',
    'totalYearsOfExperience',
  ],
}

const isCurrentStepValid = (
  stepId: ProfileCreationStepId,
  values: ProfileCreationFormValues,
) => {
  if (stepId === 'basic-details') {
    return profileCreationBasicDetailsSchema.safeParse({
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      residentialLocation: values.residentialLocation,
      preferredJobTitle: values.preferredJobTitle,
      targetedIndustries: values.targetedIndustries,
      preferredLocations: values.preferredLocations,
      employmentType: values.employmentType,
      availability: values.availability,
    }).success
  }

  if (stepId === 'review') {
    return profileCreationSchema.safeParse(values).success
  }

  return profileCreationEducationExperienceSchema.safeParse({
    certifications: values.certifications,
    highestDegreeEarned: values.highestDegreeEarned,
    currentJobTitle: values.currentJobTitle,
    currentEmployer: values.currentEmployer,
    totalYearsOfExperience: values.totalYearsOfExperience,
  }).success
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message?: unknown }).message ?? fallback)
  }

  return fallback
}

export const useProfileCreationWizard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.userId
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    data: candidateProfile,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCandidateProfileQuery(userId, Boolean(userId))
  const updateProfileMutation = useUpdateCandidateProfileMutation()

  const form = useForm<ProfileCreationFormValues>({
    resolver: zodResolver(profileCreationSchema) as never,
    defaultValues: EMPTY_PROFILE_CREATION_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const watchedValues = useWatch({ control: form.control })
  const activeStepId = PROFILE_CREATION_IMPLEMENTED_STEPS[currentStepIndex]

  useEffect(() => {
    form.reset(getProfileCreationDefaultValues(candidateProfile ?? null), {
      keepDirtyValues: true,
    })
  }, [candidateProfile, form])

  const canGoNext = useMemo(
    () => isCurrentStepValid(activeStepId, watchedValues as ProfileCreationFormValues),
    [activeStepId, watchedValues],
  )

  const persistValues = async (values: ProfileCreationFormValues) => {
    if (!userId) {
      throw new Error('Unable to save your profile because no authenticated user is available.')
    }

    return updateProfileMutation.mutateAsync({
      userId,
      payload: getProfileCreationPayload(values, candidateProfile ?? null),
    })
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((previous) => previous - 1)
      return
    }

    navigate(ROUTE_PATHS.candidateDashboard)
  }

  const handleNext = async () => {
    setSubmitError(null)

    const stepFields = PROFILE_CREATION_STEP_FIELDS[activeStepId] as never
    const isStepValid = await form.trigger(stepFields)
    if (!isStepValid) {
      return
    }

    if (currentStepIndex < PROFILE_CREATION_IMPLEMENTED_STEPS.length - 1) {
      setCurrentStepIndex((previous) => previous + 1)
      return
    }

    try {
      await persistValues(form.getValues())
      navigate(ROUTE_PATHS.cvBuilder, { replace: true })
    } catch (saveError) {
      setSubmitError(
        getErrorMessage(saveError, 'Failed to save your profile.'),
      )
    }
  }

  return {
    form,
    currentStepIndex,
    activeStepId,
    totalSteps: PROFILE_CREATION_TOTAL_STEPS,
    canGoNext,
    handleBack,
    handleNext,
    isLoading,
    isFetching,
    isError,
    loadErrorMessage: getErrorMessage(error, 'Failed to load your profile.'),
    submitError,
    isSubmitting: updateProfileMutation.isLoading,
    isMissingUser: !userId,
  }
}