import { z } from 'zod'
import { strongPasswordSchema } from '@/app/passwordPolicy'

export const idSchema = z.string().min(1)

export const emailSchema = z.string().pipe(z.email())

export const candidateSignUpSchema = z
	.object({
		firstName: z.string().trim().min(1, 'First name is required'),
		lastName: z.string().trim().min(1, 'Last name is required'),
		email: emailSchema,
		mobileNumber: z
			.string()
			.trim()
			.min(1, 'Phone number is required')
			.regex(/^\+\d{10,15}$/, 'Use international format like +27821234567'),
		password: strongPasswordSchema,
		confirmPassword: z.string().min(1, 'Please confirm your password'),
		acceptTerms: z
			.boolean()
			.refine((value) => value === true, {
				message: 'You must accept the terms and privacy policy',
			}),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match',
	})

export type CandidateSignUpSchemaValues = z.infer<typeof candidateSignUpSchema>

export const recruiterSignUpSchema = z
	.object({
		firstName: z.string().trim().min(1, 'First name is required'),
		lastName: z.string().trim().min(1, 'Last name is required'),
		email: emailSchema,
		mobileNumber: z
			.string()
			.trim()
			.min(1, 'Phone number is required')
			.regex(/^\+\d{10,15}$/, 'Use international format like +27821234567'),
		password: strongPasswordSchema,
		confirmPassword: z.string().min(1, 'Please confirm your password'),
		acceptTerms: z
			.boolean()
			.refine((value) => value === true, {
				message: 'You must accept the terms and privacy policy',
			}),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match',
	})

export type RecruiterSignUpSchemaValues = z.infer<typeof recruiterSignUpSchema>
