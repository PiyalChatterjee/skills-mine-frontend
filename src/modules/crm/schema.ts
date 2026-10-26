import { z } from "zod";
import { emailSchema } from "@/app/validation.schema";

export const crmClassificationLabels = {
  needs_attention: "Needs Attention",
  hot_lead: "Hot Lead",
  warm_contact: "Warm Contact",
  cold_lead: "Cold Lead",
} as const;

export const crmClassifications = [
  "needs_attention", "hot_lead", "warm_contact", "cold_lead",
] as const;

const dateSchema = z.string().refine(
  (value) => value === "" || (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  ),
  "Enter a valid date",
);

export const crmNoteSchema = z.object({
  classification: z.enum(crmClassifications, { error: "Select a classification" }),
  note: z.string().trim().min(1, "Note is required").refine(
    (value) => value.split(/\r\n|\r|\n/).length <= 4,
    "Note must be no more than 4 lines",
  ),
  followupDate: dateSchema,
  lastcontactDate: dateSchema,
});

export const crmEmployerSchema = z.object({
  employerName: z.string().trim().min(1, "Employer name is required").max(250),
  contactName: z.string().trim().min(1, "Contact name is required").max(250),
  contactNumber: z.string().trim().min(1, "Contact number is required").max(250),
  emailId: emailSchema.max(250),
  clientRate: z.string().trim().refine(
    (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
    "Client rate must be a non-negative number",
  ),
});

export type CrmNoteValues = z.infer<typeof crmNoteSchema>;
export type CrmEmployerValues = z.infer<typeof crmEmployerSchema>;
