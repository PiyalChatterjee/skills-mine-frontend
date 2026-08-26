import { z } from 'zod'

const monthYearPattern =
  /^(January|February|March|April|May|June|July|August|September|October|November|December),\s?(19|20)\d{2}$/i
const currentRolePattern = /^(present|current)$/i
const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december']

// Converts a "MonthName,YYYY" string into a comparable (year * 12 + monthIndex) number.
function monthYearToComparable(value: string): number | null {
  const match = value.trim().match(/^([A-Za-z]+),\s?(\d{4})$/)
  if (!match) return null
  const monthIndex = monthNames.indexOf(match[1].toLowerCase())
  if (monthIndex < 0) return null
  return Number(match[2]) * 12 + monthIndex
}

export const personalDetailsSchema = z
  .object({
    fullName: z
      .string()
      .refine((v) => v.trim().length > 0, { message: 'Full name is required' })
      .refine((v) => !v.trim() || /^[a-zA-Z0-9 ]+$/.test(v.trim()), {
        message: 'Full name must be alphanumeric',
      }),
    race: z.string().min(1, 'Race is required'),
    gender: z.string().min(1, 'Gender is required'),
    disabilityStatus: z.string().min(1, 'Disability status is required'),
    nationality: z
      .string()
      .refine((v) => v.trim().length > 0, { message: 'Nationality is required' }),
    residentialLocation: z.string().min(1, 'Residential location is required'),
    currentCompany: z.string(),
    currentPosition: z.string(),
    noticePeriod: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.currentCompany.trim()) {
      if (!data.currentPosition.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Current position is required when current company is provided',
          path: ['currentPosition'],
        })
      }
      if (!data.noticePeriod.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Notice period is required when current company is provided',
          path: ['noticePeriod'],
        })
      }
    }
  })

export const careerHistoryEntrySchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    positionHeld: z.string().min(1, 'Position held is required'),
    startDate: z
      .string()
      .min(1, 'Employment start date is required')
      .regex(monthYearPattern, 'Use format like April,2020'),
    endDate: z.string().refine(
      (val) => !val.trim() || monthYearPattern.test(val.trim()) || currentRolePattern.test(val.trim()),
      { message: 'Use format like April,2020 or Present' },
    ),
    isCurrentRole: z.boolean(),
    tasks: z.array(z.string()),
    projects: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    const start = monthYearToComparable(data.startDate)
    const end = monthYearToComparable(data.endDate)
    if (start !== null && end !== null && start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Employment start date must be before end date',
        path: ['startDate'],
      })
    }
  })

export const skillEntrySchema = z.object({ name: z.string() })

export const tertiaryEntrySchema = z.object({
  institutionName: z.string().min(1, 'Institution name is required'),
  degreeOrCertification: z.string().min(1, 'Degree or certification is required'),
  yearCompleted: z
    .string()
    .min(1, 'Year completed is required')
    .regex(/^\d{4}$/, 'Enter a valid year (YYYY)'),
})

export const secondaryEntrySchema = z.object({
  institutionName: z.string().min(1, 'Institution name is required'),
  highestGradePassed: z.string().min(1, 'Highest grade passed is required'),
  yearCompleted: z
    .string()
    .min(1, 'Year completed is required')
    .regex(/^\d{4}$/, 'Enter a valid year (YYYY)'),
})

export const cvBuilderSchema = z.object({
  personalDetails: personalDetailsSchema,
  careerHistory: z.array(careerHistoryEntrySchema),
  skills: z.array(skillEntrySchema),
  tertiaryEducation: z.array(tertiaryEntrySchema),
  secondaryEducation: z.array(secondaryEntrySchema),
  languages: z.array(z.string()),
  otherLanguage: z.string(),
})

export type CvBuilderFormValues = z.infer<typeof cvBuilderSchema>
