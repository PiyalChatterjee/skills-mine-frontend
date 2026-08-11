import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CandidateSignUpDrawer } from "@/modules/public/components/CandidateSignUpDrawer";
import { RecruiterSignUpDrawer } from "@/modules/public/components/RecruiterSignUpDrawer";

const mockDispatch = vi.fn();
const mockCandidateSubmitForm = vi.fn();
const mockCandidateResetForm = vi.fn();
const mockRecruiterSubmitForm = vi.fn();
const mockRecruiterResetForm = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock("@/modules/public/components/SignUpForm", () => ({
  SignUpForm: ({ onSubmit }: { onSubmit: () => void }) => (
    <button type="button" onClick={onSubmit}>
      Submit mocked form
    </button>
  ),
}));

vi.mock("@/modules/public/components/SignUpGoogleButton", () => ({
  SignUpGoogleButton: () => <div data-testid="google-signup-button" />,
}));

vi.mock("@/modules/public/hooks/useCandidateGoogleAuthState", () => ({
  useCandidateGoogleAuthState: () => ({
    hasGoogleClientId: false,
    pendingGoogleAuth: false,
    googleAuthStatus: "idle",
    googleAuthMessage: "",
    handleGoogleAuthStart: vi.fn(),
    handleGoogleAuthSuccess: vi.fn(),
    handleGoogleAuthError: vi.fn(),
    handleGoogleLoginUnavailable: vi.fn(),
  }),
}));

vi.mock("@/modules/public/hooks/useCandidateSignUpForm", () => ({
  useCandidateSignUpForm: () => ({
    register: vi.fn(),
    control: {},
    errors: {},
    isSubmitting: false,
    submitForm: mockCandidateSubmitForm,
    resetForm: mockCandidateResetForm,
  }),
}));

vi.mock("@/modules/public/hooks/useRecruiterSignUpForm", () => ({
  useRecruiterSignUpForm: () => ({
    register: vi.fn(),
    control: {},
    errors: {},
    isSubmitting: false,
    submitForm: mockRecruiterSubmitForm,
    resetForm: mockRecruiterResetForm,
  }),
}));

describe("Sign up drawers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockCandidateSubmitForm.mockResolvedValue(true);
    mockRecruiterSubmitForm.mockResolvedValue(true);
  });

  it("resets candidate signup success state and form when drawer closes", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MemoryRouter>
        <CandidateSignUpDrawer open={true} onClose={onClose} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit mocked form" }));

    expect(await screen.findByText("Your account has been created.")).toBeInTheDocument();
    expect(localStorage.getItem("candidate_profile_creation_pending")).toBe("1");

    rerender(
      <MemoryRouter>
        <CandidateSignUpDrawer open={false} onClose={onClose} />
      </MemoryRouter>,
    );

    expect(mockCandidateResetForm).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter>
        <CandidateSignUpDrawer open={true} onClose={onClose} />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Your account has been created.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit mocked form" })).toBeInTheDocument();
  });

  it("resets recruiter signup success state and form when drawer closes", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MemoryRouter>
        <RecruiterSignUpDrawer open={true} onClose={onClose} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit mocked form" }));

    expect(await screen.findByText("Your request has been received.")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <RecruiterSignUpDrawer open={false} onClose={onClose} />
      </MemoryRouter>,
    );

    expect(mockRecruiterResetForm).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter>
        <RecruiterSignUpDrawer open={true} onClose={onClose} />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Your request has been received.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit mocked form" })).toBeInTheDocument();
  });
});
