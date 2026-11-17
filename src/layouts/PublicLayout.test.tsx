import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "@/modules/public/pages/LandingPage";
import { PublicLayout } from "./PublicLayout";

const authState = vi.hoisted(() => ({
  isAuthenticated: true,
  tokens: { accessToken: "valid-token" },
  user: { role: "JOB_SEEKER" },
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("@/app/auth/jwt", () => ({
  isJwtExpired: () => false,
}));

vi.mock("./components/PublicHeader", () => ({
  PublicHeader: ({ onSignUpClick, showSignUp }: { onSignUpClick: () => void; showSignUp: boolean }) =>
    showSignUp ? <button onClick={onSignUpClick}>Header sign up</button> : null,
}));

vi.mock("./components/PublicFooter", () => ({
  PublicFooter: () => null,
}));

vi.mock("@/modules/candidate/components/OpportunitySearchModal", () => ({
  OpportunitySearchModal: () => null,
}));

vi.mock("@/modules/public/components/CandidateSignUpDrawer", () => ({
  CandidateSignUpDrawer: ({ open, onClose, visitorId, visitorEmail }: {
    open: boolean;
    onClose: () => void;
    visitorId?: string;
    visitorEmail?: string;
  }) => open ? (
    <div data-testid="signup-drawer" data-visitor-id={visitorId} data-visitor-email={visitorEmail}>
      <button onClick={onClose}>Close signup</button>
    </div>
  ) : null,
}));

vi.mock("@/modules/public/components/RecruiterSignUpDrawer", () => ({
  RecruiterSignUpDrawer: () => null,
}));

vi.mock("@/hooks/usePageTitle", () => ({ usePageTitle: vi.fn() }));
vi.mock("@/modules/public/hooks/useJobsSearch", () => ({
  useJobsSearch: () => ({ allJobs: [], visibleJobs: [], isJobsLoading: false }),
}));
vi.mock("@/hooks/useSearchQueryState", () => ({
  useSearchQueryState: () => ({ inputValue: "", handleInputChange: vi.fn(), clear: vi.fn() }),
}));

const BackButton = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Back</button>;
};

const renderPage = (
  initialEntries: string[] = ["/", "/candidate/dashboard"],
  initialIndex = initialEntries.length - 1,
) => {
  const store = configureStore({
    reducer: (state = { ui: { landingMode: "browse" } }) => state,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<div>Public landing</div>} />
            <Route path="/login" element={<div>Login screen</div>} />
            <Route path="/profile/create" element={<div>Profile creation</div>} />
          </Route>
          <Route
            path="/candidate/dashboard"
            element={
              <>
                <BackButton />
                <div>Candidate dashboard</div>
                <CurrentLocation />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const CurrentLocation = () => {
  const location = useLocation();
  return (
    <>
      <div data-testid="current-location">{`${location.pathname}${location.search}`}</div>
      <div data-testid="history-state">{JSON.stringify(location.state)}</div>
    </>
  );
};

const renderVisitorLanding = (state: { visitorId: string; matchScore: number; email: string } | null) => {
  const store = configureStore({
    reducer: (currentState = { ui: { landingMode: "browse" } }) => currentState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: "/", state }]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<><LandingPage /><CurrentLocation /><Link to="/login">Go to login</Link></>} />
            <Route path="/login" element={<Link to="/">Return home</Link>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("PublicLayout", () => {
  beforeEach(() => {
    authState.isAuthenticated = true;
  });

  it("keeps an authenticated user out of the guest landing page when navigating back", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByText("Candidate dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Public landing")).not.toBeInTheDocument();
  });

  it("keeps an authenticated user out of the login page when navigating back", () => {
    renderPage(["/login", "/candidate/dashboard"]);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByText("Candidate dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login screen")).not.toBeInTheDocument();
  });

  it("preserves authenticated post-signup and pending-job destinations", () => {
    const { unmount } = renderPage(["/login?postSignup=candidate"]);
    expect(screen.getByText("Profile creation")).toBeInTheDocument();

    unmount();
    renderPage(["/login?job=job%2F123"]);

    expect(screen.getByText("Candidate dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("current-location")).toHaveTextContent(
      "/candidate/dashboard?job=job%2F123",
    );
  });

  describe("visitor signup", () => {
    const visitor = { visitorId: "visitor-1", matchScore: 80, email: "jane@example.com" };

    beforeEach(() => {
      authState.isAuthenticated = false;
    });

    it.each(["Yes Please", "Header sign up", "Sign up and Browse Jobs"])(
      "preserves visitor details for %s after clearing history state",
      (button) => {
        renderVisitorLanding(visitor);

        expect(screen.getByTestId("history-state")).toHaveTextContent("null");
        fireEvent.click(screen.getByRole("button", { name: button }));

        expect(screen.getByTestId("signup-drawer")).toHaveAttribute("data-visitor-id", visitor.visitorId);
        expect(screen.getByTestId("signup-drawer")).toHaveAttribute("data-visitor-email", visitor.email);
      },
    );

    it("uses normal signup without a visitor and after declining the retention prompt", () => {
      const { unmount } = renderVisitorLanding(null);
      fireEvent.click(screen.getByRole("button", { name: "Header sign up" }));
      expect(screen.getByTestId("signup-drawer")).not.toHaveAttribute("data-visitor-id");
      unmount();

      renderVisitorLanding(visitor);
      fireEvent.click(screen.getByRole("button", { name: "No thanks" }));
      fireEvent.click(screen.getByRole("button", { name: "Header sign up" }));
      expect(screen.getByTestId("signup-drawer")).not.toHaveAttribute("data-visitor-id");
      expect(screen.getByTestId("signup-drawer")).not.toHaveAttribute("data-visitor-email");
    });

    it("does not reuse visitor details after leaving and returning to the landing page", () => {
      renderVisitorLanding(visitor);
      fireEvent.click(screen.getByRole("link", { name: "Go to login" }));
      fireEvent.click(screen.getByRole("link", { name: "Return home" }));
      fireEvent.click(screen.getByRole("button", { name: "Header sign up" }));
      expect(screen.getByTestId("signup-drawer")).not.toHaveAttribute("data-visitor-id");
      expect(screen.getByTestId("signup-drawer")).not.toHaveAttribute("data-visitor-email");
    });
  });
});