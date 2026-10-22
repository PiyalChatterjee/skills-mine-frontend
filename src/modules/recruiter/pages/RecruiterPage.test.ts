import { describe, expect, it } from "vitest";
import type { PipelineApplication } from "@/types/api";
import { buildColumnsFromApplications } from "./RecruiterPage";

const createApplication = (
  applicationId: string,
  jobProfileId: string,
  currentStageCode: string,
): PipelineApplication => ({
  applicationId,
  applicationPartyId: `party-${applicationId}`,
  jobProfile: {
    jobProfileId,
    positionTitle: `Role ${jobProfileId}`,
    clientId: `client-${jobProfileId}`,
    clientName: `Client ${jobProfileId}`,
    fillByDate: "2026-12-31",
    workType: "ONSITE",
    employmentType: "FULL_TIME",
  },
  candidate: {
    candidateId: `candidate-${applicationId}`,
    visitorId: "",
    firstName: "Candidate",
    lastName: applicationId,
  },
  assignedRecruiterId: "recruiter-1",
  currentStageCode,
  sourceCode: "CANDIDATE_APPLIED",
  matchScoreLatest: 0,
  createdAt: "2026-10-22T00:00:00.000Z",
});

describe("buildColumnsFromApplications", () => {
  it("shows one card per job profile, using the first supported application stage", () => {
    const columns = buildColumnsFromApplications(
      [
        createApplication("rejected", "job-1", "REJECT"),
        createApplication("first", "job-1", "INBOUND"),
        createApplication("duplicate", "job-1", "INTERVIEW"),
        createApplication("other", "job-2", "SCREENING"),
        createApplication("rejected-only", "job-3", "REJECT"),
      ],
      [
        { label: "Inbound", colorClass: "", cards: [] },
        { label: "Screening", colorClass: "", cards: [] },
        { label: "Assessment", colorClass: "", cards: [] },
        { label: "Interview", colorClass: "", cards: [] },
        { label: "Shortlist", colorClass: "", cards: [] },
        { label: "Offer", colorClass: "", cards: [] },
        { label: "Closed", colorClass: "", cards: [] },
      ],
    );

    const inboundCards = columns.find(({ label }) => label === "Inbound")?.cards;
    const interviewCards = columns.find(
      ({ label }) => label === "Interview",
    )?.cards;
    const screeningCards = columns.find(
      ({ label }) => label === "Screening",
    )?.cards;

    expect(inboundCards).toHaveLength(1);
    expect(inboundCards?.[0]).toMatchObject({
      id: "job-1",
      jobProfileId: "job-1",
    });
    expect(interviewCards).toHaveLength(0);
    expect(screeningCards).toHaveLength(1);
    expect(columns.flatMap(({ cards }) => cards)).toHaveLength(2);
  });
});
