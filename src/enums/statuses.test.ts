import { describe, expect, it } from "vitest";
import {
  ApplicationStatus, ApplicationStatusKey, ApplicationStatusLabel, ClosedReason,
  CrmClassification, CrmClassificationLabel, DocumentExtractionStatus,
  DocumentLifecycleStatus, GuestApplicationStatus, JobPostStatus, JobPostStatusLabel,
  LegacyPipelineStageCode, MandateStatus, OfferResponseStatus, PipelineStageCode, PipelineStageLabel, ProfileStatus,
} from "./statuses";
import { crmClassifications, crmClassificationLabels, crmNoteSchema } from "@/modules/crm/schema";
import { getApplicationStatusKey, getApplicationStatusLabel } from "@/modules/candidate/utils/applicationStatus";
import { workflowConfig } from "@/workflow/workflow.config";

describe("business status wire contracts", () => {
  it.each([
    [JobPostStatus, ["POSTED", "DRAFT", "CLOSED", "PAUSED", "CANCELLED", "OPEN", "FILLED"]],
    [JobPostStatusLabel, ["Posted", "Draft", "Closed", "Open"]],
    [MandateStatus, ["ACTIVE", "CLOSED", "ON_HOLD"]],
    [ApplicationStatus, ["SUBMITTED", "ACTIVE", "ON_HOLD", "CLOSED", "CANCELLED", "REJECTED", "APPLIED"]],
    [PipelineStageCode, ["INBOUND", "SCREENING", "ASSESSMENT", "SHORTLIST", "INTERVIEW", "OFFER", "REJECT", "OFFER_REJECT", "CLOSED"]],
    [LegacyPipelineStageCode, ["APPLIED", "SHORTLISTED", "PLACED"]],
    [PipelineStageLabel, ["Inbound", "Screening", "Assessment", "Interview", "Shortlist", "Offer", "Placed", "Closed"]],
    [ApplicationStatusKey, ["applied", "screening", "assessment", "interview", "shortlisted", "offer_extended", "offer_accepted", "offer_declined", "rejected", "unknown"]],
    [ApplicationStatusLabel, ["Applied", "Shortlisted", "Screened", "Assessed", "Interview Scheduled", "Offer Extended"]],
    [OfferResponseStatus, ["ACCEPTED", "DECLINED", "WITHDRAWN"]],
    [ClosedReason, ["Hired", "Rejected"]],
    [ProfileStatus, ["INCOMPLETE", "ACTIVE", "INACTIVE", "DELETED"]],
    [DocumentLifecycleStatus, ["ACTIVE", "DELETED"]],
    [DocumentExtractionStatus, ["NOT_STARTED"]],
    [CrmClassification, ["needs_attention", "hot_lead", "warm_contact", "cold_lead"]],
    [CrmClassificationLabel, ["Needs Attention", "Hot Lead", "Warm Contact", "Cold Lead"]],
    [GuestApplicationStatus, ["pending-authentication", "cv-completed", "restoring", "restored"]],
  ])("preserves exact values and ordering for %j", (values, expected) => {
    expect(Object.values(values)).toEqual(expected);
    expect(new Set(Object.values(values)).size).toBe(Object.values(values).length);
  });

  it("uses every CRM classification in validation and label mapping", () => {
    expect(crmClassifications).toEqual(Object.values(CrmClassification));
    for (const classification of crmClassifications) {
      expect(crmNoteSchema.safeParse({
        classification, note: "Follow-up scheduled", lastcontactDate: "", followupDate: "",
      }).success).toBe(true);
      expect(crmClassificationLabels[classification]).toBeTruthy();
    }
    expect(crmNoteSchema.safeParse({
      classification: "WARM_CONTACT", note: "Wrong wire casing", lastcontactDate: "", followupDate: "",
    }).success).toBe(false);
  });

  it("retains dashboard aliases, closed offers, and unknown API status fallback", () => {
    expect(getApplicationStatusKey(PipelineStageCode.INBOUND)).toBe(ApplicationStatusKey.APPLIED);
    expect(getApplicationStatusKey(" shortlisted ")).toBe(ApplicationStatusKey.SHORTLISTED);
    expect(getApplicationStatusKey(PipelineStageCode.CLOSED)).toBe(ApplicationStatusKey.OFFER_ACCEPTED);
    expect(getApplicationStatusKey(PipelineStageCode.REJECT)).toBe(ApplicationStatusKey.REJECTED);
    expect(getApplicationStatusLabel(PipelineStageCode.REJECT)).toBe(PipelineStageLabel.CLOSED);
    expect(getApplicationStatusKey("new_backend_status")).toBe(ApplicationStatusKey.UNKNOWN);
    expect(getApplicationStatusLabel("new_backend_status")).toBe("new_backend_status");
  });

  it("uses only confirmed backend codes in the workflow", () => {
    expect(workflowConfig.stages).toEqual([
      "INBOUND", "SCREENING", "ASSESSMENT", "SHORTLIST", "INTERVIEW", "OFFER", "REJECT", "OFFER_REJECT", "CLOSED",
    ]);
    expect(workflowConfig.transitions).toEqual([
      { from: "INBOUND", to: ["SCREENING", "CLOSED"] },
      { from: "SCREENING", to: ["ASSESSMENT", "CLOSED"] },
      { from: "ASSESSMENT", to: ["SHORTLIST", "CLOSED"] },
      { from: "SHORTLIST", to: ["INTERVIEW", "CLOSED"] },
      { from: "INTERVIEW", to: ["OFFER", "CLOSED"] },
      { from: "OFFER", to: ["CLOSED"] },
      { from: "REJECT", to: [] },
      { from: "OFFER_REJECT", to: [] },
      { from: "CLOSED", to: [] },
    ]);
  });
});
