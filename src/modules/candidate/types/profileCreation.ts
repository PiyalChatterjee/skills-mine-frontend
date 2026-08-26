import type { z } from 'zod'
import { profileCreationSchema } from '@/modules/candidate/schemas/profileCreationSchema'
import type {
  CandidateProfile,
  CandidateProfileUpdatePayload,
} from '@/modules/candidate/types'

export type ProfileCreationFormValues = z.infer<typeof profileCreationSchema>

export type ProfileCreationStepId = 'basic-details'

export const PROFILE_CREATION_TOTAL_STEPS = 1

export const PROFILE_CREATION_IMPLEMENTED_STEPS: readonly ProfileCreationStepId[] = [
  'basic-details',
]

const EMPTY_CERTIFICATION_COUNT = 1

const createEmptyCertification = () => ({ value: '' })

const ensureMinimumCertifications = (certifications: string[] = []) => {
  const normalized = certifications.map((value) => ({ value }))

  while (normalized.length < EMPTY_CERTIFICATION_COUNT) {
    normalized.push(createEmptyCertification())
  }

  return normalized
}

export const EMPTY_PROFILE_CREATION_VALUES: ProfileCreationFormValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  residentialLocation: '',
  preferredJobTitle: '',
  targetedIndustries: '',
  preferredLocations: '',
  employmentType: '',
  availability: '',
  certifications: ensureMinimumCertifications(),
  highestDegreeEarned: '',
  currentJobTitle: '',
  currentEmployer: '',
  totalYearsOfExperience: '',
}

export const PENDING_CANDIDATE_PROFILE_STORAGE_KEY = 'pending_candidate_profile'

export type PendingCandidateProfile = Pick<
  ProfileCreationFormValues,
  'fullName' | 'email' | 'phoneNumber'
>

const splitFullName = (fullName: string) => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)

  return {
    firstName: firstName ?? '',
    lastName: rest.join(' ').trim(),
  }
}

export const getProfileCreationDefaultValues = (
  profile: CandidateProfile | null,
): ProfileCreationFormValues => {
  if (!profile) {
    return EMPTY_PROFILE_CREATION_VALUES
  }

  const firstExperience = profile.experience?.[0]

  const fullName = [
    profile.personalDetails?.firstName ?? '',
    profile.personalDetails?.lastName ?? '',
  ]
    .join(' ')
    .trim()

  return {
    fullName,
    email: profile.personalDetails?.email ?? '',
    phoneNumber: profile.personalDetails?.mobileNumber ?? '',
    residentialLocation: profile.personalDetails?.location ?? '',
    preferredJobTitle: profile.desiredJob?.jobTitle ?? '',
    targetedIndustries: profile.desiredJob?.industry ?? '',
    preferredLocations: profile.desiredJob?.workType ?? '',
    employmentType: profile.desiredJob?.employmentType ?? '',
    availability: profile.desiredJob?.availableFrom ?? '',
    certifications: ensureMinimumCertifications(
      profile.education?.certifications ?? [],
    ),
    highestDegreeEarned: profile.education?.highestEarned ?? '',
    currentJobTitle: firstExperience?.jobTitle ?? '',
    currentEmployer: firstExperience?.company ?? '',
    totalYearsOfExperience: '',
  }
}

export const getProfileCreationPayload = (
  values: ProfileCreationFormValues,
  currentProfile: CandidateProfile | null,
): CandidateProfileUpdatePayload => {
  const { firstName, lastName } = splitFullName(values.fullName)
  const currentExperience = currentProfile?.experience ?? []
  const firstExperience = currentExperience[0]
  const hasExperienceInput = Boolean(
    values.currentJobTitle.trim() || values.currentEmployer.trim(),
  )
  const nextExperience = hasExperienceInput
    ? [
        {
          company: values.currentEmployer.trim(),
          jobTitle: values.currentJobTitle.trim(),
          startDate: firstExperience?.startDate ?? '',
          endDate: firstExperience?.endDate ?? '',
          responsibilities: firstExperience?.responsibilities ?? '',
        },
        ...currentExperience.slice(1),
      ]
    : currentExperience

  return {
    personalDetails: {
      firstName: firstName || currentProfile?.personalDetails?.firstName || '',
      lastName: lastName || currentProfile?.personalDetails?.lastName || '',
      email: values.email.trim(),
      mobileNumber: values.phoneNumber.trim(),
      location: values.residentialLocation.trim(),
      nationality: currentProfile?.personalDetails?.nationality ?? '',
      idNumber: currentProfile?.personalDetails?.idNumber ?? '',
      eeStatus: currentProfile?.personalDetails?.eeStatus ?? '',
      profileImageUrl: currentProfile?.personalDetails?.profileImageUrl ?? '',
      thumbnailUrl: currentProfile?.personalDetails?.thumbnailUrl ?? '',
      linkedinUrl: currentProfile?.personalDetails?.linkedinUrl ?? '',
      portfolioUrl: currentProfile?.personalDetails?.portfolioUrl ?? '',
    },
    desiredJob: {
      jobTitle: values.preferredJobTitle.trim(),
      industry: values.targetedIndustries.trim(),
      workType: values.preferredLocations.trim(),
      employmentType: values.employmentType.trim(),
      salaryExpectation: currentProfile?.desiredJob?.salaryExpectation ?? 0,
      availableFrom: values.availability.trim(),
    },
    education: {
      certifications: values.certifications
        .map((entry) => entry.value.trim())
        .filter(Boolean),
      highestEarned: values.highestDegreeEarned.trim(),
    },
    experience: nextExperience,
    skills: currentProfile?.skills ?? [],
    languages: currentProfile?.languages ?? [],
  }
}