import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi, mapLoginResponseToSession } from "./authApi";

const mockPost = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/axios", () => ({
  apiClient: { post: mockPost, get: mockGet },
  unwrapResponseData: async (promise: Promise<unknown>) => {
    const response = await promise;
    return (response as { data: unknown }).data;
  },
  unwrapEnvelopeData: async (promise: Promise<unknown>) => {
    const response = await promise;
    return (response as { data: { data: unknown } }).data.data;
  },
}));

vi.mock("@/services/api/endpoints", () => ({
  apiEndpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      candidateRegister: "/api/v1/auth/candidates/register",
      staffRegister: "/api/v1/auth/staff/register",
      staffInvitationValidate: "/api/v1/auth/staff-invitations/validate",
      forgotPassword: "/auth/forgot-password",
      resetPassword: "/api/v1/auth/reset-password",
      changePassword: "/auth/change-password",
      logout: "/auth/logout",
      googleExchange: "/auth/google/exchange",
      me: "/api/v1/users/me",
    },
    admin: {
      staffInvitations: "/api/v1/admin/staff-invitations",
    },
  },
  resolveEndpoint: (template: string) => template,
}));

vi.mock("@/app/auth/jwt", () => ({
  decodeJwtPayload: () => ({
    sub: "user-1",
    userId: "user-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    name: "Test User",
    roles: ["JOB_SEEKER"],
  }),
}));

vi.mock("@/app/auth/tokenStorage", () => ({
  tokenStorage: {
    setTokens: vi.fn(),
    clearAuth: vi.fn(),
  },
}));

const fakeLoginResponse = {
  success: true,
  statusCode: 200,
  message: "OK",
  data: {
    accessToken: "access-token",
    idToken: "id-token",
    refreshToken: "refresh-token",
    expiresIn: 3600,
    tokenType: "Bearer",
  },
};

const fakeCurrentUserResponse = {
  userId: "user-1",
  email: "test@example.com",
  provider: "local",
  roles: ["JOB_SEEKER" as const],
  accountStatus: "ACTIVE",
};

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("calls POST /auth/login with credentials", async () => {
      mockPost.mockResolvedValue({ data: fakeLoginResponse });
      await authApi.login({ username: "test@example.com", password: "pass" });
      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        username: "test@example.com",
        password: "pass",
      });
    });

    it("returns the login response data", async () => {
      mockPost.mockResolvedValue({ data: fakeLoginResponse });
      const result = await authApi.login({ username: "u", password: "p" });
      expect(result).toEqual(fakeLoginResponse);
    });
  });

  describe("getCurrentUser", () => {
    it("calls GET /api/v1/users/me", async () => {
      mockGet.mockResolvedValue({ data: { data: fakeCurrentUserResponse } });
      await authApi.getCurrentUser();
      expect(mockGet).toHaveBeenCalledWith("/api/v1/users/me");
    });

    it("returns the current user data", async () => {
      mockGet.mockResolvedValue({ data: { data: fakeCurrentUserResponse } });
      const result = await authApi.getCurrentUser();
      expect(result.userId).toBe("user-1");
      expect(result.email).toBe("test@example.com");
      expect(result.roles).toContain("JOB_SEEKER");
    });
  });

  describe("exchangeGoogleToken", () => {
    it("calls POST /auth/google/exchange with access token", async () => {
      mockPost.mockResolvedValue({ data: fakeLoginResponse });
      await authApi.exchangeGoogleToken({ accessToken: "google-token" });
      expect(mockPost).toHaveBeenCalledWith("/auth/google/exchange", {
        accessToken: "google-token",
      });
    });
  });

  describe("candidateRegister", () => {
    it("calls POST /api/v1/auth/candidates/register", async () => {
      mockPost.mockResolvedValue({ data: { success: true, statusCode: 201 } });
      await authApi.candidateRegister({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "Password1",
        confirmPassword: "Password1",
      });
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v1/auth/candidates/register",
        expect.objectContaining({ firstName: "Jane", email: "jane@example.com" }),
      );
    });
  });

  describe("staffRegister", () => {
    it("calls POST /api/v1/auth/staff/register", async () => {
      mockPost.mockResolvedValue({ data: { success: true, statusCode: 201 } });
      await authApi.staffRegister({
        firstName: "John",
        lastName: "Smith",
        email: "john@company.com",
        password: "Password1",
        confirmPassword: "Password1",
      });
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v1/auth/staff/register",
        expect.objectContaining({ firstName: "John" }),
      );
    });
  });

  describe("forgotPassword", () => {
    it("calls POST /auth/forgot-password", async () => {
      mockPost.mockResolvedValue({ data: {} });
      await authApi.forgotPassword({ email: "user@example.com" });
      expect(mockPost).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "user@example.com",
      });
    });
  });

  describe("resetPassword", () => {
    it("calls POST /api/v1/auth/reset-password", async () => {
      mockPost.mockResolvedValue({ data: {} });
      await authApi.resetPassword({
        resetToken: "reset-token",
        newPassword: "NewPass1",
        confirmNewPassword: "NewPass1",
      });
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password",
        expect.objectContaining({ resetToken: "reset-token" }),
      );
    });
  });

  describe("changePassword", () => {
    it("calls POST /auth/change-password", async () => {
      mockPost.mockResolvedValue({ data: {} });
      await authApi.changePassword({
        currentPassword: "old",
        newPassword: "new",
        confirmNewPassword: "new",
      });
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/change-password",
        expect.any(Object),
      );
    });
  });

  describe("logout", () => {
    it("calls POST /auth/logout and handles 204 No Content", async () => {
      mockPost.mockResolvedValue({ status: 204, data: "" });
      await authApi.logout();
      expect(mockPost).toHaveBeenCalledWith("/auth/logout");
    });
  });
});

describe("mapLoginResponseToSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { data: fakeCurrentUserResponse } });
  });

  it("maps login response to user and tokens (async)", async () => {
    const result = await mapLoginResponseToSession(fakeLoginResponse);
    expect(mockGet).toHaveBeenCalledWith("/api/v1/users/me");
    expect(result.tokens.accessToken).toBe("access-token");
    expect(result.tokens.idToken).toBe("id-token");
    expect(result.tokens.refreshToken).toBe("refresh-token");
    expect(result.user.userId).toBe("user-1");
    expect(result.user.email).toBe("test@example.com");
    expect(result.user.role).toBe("JOB_SEEKER");
    expect(result.user.roles).toContain("JOB_SEEKER");
    expect(result.user.permissions).toEqual(
      expect.arrayContaining([
        "VIEW_JOBS",
        "APPLY_JOB",
        "UPLOAD_CV",
        "VIEW_DASHBOARD",
      ]),
    );
  });

  it("uses roles from /users/me response", async () => {
    mockGet.mockResolvedValue({
      data: { data: { ...fakeCurrentUserResponse, roles: ["RECRUITER"] } },
    });
    const result = await mapLoginResponseToSession(fakeLoginResponse);
    expect(result.user.role).toBe("RECRUITER");
    expect(result.user.permissions).toContain("MANDATE_CREATE");
  });

  it("falls back to JOB_SEEKER when /users/me returns no roles", async () => {
    mockGet.mockResolvedValue({
      data: { data: { ...fakeCurrentUserResponse, roles: [] } },
    });
    const result = await mapLoginResponseToSession(fakeLoginResponse);
    expect(result.user.role).toBe("JOB_SEEKER");
  });

  it("maps ADMIN role with ALL permissions", async () => {
    mockGet.mockResolvedValue({
      data: { data: { ...fakeCurrentUserResponse, roles: ["ADMIN"] } },
    });
    const result = await mapLoginResponseToSession(fakeLoginResponse);
    expect(result.user.role).toBe("ADMIN");
    expect(result.user.permissions.length).toBeGreaterThan(5);
  });

  it("falls back to JWT-based user when /users/me fails", async () => {
    mockGet.mockRejectedValue(new Error("network error"));
    const result = await mapLoginResponseToSession(fakeLoginResponse);
    // JWT mock returns email: "test@example.com", so fallback user is built
    expect(result.user.email).toBe("test@example.com");
    expect(result.tokens.accessToken).toBe("access-token");
  });
});

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("calls POST /auth/login with credentials", async () => {
      mockPost.mockResolvedValue({ data: fakeLoginResponse });
      await authApi.login({ username: "test@example.com", password: "pass" });
      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        username: "test@example.com",
        password: "pass",
      });
    });

    it("returns the login response data", async () => {
      mockPost.mockResolvedValue({ data: fakeLoginResponse });
      const result = await authApi.login({ username: "u", password: "p" });
      expect(result).toEqual(fakeLoginResponse);
    });
  });

  describe("exchangeGoogleToken", () => {
    it("calls POST /auth/google/exchange with access token", async () => {
      mockPost.mockResolvedValue({ data: fakeLoginResponse });
      await authApi.exchangeGoogleToken({ accessToken: "google-token" });
      expect(mockPost).toHaveBeenCalledWith("/auth/google/exchange", {
        accessToken: "google-token",
      });
    });
  });

  describe("register", () => {
    it("calls POST /auth/register", async () => {
      mockPost.mockResolvedValue({ data: { success: true } });
      await authApi.register({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "Password1",
        confirmPassword: "Password1",
      });
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/register",
        expect.objectContaining({
          firstName: "Jane",
          email: "jane@example.com",
        }),
      );
    });
  });

  describe("forgotPassword", () => {
    it("calls POST /auth/forgot-password", async () => {
      mockPost.mockResolvedValue({ data: {} });
      await authApi.forgotPassword({ email: "user@example.com" });
      expect(mockPost).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "user@example.com",
      });
    });
  });

  describe("changePassword", () => {
    it("calls POST /auth/change-password", async () => {
      mockPost.mockResolvedValue({ data: {} });
      await authApi.changePassword({
        currentPassword: "old",
        newPassword: "new",
        confirmNewPassword: "new",
      });
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/change-password",
        expect.any(Object),
      );
    });
  });

  describe("logout", () => {
    it("calls POST /auth/logout", async () => {
      mockPost.mockResolvedValue({ status: 204, data: "" });
      await authApi.logout();
      expect(mockPost).toHaveBeenCalledWith("/auth/logout");
    });
  });
});
