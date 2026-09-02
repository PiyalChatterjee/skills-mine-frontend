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
      state.buildMyCvExists = Boolean(action.payload.resumeId);
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
