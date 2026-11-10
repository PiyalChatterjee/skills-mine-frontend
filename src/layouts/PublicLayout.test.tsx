import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  PublicHeader: () => null,
}));

vi.mock("./components/PublicFooter", () => ({
  PublicFooter: () => null,
}));

vi.mock("@/modules/candidate/components/OpportunitySearchModal", () => ({
  OpportunitySearchModal: () => null,
}));

vi.mock("@/modules/public/components/CandidateSignUpDrawer", () => ({
  CandidateSignUpDrawer: () => null,
}));

vi.mock("@/modules/public/components/RecruiterSignUpDrawer", () => ({
  RecruiterSignUpDrawer: () => null,
}));

const BackButton = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Back</button>;
};

const renderPage = () => {
  const store = configureStore({
    reducer: (state = { ui: { landingMode: "browse" } }) => state,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/", "/candidate/dashboard"]} initialIndex={1}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<div>Public landing</div>} />
          </Route>
          <Route
            path="/candidate/dashboard"
            element={
              <>
                <BackButton />
                <div>Candidate dashboard</div>
              </>
            }
          />
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
});