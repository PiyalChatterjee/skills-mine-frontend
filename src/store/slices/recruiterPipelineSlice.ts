import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Candidate,
  CandidateDocument,
  Mandate,
  PipelineStage,
  RecruiterNote,
  StageCounts,
} from "@/modules/recruiter/types";
import {
  MOCK_CANDIDATES,
  MOCK_MANDATES,
  INITIAL_STAGE_COUNTS,
} from "@/modules/recruiter/data/mockData";

// ── State ──────────────────────────────────────────────────────────────

interface RecruiterPipelineState {
  mandates: Mandate[];
  candidates: Candidate[];
  stageCounts: StageCounts;
  selectedMandateId: string | null;
}

const initialState: RecruiterPipelineState = {
  mandates: MOCK_MANDATES,
  candidates: MOCK_CANDIDATES,
  stageCounts: INITIAL_STAGE_COUNTS,
  selectedMandateId: null,
};

// ── Slice ──────────────────────────────────────────────────────────────

const recruiterPipelineSlice = createSlice({
  name: "recruiterPipeline",
  initialState,
  reducers: {
    // Remember which mandate was last opened (for back-navigation context)
    selectMandate: (state, action: PayloadAction<string>) => {
      state.selectedMandateId = action.payload;
    },

    clearSelectedMandate: (state) => {
      state.selectedMandateId = null;
    },

    // Move a candidate from their current stage to a new stage
    moveCandidateToStage: (
      state,
      action: PayloadAction<{
        candidateId: string;
        toStage: PipelineStage;
        recruiterId: string;
        recruiterName: string;
        note?: string;
      }>,
    ) => {
      const { candidateId, toStage, recruiterId, recruiterName, note } =
        action.payload;
      const candidate = state.candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      const fromStage = candidate.currentStage;
      if (fromStage === toStage) return;

      // Record history entry
      candidate.stageHistory.push({
        from: fromStage,
        to: toStage,
        timestamp: new Date().toISOString(),
        recruiterId,
        recruiterName,
        note,
      });

      // Update stage counts
      state.stageCounts[fromStage] = Math.max(
        0,
        state.stageCounts[fromStage] - 1,
      );
      state.stageCounts[toStage] = state.stageCounts[toStage] + 1;

      // Update candidate stage
      candidate.currentStage = toStage;

      // If rejected → mark closed reason
      if (toStage === "Closed") {
        candidate.closedReason = "Rejected";
      }
    },

    // Add a recruiter note to a candidate
    addRecruiterNote: (
      state,
      action: PayloadAction<{
        candidateId: string;
        text: string;
        recruiterId: string;
        recruiterName: string;
      }>,
    ) => {
      const { candidateId, text, recruiterId, recruiterName } = action.payload;
      const candidate = state.candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      const note: RecruiterNote = {
        id: nanoid(),
        text,
        timestamp: new Date().toISOString(),
        recruiterId,
        recruiterName,
      };
      candidate.recruiterNotes.push(note);
    },

    // Add an uploaded document to a candidate
    addDocument: (
      state,
      action: PayloadAction<{
        candidateId: string;
        document: Omit<CandidateDocument, "id">;
      }>,
    ) => {
      const { candidateId, document } = action.payload;
      const candidate = state.candidates.find((c) => c.id === candidateId);
      if (!candidate) return;
      candidate.documents.push({ ...document, id: nanoid() });
    },
  },
});

export const {
  selectMandate,
  clearSelectedMandate,
  moveCandidateToStage,
  addRecruiterNote,
  addDocument,
} = recruiterPipelineSlice.actions;

export default recruiterPipelineSlice.reducer;
