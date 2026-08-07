import { z } from "zod";

export const inviteSignupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
    mobileNumber: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(/^\+\d{10,15}$/, "Use international format like +27821234567"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms and privacy policy",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type InviteSignupFormValues = z.infer<typeof inviteSignupSchema>;
