import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { extractErrorMessage, isNotFoundError } from '@/app/errorUtils'
import {
  profileCreationBasicDetailsSchema,
  profileCreationSchema,
} from '@/app/validation.schema'
import {
  useCandidateProfileQuery,
  useUpdateCandidateProfileMutation,
} from '@/modules/candidate/hooks/useCandidateQueries'
import {
  EMPTY_PROFILE_CREATION_VALUES,
  getProfileCreationDefaultValues,
  getProfileCreationPayload,
  PENDING_CANDIDATE_PROFILE_STORAGE_KEY,
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
    'alternateEmail',
    'alternatePhoneNumber',
    'residentialLocation',
    'preferredJobTitle',
    'targetedIndustries',
    'preferredLocations',
    'employmentType',
    'availability',
  ],
}

const isCurrentStepValid = (values: ProfileCreationFormValues) => {
  return profileCreationBasicDetailsSchema.safeParse(values).success
}

export const useProfileCreationWizard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.userId
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingSignupDefaults] = useState<Partial<ProfileCreationFormValues>>(() => {
    try {
      const storedDefaults = sessionStorage.getItem(PENDING_CANDIDATE_PROFILE_STORAGE_KEY)
      return storedDefaults ? JSON.parse(storedDefaults) : {}
    } catch {
      return {}
    }
  })
  const hasPendingSignupForUser = Boolean(
    pendingSignupDefaults.email &&
      user?.email &&
      pendingSignupDefaults.email.toLowerCase() === user.email.toLowerCase(),
  )
  const signupDefaultsForUser = useMemo(
    () => hasPendingSignupForUser ? pendingSignupDefaults : {},
    [hasPendingSignupForUser, pendingSignupDefaults],
  )

  const {
    data: candidateProfile,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCandidateProfileQuery(
    user?.candidateId,
    userId,
    Boolean(user?.candidateId || userId) && !hasPendingSignupForUser,
  )
  const updateProfileMutation = useUpdateCandidateProfileMutation()
  const isNewCandidateProfile = isNotFoundError(error)

  const form = useForm<ProfileCreationFormValues>({
    resolver: zodResolver(profileCreationSchema) as never,
    defaultValues: {
      ...EMPTY_PROFILE_CREATION_VALUES,
      ...signupDefaultsForUser,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const watchedValues = useWatch({ control: form.control })
  const activeStepId = PROFILE_CREATION_IMPLEMENTED_STEPS[currentStepIndex]

  useEffect(() => {
    const profileDefaults = getProfileCreationDefaultValues(candidateProfile ?? null)

    form.reset({
      ...profileDefaults,
      fullName: profileDefaults.fullName || signupDefaultsForUser.fullName || '',
      email: profileDefaults.email || signupDefaultsForUser.email || '',
      phoneNumber: profileDefaults.phoneNumber || signupDefaultsForUser.phoneNumber || '',
    }, {
      keepDirtyValues: true,
    })
  }, [candidateProfile, form, signupDefaultsForUser])

  const canGoNext = useMemo(
    () => isCurrentStepValid(watchedValues as ProfileCreationFormValues),
    [watchedValues],
  )

  const persistValues = async (values: ProfileCreationFormValues) => {
    if (!userId) {
      throw new Error('Unable to save your profile because no authenticated user is available.')
    }

    return updateProfileMutation.mutateAsync({
      userId,
      candidateId: user?.candidateId,
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
      sessionStorage.removeItem(PENDING_CANDIDATE_PROFILE_STORAGE_KEY)
      navigate(ROUTE_PATHS.cvBuilder, { replace: true })
    } catch (saveError) {
      setSubmitError(
        extractErrorMessage(saveError, 'Failed to save your profile.'),
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
    isError: isError && !isNewCandidateProfile,
    loadErrorMessage: isNewCandidateProfile
      ? ''
      : extractErrorMessage(error, 'Failed to load your profile.'),
    submitError,
    isSubmitting: updateProfileMutation.isLoading,
    isMissingUser: !userId,
  }
}