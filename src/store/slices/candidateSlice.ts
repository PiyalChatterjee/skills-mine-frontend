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
  selectedJobId: string | null;
  savedJobs: string[];
  recommendedJobs: string[];
  availableSkills: UserSkill[];
  selectedSkillIds: string[];
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
  selectedJobId: null,
  savedJobs: [],
  recommendedJobs: [],
  availableSkills: [],
  selectedSkillIds: [],
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

    setSelectedJobId: (state, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
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
      const nextSkills = Array.isArray(action.payload) ? action.payload : [];
      state.availableSkills = nextSkills;
      // sync selectedSkillIds from skills marked selected by the API
      state.selectedSkillIds = nextSkills
        .filter((s) => s.selected)
        .map((s) => s.skillId);
    },

    toggleSkill: (state, action: PayloadAction<string>) => {
      const skillId = action.payload;
      const idx = state.selectedSkillIds.indexOf(skillId);
      if (idx >= 0) {
        state.selectedSkillIds.splice(idx, 1);
        const skill = state.availableSkills.find((s) => s.skillId === skillId);
        if (skill) skill.selected = false;
      } else {
        state.selectedSkillIds.push(skillId);
        const skill = state.availableSkills.find((s) => s.skillId === skillId);
        if (skill) skill.selected = true;
      }
    },

    setBuildMyCv: (state, action: PayloadAction<BuildMyCvState>) => {
      state.buildMyCv = action.payload;
      state.buildMyCvLoaded = true;
    },

    setBuildMyCvExists: (state, action: PayloadAction<boolean>) => {
      state.buildMyCvExists = action.payload;
    },

    setBuildMyCvLastModified: (state, action: PayloadAction<string | null>) => {
      state.buildMyCvLastModified = action.payload;
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
  setSelectedJobId,
  setSavedJobs,
  setRecommendedJobs,
  addSavedJob,
  removeSavedJob,
  setAvailableSkills,
  toggleSkill,
  setBuildMyCv,
  setBuildMyCvExists,
  setBuildMyCvLastModified,
  updateBuildMyCvPersonalDetails,
  updateBuildMyCvCareerHistory,
  updateBuildMyCvSkills,
  updateBuildMyCvEducation,
  updateBuildMyCvLanguages,
  clearCandidateState,
} = candidateSlice.actions;

export default candidateSlice.reducer;
