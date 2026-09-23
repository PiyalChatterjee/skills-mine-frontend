import { z } from 'zod'
import {
	localPhoneNumberSchema,
	optionalLocalPhoneNumberSchema,
} from '@/app/phoneNumber'
import { strongPasswordSchema } from '@/app/passwordPolicy'

export const idSchema = z.string().min(1)

export const emailSchema = z
	.string()
	.trim()
	.min(1, 'Email address is required')
	.refine((value) => z.email().safeParse(value).success, {
		message: 'Enter a valid email address',
	})

// Blank is allowed since this backs optional "alternate contact" fields.
export const optionalEmailSchema = z
	.string()
	.trim()
	.refine((value) => value === '' || z.email().safeParse(value).success, {
		message: 'Enter a valid email address',
	})

const requiredField = (label: string) =>
	z.string().trim().min(1, `${label} is required`)

const passwordMismatchIssue = {
	path: ['confirmPassword'],
	message: 'Passwords do not match',
}

const passwordsMatch = (values: { password: string; confirmPassword: string }) =>
	values.password === values.confirmPassword

const baseSignupShape = {
	firstName: z.string().trim().min(1, 'First name is required'),
	lastName: z.string().trim().min(1, 'Last name is required'),
	email: emailSchema,
	mobileNumber: localPhoneNumberSchema,
	password: strongPasswordSchema,
	confirmPassword: z.string().min(1, 'Please confirm your password'),
	acceptTerms: z.boolean().refine((value) => value === true, {
		message: 'You must accept the terms and privacy policy',
	}),
}

export const candidateSignUpSchema = z
	.object(baseSignupShape)
	.refine(passwordsMatch, passwordMismatchIssue)

export type CandidateSignUpSchemaValues = z.infer<typeof candidateSignUpSchema>

export const recruiterSignUpSchema = z
	.object(baseSignupShape)
	.refine(passwordsMatch, passwordMismatchIssue)

export type RecruiterSignUpSchemaValues = z.infer<typeof recruiterSignUpSchema>

export const inviteSignupSchema = z
	.object({ ...baseSignupShape, staffNumber: z.string().trim() })
	.refine(passwordsMatch, passwordMismatchIssue)

export type InviteSignupFormValues = z.infer<typeof inviteSignupSchema>

export const recruiterInviteSignupSchema = z
	.object({
		...baseSignupShape,
		staffNumber: z.string().trim().min(1, 'Staff number is required'),
	})
	.refine(passwordsMatch, passwordMismatchIssue)

export type RecruiterInviteSignupFormValues = z.infer<
	typeof recruiterInviteSignupSchema
>

export const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, 'Email is required')
		.pipe(z.email('Enter a valid email')),
	password: z.string().min(1, 'Password is required'),
	rememberMe: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const resetPasswordSchema = z
	.object({
		password: strongPasswordSchema,
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.superRefine((values, context) => {
		if (values.password !== values.confirmPassword) {
			context.addIssue({
				code: 'custom',
				path: ['confirmPassword'],
				message: 'Passwords do not match',
			})
		}
	})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		password: strongPasswordSchema,
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.superRefine((values, context) => {
		if (values.password !== values.confirmPassword) {
			context.addIssue({
				code: 'custom',
				path: ['confirmPassword'],
				message: 'Passwords do not match',
			})
		}
	})

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

const profilePhoneNumberSchema = z
	.string()
	.trim()
	.min(1, 'Phone number is required')
	.max(10, 'Phone number must be at most 10 digits')
	.regex(/^\d+$/, 'Phone number must contain digits only')

const profileCommonShape = {
	fullName: requiredField('Full name'),
	email: emailSchema,
	alternateEmail: optionalEmailSchema,
	alternatePhoneNumber: optionalLocalPhoneNumberSchema,
	residentialLocation: requiredField('Residential location'),
	preferredJobTitle: z.string(),
	targetedIndustries: z.string(),
	employmentType: z.string().trim(),
	availability: z.string().trim(),
}

export const profileCreationSchema = z.object({
	...profileCommonShape,
	phoneNumber: profilePhoneNumberSchema,
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

export type ProfileCreationFormValues = z.infer<typeof profileCreationSchema>

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

export const profileCreationEducationExperienceSchema =
	profileCreationSchema.pick({
		certifications: true,
		highestDegreeEarned: true,
		currentJobTitle: true,
		currentEmployer: true,
		totalYearsOfExperience: true,
	})

export const profileFormSchema = z.object({
	...profileCommonShape,
	phoneNumber: localPhoneNumberSchema,
	preferredWorkType: z.string(),
	password: z.string(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

// UI career-history dates are entered as "DD MMMM YYYY"; the API payload uses ISO yyyy-mm-dd.
const careerDatePattern =
	/^(0[1-9]|[12]\d|3[01]) (January|February|March|April|May|June|July|August|September|October|November|December) (19|20)\d{2}$/i
const currentRolePattern = /^(present|current)$/i
const monthNames = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
]

function careerDateToComparable(value: string): number | null {
	const match = value.trim().match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/)
	if (!match) return null
	const monthIndex = monthNames.findIndex((month) =>
		month === match[2].toLowerCase(),
	)
	if (monthIndex < 0) return null
	return Number(match[3]) * 372 + monthIndex * 31 + Number(match[1])
}

export const personalDetailsSchema = z
	.object({
		fullName: z
			.string()
			.refine((value) => value.trim().length > 0, {
				message: 'Full name is required',
			})
			.refine((value) => !value.trim() || /^[a-zA-Z0-9 ]+$/.test(value.trim()), {
				message: 'Full name must be alphanumeric',
			}),
		email: optionalEmailSchema.default(''),
		phoneNumber: optionalLocalPhoneNumberSchema.default(''),
		race: z.string().min(1, 'Race is required'),
		gender: z.string().min(1, 'Gender is required'),
		disabilityStatus: z.string().min(1, 'Disability status is required'),
		nationality: z.string().refine((value) => value.trim().length > 0, {
			message: 'Nationality is required',
		}),
		residentialLocation: z.string().min(1, 'Residential location is required'),
		currentCompany: z.string(),
		currentPosition: z.string(),
		noticePeriod: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.currentCompany.trim()) {
			if (!data.currentPosition.trim()) {
				ctx.addIssue({
					code: 'custom',
					message: 'Current position is required when current company is provided',
					path: ['currentPosition'],
				})
			}
			if (!data.noticePeriod.trim()) {
				ctx.addIssue({
					code: 'custom',
					message: 'Notice period is required when current company is provided',
					path: ['noticePeriod'],
				})
			}
		}
	})

export const careerHistoryEntrySchema = z.object({
	companyName: z.string().min(1, 'Company name is required'),
	positionHeld: z.string().min(1, 'Position held is required'),
	startDate: z
		.string()
		.min(1, 'Employment start date is required')
		.regex(careerDatePattern, 'Use format like 01 April 2020'),
	endDate: z.string().refine(
		(value) =>
			!value.trim() ||
			careerDatePattern.test(value.trim()) ||
			currentRolePattern.test(value.trim()),
		{ message: 'Use format like 01 April 2020 or Present' },
	),
	isCurrentRole: z.boolean(),
	tasks: z.array(z.string()),
	projects: z.array(z.string()),
})

const emptyCareerHistoryEntrySchema = z
	.object({
		companyName: z.string(),
		positionHeld: z.string(),
		startDate: z.string(),
		endDate: z.string(),
		isCurrentRole: z.boolean(),
		tasks: z.array(z.string()),
		projects: z.array(z.string()),
	})
	.superRefine((data, ctx) => {
		const start = careerDateToComparable(data.startDate)
		const end = careerDateToComparable(data.endDate)
		if (start !== null && end !== null && start > end) {
			ctx.addIssue({
				code: 'custom',
				message: 'Employment start date must be before end date',
				path: ['startDate'],
			})
		}
	})

export const skillEntrySchema = z.object({ name: z.string() })

export const tertiaryEntrySchema = z.object({
	institutionName: z.string().min(1, 'Institution name is required'),
	degreeOrCertification: z
		.string()
		.min(1, 'Degree or certification is required'),
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

export const cvBuilderSchema = z
	.object({
		personalDetails: personalDetailsSchema,
		careerHistory: z.array(
			z.union([careerHistoryEntrySchema, emptyCareerHistoryEntrySchema]),
		),
		skills: z.array(skillEntrySchema),
		tertiaryEducation: z.array(tertiaryEntrySchema),
		secondaryEducation: z.array(secondaryEntrySchema),
		languages: z.array(z.string()),
		otherLanguage: z.string(),
	})
	.superRefine((data, ctx) => {
		if (
			data.personalDetails.currentCompany.trim() &&
			!data.careerHistory.some(
				(entry) => entry.companyName.trim() || entry.positionHeld.trim(),
			)
		) {
			ctx.addIssue({
				code: 'custom',
				message:
					'At least one career history position is required when current company is provided',
				path: ['careerHistory'],
			})

			const firstEntry = data.careerHistory[0]
			if (firstEntry) {
				if (!firstEntry.companyName.trim()) {
					ctx.addIssue({
						code: 'custom',
						message: 'Company name is required',
						path: ['careerHistory', 0, 'companyName'],
					})
				}
				if (!firstEntry.positionHeld.trim()) {
					ctx.addIssue({
						code: 'custom',
						message: 'Position held is required',
						path: ['careerHistory', 0, 'positionHeld'],
					})
				}
				if (!firstEntry.startDate.trim()) {
					ctx.addIssue({
						code: 'custom',
						message: 'Employment start date is required',
						path: ['careerHistory', 0, 'startDate'],
					})
				}
			}
		}
	})

export type CvBuilderFormValues = z.infer<typeof cvBuilderSchema>
