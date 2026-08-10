import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/types/auth";

export type AuthStatus = "idle" | "authenticated" | "unauthenticated";

interface AuthTokens {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
}

interface CurrentUser {
  userId: string;
  email: string;
  roles: Role[];
  accountStatus: string;
}

interface AuthState {
  tokens: AuthTokens;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  status: AuthStatus;
}

const initialState: AuthState = {
  tokens: { accessToken: null, idToken: null, refreshToken: null },
  currentUser: null,
  isAuthenticated: false,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSession: (
      state,
      action: PayloadAction<{ currentUser: CurrentUser; tokens: AuthTokens }>,
    ) => {
      state.currentUser = action.payload.currentUser;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.status = "authenticated";
    },
    clearAuthSession: (state) => {
      state.currentUser = null;
      state.tokens = { accessToken: null, idToken: null, refreshToken: null };
      state.isAuthenticated = false;
      state.status = "unauthenticated";
    },
    setAuthStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
  },
});

export const { setAuthSession, clearAuthSession, setAuthStatus } =
  authSlice.actions;

export default authSlice.reducer;
