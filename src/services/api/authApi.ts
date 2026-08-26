import { decodeJwtPayload } from "@/app/auth/jwt";
import { tokenStorage } from "@/app/auth/tokenStorage";
import { apiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import {
  PERMISSIONS,
  type AuthUser,
  type CandidateRegistrationRequest,
  type CandidateRegistrationResponse,
  type ChangePasswordRequest,
  type CurrentUserResponse,
  type ForgotPasswordRequest,
  type GoogleTokenExchangeRequest,
  type GoogleTokenExchangeResponse,
  type JwtTokens,
  type LoginRequest,
  type LoginResponse,
  type Permission,
  type RegisterRequest,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type Role,
  type SignUpResponse,
  type StaffRegistrationRequest,
  type StaffRegistrationResponse,
} from "@/types/auth";
import type { SuccessEnvelope } from "@/types/api";
import { toSouthAfricaApiPhoneNumber } from "@/app/phoneNumber";

const withNormalizedMobileNumber = <
  T extends { mobileNumber?: string },
>(payload: T): T => {
  if (!payload.mobileNumber) {
    return payload;
  }

  return {
    ...payload,
    mobileNumber: toSouthAfricaApiPhoneNumber(payload.mobileNumber),
  };
};

const unwrapCurrentUserResponse = (
  response: CurrentUserResponse | SuccessEnvelope<CurrentUserResponse>,
): CurrentUserResponse => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as SuccessEnvelope<CurrentUserResponse>).data;
  }

  return response as CurrentUserResponse;
};

const rolePermissions: Record<Role, Permission[]> = {
  JOB_SEEKER: ["VIEW_JOBS", "APPLY_JOB", "UPLOAD_CV", "VIEW_DASHBOARD"],
  RECRUITER: [
    "MANDATE_CREATE",
    "MANDATE_EDIT",
    "PIPELINE_ADVANCE",
    "CRM_EDIT",
    "CANDIDATE_VIEW",
    "VIEW_DASHBOARD",
  ],
  MANCO: ["PIPELINE_VIEW", "REPORT_VIEW", "RECRUITER_VIEW", "VIEW_DASHBOARD"],
  EXCO: ["PIPELINE_VIEW", "REPORT_VIEW", "RECRUITER_VIEW", "VIEW_DASHBOARD"],
  ADMIN: ["ALL"],
};

const normalizeRole = (value: unknown): Role => {
  if (
    value === "JOB_SEEKER" ||
    value === "RECRUITER" ||
    value === "MANCO" ||
    value === "EXCO" ||
    value === "ADMIN"
  ) {
    return value;
  }

  return "JOB_SEEKER";
};

const normalizePermissions = (roles: Role[]): Permission[] => {
  const merged = new Set<Permission>();

  roles.forEach((role) => {
    rolePermissions[role].forEach((permission) => {
      if (permission === "ALL") {
        PERMISSIONS.forEach((item) => merged.add(item));
        return;
      }

      merged.add(permission);
    });
  });

  return Array.from(merged);
};

const buildAuthUserFromCurrentUser = (
  currentUser: CurrentUserResponse,
  accessToken: string,
): AuthUser => {
  const payload = decodeJwtPayload(accessToken);
  const roles =
    currentUser.roles.length > 0
      ? currentUser.roles.map(normalizeRole)
      : [normalizeRole(payload?.roles?.[0])];
  const role = roles[0] ?? "JOB_SEEKER";
  const firstName =
    payload?.firstName ?? payload?.name?.split(" ")?.[0] ?? "";
  const lastName =
    payload?.lastName ??
    payload?.name?.split(" ")?.slice(1).join(" ") ??
    "";
  const displayName =
    payload?.name ?? (`${firstName} ${lastName}`.trim() || currentUser.email);

  return {
    id: currentUser.userId,
    userId: currentUser.userId,
    candidateId: currentUser.candidateId ?? payload?.candidateId ?? payload?.candidate_id,
    email: currentUser.email,
    firstName,
    lastName,
    displayName,
    role,
    roles,
    accountStatus: currentUser.accountStatus,
    permissions: normalizePermissions(roles),
  };
};

const buildAuthUserFromJwt = (accessToken: string): AuthUser => {
  const payload = decodeJwtPayload(accessToken);
  const roles = [normalizeRole(payload?.roles?.[0])];
  const role = roles[0];
  const firstName =
    payload?.firstName ?? payload?.name?.split(" ")?.[0] ?? "";
  const lastName =
    payload?.lastName ??
    payload?.name?.split(" ")?.slice(1).join(" ") ??
    "";
  const displayName =
    payload?.name ?? (`${firstName} ${lastName}`.trim() || (payload?.email ?? ""));

  return {
    id: payload?.userId ?? payload?.sub ?? "",
    userId: payload?.userId ?? payload?.sub ?? "",
    candidateId: payload?.candidateId ?? payload?.candidate_id,
    email: payload?.email ?? "",
    firstName,
    lastName,
    displayName,
    role,
    roles,
    permissions: normalizePermissions(roles),
  };
};

export const mapLoginResponseToSession = async (
  response: LoginResponse,
): Promise<{ user: AuthUser; tokens: JwtTokens }> => {
  const { accessToken, idToken, refreshToken } = response.data;
  const tokens: JwtTokens = { accessToken, idToken, refreshToken };
  const jwtUser = buildAuthUserFromJwt(accessToken);

  // Store tokens temporarily so the Axios interceptor can attach the Bearer header
  tokenStorage.setTokens(tokens);

  try {
    const currentUser = await authApi.getCurrentUser();
    const user = buildAuthUserFromCurrentUser(currentUser, accessToken);
    return { user, tokens };
  } catch {
    // Fall back to JWT claims only when the current-user request is unavailable.
    return { user: jwtUser, tokens };
  }
};

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return unwrapResponseData(
      apiClient.post<LoginResponse>(apiEndpoints.auth.login, payload),
    );
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await unwrapResponseData(
      apiClient.get<CurrentUserResponse | SuccessEnvelope<CurrentUserResponse>>(
        apiEndpoints.auth.me,
      ),
    );

    return unwrapCurrentUserResponse(response);
  },

  async exchangeGoogleToken(
    payload: GoogleTokenExchangeRequest,
  ): Promise<GoogleTokenExchangeResponse> {
    return unwrapResponseData(
      apiClient.post<GoogleTokenExchangeResponse>(
        apiEndpoints.auth.googleExchange,
        payload,
      ),
    );
  },

  /** @deprecated Use candidateRegister or staffRegister */
  async register(payload: RegisterRequest): Promise<SignUpResponse> {
    return unwrapResponseData(
      apiClient.post<SignUpResponse>(
        apiEndpoints.auth.register,
        withNormalizedMobileNumber(payload),
      ),
    );
  },

  async candidateRegister(
    payload: CandidateRegistrationRequest,
  ): Promise<CandidateRegistrationResponse> {
    return unwrapResponseData(
      apiClient.post<CandidateRegistrationResponse>(
        apiEndpoints.auth.candidateRegister,
        withNormalizedMobileNumber(payload),
      ),
    );
  },

  async staffRegister(
    payload: StaffRegistrationRequest,
  ): Promise<StaffRegistrationResponse> {
    return unwrapResponseData(
      apiClient.post<StaffRegistrationResponse>(
        apiEndpoints.auth.staffRegister,
        withNormalizedMobileNumber(payload),
      ),
    );
  },

  async validateStaffInvitation(token: string): Promise<unknown> {
    return unwrapResponseData(
      apiClient.post(apiEndpoints.auth.staffInvitationValidate, { token }),
    );
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<unknown> {
    return unwrapResponseData(
      apiClient.post(apiEndpoints.auth.forgotPassword, payload),
    );
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return unwrapResponseData(
      apiClient.post<ResetPasswordResponse>(apiEndpoints.auth.resetPassword, payload),
    );
  },

  async changePassword(payload: ChangePasswordRequest): Promise<unknown> {
    return unwrapResponseData(
      apiClient.post(apiEndpoints.auth.changePassword, payload),
    );
  },

  async logout(): Promise<void> {
    await apiClient.post(apiEndpoints.auth.logout);
  },
};
