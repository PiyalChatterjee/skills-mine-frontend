import { z } from "zod";
import dayjs from "dayjs";
import { CrmClassification, CrmClassificationLabel } from "@/enums/statuses";

export const crmClassificationLabels = {
  [CrmClassification.NEEDS_ATTENTION]: CrmClassificationLabel.NEEDS_ATTENTION,
  [CrmClassification.HOT_LEAD]: CrmClassificationLabel.HOT_LEAD,
  [CrmClassification.WARM_CONTACT]: CrmClassificationLabel.WARM_CONTACT,
  [CrmClassification.COLD_LEAD]: CrmClassificationLabel.COLD_LEAD,
} as const;

export const crmClassifications = [
  CrmClassification.NEEDS_ATTENTION, CrmClassification.HOT_LEAD,
  CrmClassification.WARM_CONTACT, CrmClassification.COLD_LEAD,
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
    (value) => {
      const lines = value.split(/\r\n|\r|\n/);
      return lines.length <= 4 && lines.every((line) => line.length <= 98);
    },
    "Note must be no more than 4 lines",
  ),
  followupDate: dateSchema,
  lastcontactDate: dateSchema.refine(
    (value) => value === "" || value <= dayjs().format("YYYY-MM-DD"),
    "Date cannot be in the future",
  ),
}).refine(
  ({ followupDate, lastcontactDate }) =>
    !followupDate || !lastcontactDate ||
    !dateSchema.safeParse(followupDate).success ||
    !dateSchema.safeParse(lastcontactDate).success ||
    followupDate > lastcontactDate,
  {
    path: ["followupDate"],
    message: "Follow-up Date must be after Last Contact Date",
  },
);

export type CrmNoteValues = z.infer<typeof crmNoteSchema>;
