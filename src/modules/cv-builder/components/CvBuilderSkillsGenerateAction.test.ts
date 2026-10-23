import { describe, expect, it } from "vitest";
import type { CvBuilderFormValues } from "@/app/validation.schema";
import { getMissingSkillGenerationFields } from "./CvBuilderSkillsGenerateAction";

const makeCareerEntry = (
  overrides: Partial<CvBuilderFormValues["careerHistory"][number]> = {},
): CvBuilderFormValues["careerHistory"][number] => ({
  companyName: "",
  positionHeld: "",
  startDate: "",
  endDate: "",
  isCurrentRole: false,
  tasks: [""],
  projects: [""],
  ...overrides,
});

describe("getMissingSkillGenerationFields", () => {
  it("lists the missing visitor and career details", () => {
    expect(
      getMissingSkillGenerationFields({
        isVisitor: true,
        fullName: "Jane",
        email: "",
        phoneNumber: "",
        careerHistory: [makeCareerEntry({ companyName: "Acme" })],
      }),
    ).toEqual(["last name", "email", "phone number", "position", "responsibilities"]);
  });

  it("uses the most complete career entry when no job is complete", () => {
    expect(
      getMissingSkillGenerationFields({
        isVisitor: false,
        candidateId: "candidate-1",
        fullName: "",
        email: "",
        phoneNumber: "",
        careerHistory: [
          makeCareerEntry({ companyName: "Acme" }),
          makeCareerEntry({ companyName: "Globex", positionHeld: "Engineer" }),
        ],
      }),
    ).toEqual(["responsibilities"]);
  });

  it("returns no missing fields when a candidate has a complete job", () => {
    expect(
      getMissingSkillGenerationFields({
        isVisitor: false,
        candidateId: "candidate-1",
        fullName: "",
        email: "",
        phoneNumber: "",
        careerHistory: [
          makeCareerEntry({
            companyName: "Acme",
            positionHeld: "Engineer",
            tasks: ["Built features"],
          }),
        ],
      }),
    ).toEqual([]);
  });
});