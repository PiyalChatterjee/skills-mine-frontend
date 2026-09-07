import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialSignUpFormValues } from "@/modules/public/components/SignUpDrawer.types";
import { useCandidateSignUpForm } from "@/modules/public/hooks/useCandidateSignUpForm";
import { useRecruiterSignUpForm } from "@/modules/public/hooks/useRecruiterSignUpForm";

const {
  mockCandidateRegister,
  mockReset,
} = vi.hoisted(() => ({
  mockCandidateRegister: vi.fn(),
  mockReset: vi.fn(),
}));

vi.mock("@/services/api/authApi", () => ({
  authApi: {
    candidateRegister: mockCandidateRegister,
  },
}));

vi.mock("@/hooks/useZodForm", () => ({
  useZodForm: () => ({
    register: vi.fn(),
    control: {},
    reset: mockReset,
    formState: {
      errors: {},
      isSubmitting: false,
    },
    handleSubmit:
      (callback: (values: any) => Promise<void>) => async () =>
        callback({
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          mobileNumber: "0712345678",
          password: "Passw0rd!",
          confirmPassword: "Passw0rd!",
          acceptTerms: true,
        }),
  }),
}));

describe("sign up form hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps candidate resetForm stable across rerenders", () => {
    const { result, rerender } = renderHook(() => useCandidateSignUpForm());

    const firstResetForm = result.current.resetForm;
    rerender();

    expect(result.current.resetForm).toBe(firstResetForm);

    result.current.resetForm();
    expect(mockReset).toHaveBeenCalledWith(initialSignUpFormValues);
  });

  it("keeps recruiter resetForm stable across rerenders", () => {
    const { result, rerender } = renderHook(() => useRecruiterSignUpForm());

    const firstResetForm = result.current.resetForm;
    rerender();

    expect(result.current.resetForm).toBe(firstResetForm);

    result.current.resetForm();
    expect(mockReset).toHaveBeenCalledWith(initialSignUpFormValues);
  });

  it("candidate submitForm returns true on successful registration", async () => {
    mockCandidateRegister.mockResolvedValue({ statusCode: 201 });
    const { result } = renderHook(() => useCandidateSignUpForm());

    await expect(result.current.submitForm()).resolves.toBe(true);
  });

  it("recruiter submitForm rejects without the required invitation context", async () => {
    const { result } = renderHook(() => useRecruiterSignUpForm());

    await expect(result.current.submitForm()).rejects.toThrow(
      "Recruiter registration requires an invitation link from an administrator.",
    );
  });
});
