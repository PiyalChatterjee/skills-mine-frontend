import { z } from 'zod'
import {
  fromSouthAfricaApiPhoneNumber,
  localPhoneNumberSchema,
  toSouthAfricaApiPhoneNumber,
} from '@/app/phoneNumber'
import { emailSchema } from '@/app/validation.schema'
import { splitCandidateFullName } from '@/modules/candidate/utils/candidateName'
import type { CandidateProfile, CandidateProfileUpdatePayload } from '@/modules/candidate/types'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const profileFormSchema = z.object({
  fullName: requiredField('Full name'),
  email: emailSchema,
  phoneNumber: localPhoneNumberSchema,
  residentialLocation: requiredField('Residential location'),
  preferredJobTitle: z.string(),
  targetedIndustries: z.string(),
  preferredWorkType: requiredField('Preferred Work Type(s)'),
  employmentType: z.string(),
  availability: z.string(),
  password: z.string(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const PROFILE_SELECT_OPTIONS = {
  residentialLocation: [
    'Johannesburg, Gauteng',
    'Cape Town, Western Cape',
    'Durban, KwaZulu-Natal',
  ],
  targetedIndustries: [
    'Technology',
    'Financial Services',
    'Banking',
    'Consulting',
    'Digital Marketing',
  ],
  preferredWorkType: ['Hybrid', 'Remote', 'On-site'],
  employmentType: [
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'TEMPORARY',
    'INTERNSHIP',
    'FREELANCE',
  ],
  availability: ['Immediately', '2 weeks', '1 month'],
} as const

export const getProfileFormValues = (
  profile: CandidateProfile | null,
): ProfileFormValues => {
  const fullName = [
    profile?.personalDetails?.firstName ?? '',
    profile?.personalDetails?.lastName ?? '',
  ]
    .join(' ')
    .trim()

  return {
    fullName,
    email: profile?.personalDetails?.email ?? '',
    phoneNumber: fromSouthAfricaApiPhoneNumber(
      profile?.personalDetails?.mobileNumber ?? '',
    ),
    residentialLocation: profile?.personalDetails?.location ?? '',
    preferredJobTitle: profile?.desiredJob?.jobTitle ?? '',
    targetedIndustries: profile?.desiredJob?.industry ?? '',
    preferredWorkType: profile?.desiredJob?.workType ?? '',
    employmentType: normalizeEmploymentType(profile?.desiredJob?.employmentType),
    availability: profile?.desiredJob?.availableFrom ?? '',
    password: profile?.authentication?.password ?? '',
  }
}

const normalizeEmploymentType = (value?: string) => {
  if (!value) return ''
  if (value === 'Permanent') return 'FULL_TIME'
  return value.toUpperCase().replaceAll(' ', '_')
}

export const getCandidateProfileUpdatePayload = (
  values: ProfileFormValues,
  currentProfile: CandidateProfile | null,
): CandidateProfileUpdatePayload => {
  const { firstName, lastName } = splitCandidateFullName(values.fullName)

  return {
    personalDetails: {
      firstName: firstName || currentProfile?.personalDetails?.firstName || '',
      lastName: lastName || currentProfile?.personalDetails?.lastName || '',
      email: values.email.trim(),
      mobileNumber: toSouthAfricaApiPhoneNumber(values.phoneNumber),
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
      workType: values.preferredWorkType.trim(),
      employmentType: values.employmentType.trim(),
      salaryExpectation: currentProfile?.desiredJob?.salaryExpectation ?? 0,
      availableFrom: values.availability.trim(),
    },
    experience: currentProfile?.experience ?? [],
    skills: currentProfile?.skills ?? [],
    languages: currentProfile?.languages ?? [],
  }
}
