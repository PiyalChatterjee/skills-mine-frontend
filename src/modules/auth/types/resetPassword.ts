import { z } from "zod";
import { strongPasswordSchema } from "@/app/passwordPolicy";

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
