import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ApiError } from '@/types/api'

export interface CandidateEducation {
  institution: string
  qualification: string
  year: number
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

const candidateProfileSlice = createSlice({
  name: 'candidateProfile',
  initialState,
  reducers: {
    fetchCandidateProfileStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchCandidateProfileSuccess: (
      state,
      action: PayloadAction<CandidateProfile>,
    ) => {
      state.profile = action.payload
      state.isLoading = false
      state.error = null
    },
    fetchCandidateProfileFailure: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearCandidateProfile: (state) => {
      state.profile = null
      state.isLoading = false
      state.error = null
    },
  },
})

export const getCandidateProfileErrorMessage = (
  error: unknown,
): string => {
  const apiError = error as { response?: { data?: ApiError } }
  return (
    apiError?.response?.data?.message ??
    'Unable to load candidate profile details.'
  )
}

export const {
  fetchCandidateProfileStart,
  fetchCandidateProfileSuccess,
  fetchCandidateProfileFailure,
  clearCandidateProfile,
} = candidateProfileSlice.actions

export default candidateProfileSlice.reducer
