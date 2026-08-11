import { z } from 'zod'
import { emailSchema } from '@/app/validation.schema'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

const isValidPhoneNumber = (value: string) => {
  const trimmedValue = value.trim()
  const digits = trimmedValue.replace(/\D/g, '')

  return digits.length >= 10 && digits.length <= 15 && /^[+]?[-()\s\d]+$/.test(trimmedValue)
}

export const profileCreationSchema = z.object({
  fullName: requiredField('Full name'),
  email: emailSchema,
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine(isValidPhoneNumber, 'Enter a valid phone number'),
  residentialLocation: requiredField('Residential location'),
  preferredJobTitle: requiredField('Preferred job title'),
  targetedIndustries: requiredField('Targeted industries'),
  preferredLocations: z.string().trim(),
  employmentType: z.string().trim(),
  availability: z.string().trim(),
  certifications: z.array(
    z.object({
      value: z.string().trim(),
    }),
  ),
  highestDegreeEarned: requiredField('Highest degree earned'),
  currentJobTitle: z.string().trim(),
  currentEmployer: z.string().trim(),
  totalYearsOfExperience: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+(\.\d+)?$/.test(value), {
      message: 'Use a valid number of years',
    }),
})

export const profileCreationBasicDetailsSchema = profileCreationSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  residentialLocation: true,
  preferredJobTitle: true,
  targetedIndustries: true,
  preferredLocations: true,
  employmentType: true,
  availability: true,
})

export const profileCreationEducationExperienceSchema = profileCreationSchema.pick({
  certifications: true,
  highestDegreeEarned: true,
  currentJobTitle: true,
  currentEmployer: true,
  totalYearsOfExperience: true,
})