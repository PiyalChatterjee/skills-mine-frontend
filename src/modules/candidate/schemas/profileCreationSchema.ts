import { z } from 'zod'
import { localPhoneNumberSchema, optionalLocalPhoneNumberSchema } from '@/app/phoneNumber'
import { emailSchema, optionalEmailSchema } from '@/app/validation.schema'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const profileCreationSchema = z.object({
  fullName: requiredField('Full name'),
  email: emailSchema,
  phoneNumber: localPhoneNumberSchema,
  alternateEmail: optionalEmailSchema,
  alternatePhoneNumber: optionalLocalPhoneNumberSchema,
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
  highestDegreeEarned: z.string().trim(),
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
  alternateEmail: true,
  alternatePhoneNumber: true,
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