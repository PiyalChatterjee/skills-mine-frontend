import { describe, expect, it } from "vitest";
import type { CandidateProfile } from "@/types/api";
import { isCandidateProfileCompleteForOnboarding } from "@/modules/candidate/utils/profileCompleteness";

const buildProfile = (overrides?: Partial<CandidateProfile>): CandidateProfile => ({
  userId: "candidate-1",
  personalDetails: {
    firstName: "Flow",
    lastName: "Candidate",
    email: "flow@example.com",
    mobileNumber: "+27821234567",
    location: "Johannesburg, Gauteng",
    nationality: "South African",
    idNumber: "",
    eeStatus: "",
    profileImageUrl: "",
    thumbnailUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  },
  desiredJob: {
    jobTitle: "Software Engineer",
    industry: "Technology",
    workType: "Remote",
    employmentType: "Permanent",
    salaryExpectation: 0,
    availableFrom: "Immediately",
  },
  education: {
    certifications: ["AWS Certified Developer"],
    highestEarned: "BSc Computer Science",
  },
  experience: [
    {
      company: "Acme Corp",
      jobTitle: "Software Engineer",
      startDate: "2020-01-01",
      endDate: "",
    },
  ],
  skills: [],
  languages: [],
  ...overrides,
});

describe("isCandidateProfileCompleteForOnboarding", () => {
  it("returns true when profile satisfies profile creation requirements", () => {
    expect(isCandidateProfileCompleteForOnboarding(buildProfile())).toBe(true);
  });

  it("returns false when required profile creation fields are missing", () => {
    const incompleteProfile = buildProfile({
      desiredJob: {
        ...buildProfile().desiredJob,
        jobTitle: "",
      },
    });

    expect(isCandidateProfileCompleteForOnboarding(incompleteProfile)).toBe(false);
  });
});
