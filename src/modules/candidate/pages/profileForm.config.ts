import { z } from 'zod'
import { emailSchema } from '@/app/validation.schema'
import type { CandidateProfile, CandidateProfileUpdatePayload } from '@/modules/candidate/types'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const profileFormSchema = z.object({
  fullName: requiredField('Full name'),
  email: emailSchema,
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+\d{10,15}$/, 'Use international format like +27821234567'),
  residentialLocation: requiredField('Residential location'),
  preferredJobTitle: z.string(),
  targetedIndustries: z.string(),
  preferredLocations: requiredField('Preferred location'),
  employmentType: z.string(),
  availability: z.string(),
  certifications: z.array(
    z.object({
      value: z.string().trim(),
    }),
  ),
  highestDegreeEarned: requiredField('Highest degree earned'),
  currentJobTitle: z.string(),
  currentEmployer: z.string(),
  totalYearsOfExperience: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+(\.\d+)?$/.test(value), {
      message: 'Use a valid number of years',
    }),
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
    'Banking',
    'Consulting',
    'Digital Marketing',
  ],
  preferredLocations: ['Hybrid', 'Remote', 'On-site'],
  employmentType: ['Permanent', 'Contract'],
  availability: ['Immediately', '2 weeks', '1 month'],
} as const

export const getProfileFormValues = (
  profile: CandidateProfile | null,
): ProfileFormValues => {
  const firstQualification = profile?.education?.highestEarned ?? ''
  const fullName = [
    profile?.personalDetails?.firstName ?? '',
    profile?.personalDetails?.lastName ?? '',
  ]
    .join(' ')
    .trim()

  return {
    fullName,
    email: profile?.personalDetails?.email ?? '',
    phoneNumber: profile?.personalDetails?.mobileNumber ?? '',
    residentialLocation: profile?.personalDetails?.location ?? '',
    preferredJobTitle: profile?.desiredJob?.jobTitle ?? '',
    targetedIndustries: profile?.desiredJob?.industry ?? '',
    preferredLocations: profile?.desiredJob?.workType ?? '',
    employmentType: profile?.desiredJob?.employmentType ?? '',
    availability: profile?.desiredJob?.availableFrom ?? '',
    certifications: (profile?.education?.certifications ?? []).length > 0
      ? (profile?.education?.certifications ?? []).map((v) => ({ value: v }))
      : [{ value: '' }],
    highestDegreeEarned: firstQualification,
    currentJobTitle: profile?.desiredJob?.jobTitle ?? '',
    currentEmployer: '',
    totalYearsOfExperience: '',
    password: profile?.authentication?.password ?? '',
  }
}

export const getCandidateProfileUpdatePayload = (
  values: ProfileFormValues,
  currentProfile: CandidateProfile | null,
): CandidateProfileUpdatePayload => {
  const [firstName, ...rest] = values.fullName.trim().split(' ')
  const lastName = rest.join(' ').trim()

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
      certifications: values.certifications.map((c) => c.value.trim()).filter(Boolean),
      highestEarned: values.highestDegreeEarned.trim(),
    },
    experience: currentProfile?.experience ?? [],
    skills: currentProfile?.skills ?? [],
    languages: currentProfile?.languages ?? [],
  }
}
