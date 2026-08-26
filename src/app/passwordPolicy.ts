import { z } from "zod";

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include at least 1 uppercase letter, 1 number, and 1 special character.";

export const strongPasswordSchema = z
  .string()
  .min(8, PASSWORD_POLICY_MESSAGE)
  .regex(/[A-Z]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[0-9]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[^A-Za-z0-9]/, PASSWORD_POLICY_MESSAGE);
