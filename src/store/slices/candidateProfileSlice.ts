import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { candidateApi } from '@/services/api/candidateApi'
import type { ApiError } from '@/types/api'

export interface CandidateEducation {
  institution: string
  qualification: string
  year: number
}

export interface CandidateExperience {
  company: string
  title: string
  from: string
  to: string
}

export interface CandidateDocument {
  docId: string
  type: string
  uploadedAt: string
}

export interface CandidateProfile {
  candidateId: string
  fullName: string
  email: string
  phone: string
  profilePhotoUrl?: string
  password?: string
  location: string
  currentTitle: string
  currentCompany: string
  experienceYears: number
  skills: string[]
  education: CandidateEducation[]
  experience?: CandidateExperience[]
  documents?: CandidateDocument[]
  languages?: string[]
  profileComplete?: number
  applications?: string[]
}

interface CandidateProfileState {
  profile: CandidateProfile | null
  isLoading: boolean
  error: string | null
}

const initialState: CandidateProfileState = {
  profile: null,
  isLoading: false,
  error: null,
}

export const getCandidateProfileErrorMessage = (
  error: unknown,
): string => {
  const apiError = error as { response?: { data?: ApiError } }
  const fallbackError = error as { message?: string }
  return (
    apiError?.response?.data?.message ??
    fallbackError?.message ??
    'Unable to load candidate profile details.'
  )
}

export const fetchCandidateProfileById = createAsyncThunk<
  CandidateProfile,
  string,
  { rejectValue: string }
>(
  'candidateProfile/fetchById',
  async (candidateId, { rejectWithValue }) => {
    try {
      return await candidateApi.getById(candidateId)
    } catch (error) {
      return rejectWithValue(getCandidateProfileErrorMessage(error))
    }
  },
)

export const updateCandidateProfileById = createAsyncThunk<
  CandidateProfile,
  { candidateId: string; payload: Omit<CandidateProfile, 'candidateId'> },
  { rejectValue: string }
>(
  'candidateProfile/updateById',
  async ({ candidateId, payload }, { rejectWithValue }) => {
    try {
      return await candidateApi.updateById(candidateId, payload)
    } catch (error) {
      return rejectWithValue(getCandidateProfileErrorMessage(error))
    }
  },
)

const candidateProfileSlice = createSlice({
  name: 'candidateProfile',
  initialState,
  reducers: {
    clearCandidateProfile: (state) => {
      state.profile = null
      state.isLoading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateProfileById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCandidateProfileById.fulfilled, (state, action) => {
        state.profile = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(fetchCandidateProfileById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? 'Unable to load candidate profile details.'
      })
      .addCase(updateCandidateProfileById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCandidateProfileById.fulfilled, (state, action) => {
        state.profile = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(updateCandidateProfileById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? 'Unable to update candidate profile details.'
      })
  },
})

export const {
  clearCandidateProfile,
} = candidateProfileSlice.actions

export default candidateProfileSlice.reducer
