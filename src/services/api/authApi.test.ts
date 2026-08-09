import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi, mapLoginResponseToSession } from "./authApi";

// Use vi.hoisted so the variable is available inside the hoisted vi.mock factory
const mockPost = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/axios", () => ({
  apiClient: { post: mockPost },
  unwrapResponseData: async (promise: Promise<unknown>) => {
    const response = await promise;
    return (response as { data: unknown }).data;
  },
}));

vi.mock("@/services/api/endpoints", () => ({
  apiEndpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      forgotPassword: "/auth/forgot-password",
      changePassword: "/auth/change-password",
      logout: "/auth/logout",
      googleExchange: "/auth/google/exchange",
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

const fakeLoginResponse = {
  success: true,
  statusCode: 200,
  message: "OK",
  data: {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresIn: 3600,
    profileCompleted: 1,
    roles: ["JOB_SEEKER" as const],
  },
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
      mockPost.mockResolvedValue({ data: {} });
      await authApi.logout();
      expect(mockPost).toHaveBeenCalledWith("/auth/logout");
    });
  });
});

describe("mapLoginResponseToSession", () => {
  it("maps login response to user and tokens", () => {
    const result = mapLoginResponseToSession(fakeLoginResponse);
    expect(result.tokens.accessToken).toBe("access-token");
    expect(result.tokens.refreshToken).toBe("refresh-token");
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

  it("falls back to JOB_SEEKER role when response has empty roles", () => {
    const response = {
      ...fakeLoginResponse,
      data: {
        ...fakeLoginResponse.data,
        roles: [],
      },
    };
    const result = mapLoginResponseToSession(response);
    expect(result.user.role).toBe("JOB_SEEKER");
  });

  it("maps RECRUITER role with correct permissions", () => {
    const response = {
      ...fakeLoginResponse,
      data: {
        ...fakeLoginResponse.data,
        roles: ["RECRUITER" as const],
      },
    };
    const result = mapLoginResponseToSession(response);
    expect(result.user.role).toBe("RECRUITER");
    expect(result.user.permissions).toContain("MANDATE_CREATE");
    expect(result.user.permissions).toContain("VIEW_DASHBOARD");
  });

  it("maps ADMIN role with ALL permissions", () => {
    const response = {
      ...fakeLoginResponse,
      data: {
        ...fakeLoginResponse.data,
        roles: ["ADMIN" as const],
      },
    };
    const result = mapLoginResponseToSession(response);
    expect(result.user.role).toBe("ADMIN");
    expect(result.user.permissions.length).toBeGreaterThan(5);
  });
});
