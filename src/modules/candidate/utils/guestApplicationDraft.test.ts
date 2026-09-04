import { beforeEach, describe, expect, it } from "vitest";
import type { Job } from "@/types";
import {
  GUEST_APPLICATION_DRAFT_STORAGE_KEY,
  createGuestApplicationDraft,
  getGuestApplicationDrafts,
  saveGuestApplicationCv,
  updateGuestApplicationDraft,
} from "./guestApplicationDraft";

const job = (jobId: string): Job => ({
  jobId,
  title: `Role ${jobId}`,
  company: "SkillsMine",
  employmentType: "Permanent",
  workType: "Hybrid",
  salaryRange: "Negotiable",
  responsibilities: [],
  status: "Open",
  applicationCount: 0,
  postedDate: "2026-01-01",
});

describe("guest application drafts", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("keeps separate drafts for multiple guest job applications", () => {
    createGuestApplicationDraft(job("j001"));
    createGuestApplicationDraft(job("j002"));

    expect(getGuestApplicationDrafts()).toEqual([
      expect.objectContaining({ jobId: "j001", applicationStatus: "pending-authentication" }),
      expect.objectContaining({ jobId: "j002", applicationStatus: "pending-authentication" }),
    ]);
  });

  it("replaces an existing draft for the same job", () => {
    createGuestApplicationDraft(job("j001"));
    createGuestApplicationDraft({ ...job("j001"), title: "Updated role" });

    expect(getGuestApplicationDrafts()).toEqual([
      expect.objectContaining({ jobId: "j001", jobTitle: "Updated role" }),
    ]);
  });

  it("stores the completed CV with its selected job", () => {
    createGuestApplicationDraft(job("j001"));
    saveGuestApplicationCv("j001", { skills: ["React"] });

    expect(getGuestApplicationDrafts()[0]).toMatchObject({
      applicationStatus: "cv-completed",
      cvData: { skills: ["React"] },
    });
  });

  it("discards expired or malformed storage", () => {
    sessionStorage.setItem(
      GUEST_APPLICATION_DRAFT_STORAGE_KEY,
      JSON.stringify([
        { ...createGuestApplicationDraft(job("j001")), expiresAt: "2020-01-01T00:00:00.000Z" },
        { invalid: true },
      ]),
    );

    expect(getGuestApplicationDrafts()).toEqual([]);
    expect(sessionStorage.getItem(GUEST_APPLICATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("records successful restoration so a retry does not reapply", () => {
    createGuestApplicationDraft(job("j001"));
    updateGuestApplicationDraft("j001", { applicationStatus: "restored" });

    expect(getGuestApplicationDrafts()[0]).toMatchObject({
      applicationStatus: "restored",
    });
  });
});