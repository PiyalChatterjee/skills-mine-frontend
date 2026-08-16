import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/services/api/authApi";
import type { ResetPasswordRequest, ResetPasswordResponse } from "@/types/auth";

export const resetPasswordThunk = createAsyncThunk<
  ResetPasswordResponse,
  ResetPasswordRequest
>("auth/resetPassword", async (payload) => {
  return authApi.resetPassword(payload);
});
