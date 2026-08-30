import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiSlice } from "@/store/api/apiSlice";
import { pushNotification } from "@/store/slices/notificationSlice";
import type { CandidateProfile } from "@/modules/candidate/types";
import type { CandidateProfileUpdatePayload } from "@/modules/candidate/types";
import type { AppDispatch } from "@/store";

type SaveProfileArgs = {
  userId: string;
  payload: CandidateProfileUpdatePayload;
};

export const saveProfileThunk = createAsyncThunk<
  CandidateProfile,
  SaveProfileArgs,
  { dispatch: AppDispatch }
>("candidate/saveProfile", async (args, { dispatch, rejectWithValue }) => {
  try {
    const result = await dispatch(
      apiSlice.endpoints.updateCandidateProfile.initiate(args),
    ).unwrap();

    dispatch(
      pushNotification({
        title: "Profile updated",
        message: "Your changes were saved successfully.",
        level: "success",
      }),
    );

    return result;
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String(
            (error as { message?: unknown }).message ??
              "Unable to save your profile. Please try again.",
          )
        : "Unable to save your profile. Please try again.";

    dispatch(
      pushNotification({
        title: "Save failed",
        message,
        level: "error",
      }),
    );

    return rejectWithValue(error);
  }
});

export const fetchCandidateProfileThunk = (candidateId: string, userId?: string) =>
  apiSlice.endpoints.getCandidateProfile.initiate({ candidateId, userId }, {
    forceRefetch: false,
  });

export const fetchCandidateDashboardThunk = () =>
  apiSlice.endpoints.getCandidateDashboard.initiate({}, {
    forceRefetch: false,
  });
