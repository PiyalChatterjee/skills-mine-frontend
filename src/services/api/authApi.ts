import { decodeJwtPayload } from "@/app/auth/jwt";
import { apiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import {
  PERMISSIONS,
  type AuthUser,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type GoogleTokenExchangeRequest,
  type GoogleTokenExchangeResponse,
  type JwtTokens,
  type LoginRequest,
  type LoginResponse,
  type Permission,
  type RegisterRequest,
  type Role,
  type SignUpResponse,
} from "@/types/auth";

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
  ADMIN: ["ALL"],
};

const normalizeRole = (value: unknown): Role => {
  if (
    value === "JOB_SEEKER" ||
    value === "RECRUITER" ||
    value === "MANCO" ||
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

const buildAuthUserFromToken = (
  accessToken: string,
  rolesFromResponse: Role[],
  profileCompleted: number,
): AuthUser => {
  const payload = decodeJwtPayload(accessToken);
  const roles =
    rolesFromResponse.length > 0
      ? rolesFromResponse
      : [normalizeRole(payload?.roles?.[0])];
  const role = roles[0] ?? "JOB_SEEKER";
  const firstName =
    payload?.firstName ?? payload?.name?.split(" ")?.[0] ?? "SkillsMine";
  const lastName =
    payload?.lastName ??
    payload?.name?.split(" ")?.slice(1).join(" ") ??
    "User";
  const displayName = payload?.name ?? `${firstName} ${lastName}`.trim();
  const userId = payload?.userId ?? payload?.sub ?? "";

  return {
    id: userId,
    userId,
    email: payload?.email ?? "",
    firstName,
    lastName,
    displayName,
    role,
    roles,
    recruiterId: payload?.recruiterId,
    profileCompleted,
    permissions: normalizePermissions(roles),
  };
};

export const mapLoginResponseToSession = (
  response: LoginResponse,
): { user: AuthUser; tokens: JwtTokens } => ({
  user: buildAuthUserFromToken(
    response.data.accessToken,
    response.data.roles.map(normalizeRole),
    response.data.profileCompleted,
  ),
  tokens: {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  },
});

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return unwrapResponseData(
      apiClient.post<LoginResponse>(apiEndpoints.auth.login, payload),
    );
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

  async register(payload: RegisterRequest): Promise<SignUpResponse> {
    return unwrapResponseData(
      apiClient.post<SignUpResponse>(apiEndpoints.auth.register, payload),
    );
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<unknown> {
    return unwrapResponseData(
      apiClient.post(apiEndpoints.auth.forgotPassword, payload),
    );
  },

  async changePassword(payload: ChangePasswordRequest): Promise<unknown> {
    return unwrapResponseData(
      apiClient.post(apiEndpoints.auth.changePassword, payload),
    );
  },

  async logout(): Promise<unknown> {
    return unwrapResponseData(apiClient.post(apiEndpoints.auth.logout));
  },
};
