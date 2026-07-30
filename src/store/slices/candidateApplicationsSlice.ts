import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { candidateApi } from '@/services/api/candidateApi'
import type { ApiError } from '@/types/api'

export interface CandidateApplication {
  applicationId: string
  candidateId: string
  candidateName: string
  jobId: string
  jobTitle: string
  company: string
  currentStage: string
  appliedDate: string
  matchScore: number
  coverLetter: string
  isGuest: boolean
  updatedAt: string
}

interface CandidateApplicationsState {
  applications: CandidateApplication[]
  isLoading: boolean
  error: string | null
}

const initialState: CandidateApplicationsState = {
  applications: [],
  isLoading: false,
  error: null,
}

const getApplicationErrorMessage = (error: unknown): string => {
  const apiError = error as { response?: { data?: ApiError } }
  const fallbackError = error as { message?: string }
  return (
    apiError?.response?.data?.message ??
    fallbackError?.message ??
    'Unable to load application details.'
  )
}

export const fetchCandidateApplications = createAsyncThunk<
  CandidateApplication[],
  string[],
  { rejectValue: string }
>(
  'candidateApplications/fetchAll',
  async (applicationIds, { rejectWithValue }) => {
    try {
      return await Promise.all(
        applicationIds.map((id) => candidateApi.getApplicationById(id)),
      )
    } catch (error) {
      return rejectWithValue(getApplicationErrorMessage(error))
    }
  },
)

const candidateApplicationsSlice = createSlice({
  name: 'candidateApplications',
  initialState,
  reducers: {
    clearCandidateApplications: (state) => {
      state.applications = []
      state.isLoading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateApplications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCandidateApplications.fulfilled, (state, action) => {
        state.applications = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(fetchCandidateApplications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? 'Unable to load application details.'
      })
  },
})

export const { clearCandidateApplications } = candidateApplicationsSlice.actions
export default candidateApplicationsSlice.reducer
