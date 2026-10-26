import { describe, expect, it } from "vitest";
import { crmEmployerSchema, crmNoteSchema } from "./schema";

describe("CRM validation", () => {
  const employer = {
    employerName: "Employer", contactName: "Recruiter",
    contactNumber: "+27 11 123 4567", emailId: "contact@example.com", clientRate: "",
  };
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

  it("allows four note lines and rejects five lines with Unix or Windows line endings", () => {
    expect(crmNoteSchema.safeParse({ ...note, note: "1\n2\n3\n4" }).success).toBe(true);
    expect(crmNoteSchema.safeParse({ ...note, note: "1\n2\n3\n4\n5" }).success).toBe(false);
    expect(crmNoteSchema.safeParse({ ...note, note: "1\r\n2\r\n3\r\n4\r\n5" }).success).toBe(false);
  });

  it("trims employer fields and preserves optional or zero rates", () => {
    expect(crmEmployerSchema.parse({ ...employer, employerName: " Employer " }).employerName).toBe("Employer");
    expect(crmEmployerSchema.safeParse({ ...employer, clientRate: "0" }).success).toBe(true);
    expect(crmEmployerSchema.safeParse(employer).success).toBe(true);
  });

  it.each([
    { employerName: " " }, { contactName: "" }, { contactNumber: "" },
    { emailId: "not-an-email" }, { clientRate: "-1" }, { clientRate: "Infinity" },
    { clientRate: "abc" }, { employerName: "a".repeat(251) },
  ])("rejects invalid employer inputs: %j", (invalid) => {
    expect(crmEmployerSchema.safeParse({ ...employer, ...invalid }).success).toBe(false);
  });
});
