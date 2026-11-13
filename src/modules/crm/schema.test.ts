import { describe, expect, it } from "vitest";
import { crmNoteSchema } from "./schema";

describe("CRM validation", () => {
  const note = { classification: "hot_lead", note: "Hiring soon", followupDate: "", lastcontactDate: "" };

  it("requires note text and a supported classification", () => {
    expect(crmNoteSchema.safeParse(note).success).toBe(true);
    expect(crmNoteSchema.safeParse({ ...note, note: "  " }).success).toBe(false);
    expect(crmNoteSchema.safeParse({ ...note, classification: "" }).success).toBe(false);
    expect(crmNoteSchema.safeParse({ ...note, classification: "invalid" }).success).toBe(false);
  });

  it("accepts optional dates and rejects impossible calendar dates", () => {
    expect(crmNoteSchema.safeParse({ ...note, followupDate: "2026-11-01" }).success).toBe(true);
    expect(crmNoteSchema.safeParse({ ...note, lastcontactDate: "2026-02-30" }).success).toBe(false);
    expect(crmNoteSchema.safeParse({ ...note, followupDate: "tomorrow" }).success).toBe(false);
  });

  it("allows future follow-up dates but rejects future contact dates", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, "0"),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    expect(crmNoteSchema.safeParse({ ...note, followupDate: futureDate }).success).toBe(true);
    expect(crmNoteSchema.safeParse({ ...note, lastcontactDate: futureDate }).success).toBe(false);
  });

  it.each(["2026-11-03", "2026-11-04"])(
    "rejects a follow-up date of %s on or before the contact date",
    (followupDate) => {
      const result = crmNoteSchema.safeParse({
        ...note, lastcontactDate: "2026-11-04", followupDate,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(expect.objectContaining({
          path: ["followupDate"],
          message: "Follow-up Date must be after Last Contact Date",
        }));
      }
    },
  );

  it("accepts a follow-up after the contact date, including an overdue follow-up", () => {
    expect(crmNoteSchema.safeParse({
      ...note, lastcontactDate: "2026-11-01", followupDate: "2026-11-02",
    }).success).toBe(true);
  });

  it("allows four note lines and rejects five lines with Unix or Windows line endings", () => {
    expect(crmNoteSchema.safeParse({ ...note, note: "1\n2\n3\n4" }).success).toBe(true);
    expect(crmNoteSchema.safeParse({ ...note, note: "1\n2\n3\n4\n5" }).success).toBe(false);
    expect(crmNoteSchema.safeParse({ ...note, note: "1\r\n2\r\n3\r\n4\r\n5" }).success).toBe(false);
  });

});
