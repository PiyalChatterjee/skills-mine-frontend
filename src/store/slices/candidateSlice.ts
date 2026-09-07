import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  BuildMyCvEducationSection,
  BuildMyCvPersonalDetails,
  BuildMyCvState,
  CandidateExperience,
  CandidateLanguage,
  UserSkill,
} from "@/types/api";

interface CandidateState {
  userId: string | null;
  savedJobs: string[];
  recommendedJobs: string[];
  availableSkills: UserSkill[];
  buildMyCv: BuildMyCvState;
  buildMyCvLoaded: boolean;
  buildMyCvExists: boolean;
  buildMyCvLastModified: string | null;
}

const initialBuildMyCv: BuildMyCvState = {
  personalDetails: {},
  careerHistory: [],
  skills: [],
  education: { secondaryEducation: [], tertiaryEducation: [] },
  languages: [],
  validation: [],
};

const initialState: CandidateState = {
  userId: null,
  savedJobs: [],
  recommendedJobs: [],
  availableSkills: [],
  buildMyCv: initialBuildMyCv,
  buildMyCvLoaded: false,
  buildMyCvExists: false,
  buildMyCvLastModified: null,
};

// The mock/real v2 cv-build endpoint never returns a resumeId, so existence must be
// inferred from populated content instead (mirrors useCandidateQueries.hasBuildMyCvData).
const hasBuildMyCvContent = (data: BuildMyCvState): boolean => {
  if (data.resumeId) return true;

  const hasPersonalDetails = Boolean(
    data.personalDetails?.firstName?.trim() && data.personalDetails?.lastName?.trim(),
  );
  const hasCareerHistory = (data.careerHistory?.length ?? 0) > 0;
  const hasSkills = (data.skills?.length ?? 0) > 0;
  const hasEducation =
    (data.education?.tertiaryEducation?.length ?? 0) > 0 ||
    (data.education?.secondaryEducation?.length ?? 0) > 0;

  return hasPersonalDetails && (hasCareerHistory || hasSkills || hasEducation);
};

const candidateSlice = createSlice({
  name: "candidate",
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },

    setSavedJobs: (state, action: PayloadAction<string[]>) => {
      state.savedJobs = action.payload;
    },

    setRecommendedJobs: (state, action: PayloadAction<string[]>) => {
      state.recommendedJobs = action.payload;
    },

    addSavedJob: (state, action: PayloadAction<string>) => {
      if (!state.savedJobs.includes(action.payload)) {
        state.savedJobs.push(action.payload);
      }
    },

    removeSavedJob: (state, action: PayloadAction<string>) => {
      state.savedJobs = state.savedJobs.filter((id) => id !== action.payload);
    },

    setAvailableSkills: (state, action: PayloadAction<UserSkill[]>) => {
      state.availableSkills = Array.isArray(action.payload) ? action.payload : [];
    },

    toggleSkill: (state, action: PayloadAction<string>) => {
      const skill = state.availableSkills.find((item) => item.skillId === action.payload);
      if (skill) skill.selected = !skill.selected;
    },

    setBuildMyCv: (state, action: PayloadAction<BuildMyCvState>) => {
      state.buildMyCv = action.payload;
      state.buildMyCvLoaded = true;
      state.buildMyCvExists = hasBuildMyCvContent(action.payload);
      state.buildMyCvLastModified = action.payload.lastModified ?? null;
    },

    setBuildMyCvMetadata: (
      state,
      action: PayloadAction<{
        exists: boolean;
        lastModified: string | null;
      }>,
    ) => {
      state.buildMyCvExists = action.payload.exists;
      state.buildMyCvLastModified = action.payload.lastModified;
    },

    updateBuildMyCvPersonalDetails: (
      state,
      action: PayloadAction<Partial<BuildMyCvPersonalDetails>>,
    ) => {
      state.buildMyCv.personalDetails = {
        ...state.buildMyCv.personalDetails,
        ...action.payload,
      };
    },

    updateBuildMyCvCareerHistory: (
      state,
      action: PayloadAction<CandidateExperience[]>,
    ) => {
      state.buildMyCv.careerHistory = action.payload;
    },

    updateBuildMyCvSkills: (state, action: PayloadAction<string[]>) => {
      state.buildMyCv.skills = action.payload;
    },

    updateBuildMyCvEducation: (
      state,
      action: PayloadAction<BuildMyCvEducationSection>,
    ) => {
      state.buildMyCv.education = action.payload;
    },

    updateBuildMyCvLanguages: (
      state,
      action: PayloadAction<CandidateLanguage[]>,
    ) => {
      state.buildMyCv.languages = action.payload;
    },

    clearCandidateState: () => initialState,
  },
});

export const {
  setUserId,
  setSavedJobs,
  setRecommendedJobs,
  addSavedJob,
  removeSavedJob,
  setAvailableSkills,
  toggleSkill,
  setBuildMyCv,
  setBuildMyCvMetadata,
  updateBuildMyCvPersonalDetails,
  updateBuildMyCvCareerHistory,
  updateBuildMyCvSkills,
  updateBuildMyCvEducation,
  updateBuildMyCvLanguages,
  clearCandidateState,
} = candidateSlice.actions;

export default candidateSlice.reducer;
