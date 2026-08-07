import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { apiSlice } from "@/store/api/apiSlice";

// ── Auth / Identity ────────────────────────────────────────────────────────

export const selectUserId = (state: RootState): string | null =>
  state.auth.user?.userId ?? state.candidate.userId ?? null;

export const selectAuthUser = (state: RootState) => state.auth.user;

// ── User Profile & Saved Jobs ──────────────────────────────────────────────

export const selectSavedJobs = (state: RootState) => state.candidate.savedJobs;

export const selectSavedJobIds = createSelector(
  selectSavedJobs,
  (jobs) => new Set(jobs.map((j) => j.jobId)),
);

export const selectIsJobSaved = (jobId: string) =>
  createSelector(selectSavedJobIds, (ids) => ids.has(jobId));

// ── Skills ─────────────────────────────────────────────────────────────────

export const selectAvailableSkills = (state: RootState) =>
  state.candidate.availableSkills;

export const selectSelectedSkillIds = (state: RootState) =>
  state.candidate.selectedSkillIds;

export const selectSelectedSkills = createSelector(
  selectAvailableSkills,
  selectSelectedSkillIds,
  (available, selectedIds) =>
    available.filter((s) => selectedIds.includes(s.skillId)),
);

// ── Candidate Profile (RTK Query cache) ───────────────────────────────────

export const selectCandidateProfile =
  (userId: string | null | undefined) => (state: RootState) => {
    if (!userId) return undefined;
    return apiSlice.endpoints.getCandidateProfile.select(userId)(state).data;
  };

// ── Build My CV ────────────────────────────────────────────────────────────

export const selectBuildMyCv = (state: RootState) => state.candidate.buildMyCv;

export const selectBuildMyCvLoaded = (state: RootState) =>
  state.candidate.buildMyCvLoaded;

export const selectBuildMyCvExists = (state: RootState) =>
  state.candidate.buildMyCvExists;

export const selectBuildMyCvLastModified = (state: RootState) =>
  state.candidate.buildMyCvLastModified;

export const selectBuildMyCvPersonalDetails = (state: RootState) =>
  state.candidate.buildMyCv.personalDetails;

export const selectBuildMyCvCareerHistory = (state: RootState) =>
  state.candidate.buildMyCv.careerHistory;

export const selectBuildMyCvSkills = (state: RootState) =>
  state.candidate.buildMyCv.skills;

export const selectBuildMyCvEducation = (state: RootState) =>
  state.candidate.buildMyCv.education;

export const selectBuildMyCvLanguages = (state: RootState) =>
  state.candidate.buildMyCv.languages;
