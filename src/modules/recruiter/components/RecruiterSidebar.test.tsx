import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RecruiterSidebar } from "./RecruiterSidebar";

vi.mock("@/app/auth/AuthContext", () => ({ useAuth: () => ({ logout: vi.fn() }) }));

describe("shared recruiter and EXCO sidebar", () => {
  it("retains recruiter navigation by default", () => {
    render(<MemoryRouter initialEntries={["/recruiter/dashboard"]}><RecruiterSidebar /></MemoryRouter>);
    expect(screen.getByRole("navigation", { name: "Recruiter navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pipeline" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "CRM" })).toHaveAttribute("href", "/recruiter/crm");
    expect(screen.getByRole("link", { name: "Candidates" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Job Post" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MANCO" })).toBeInTheDocument();
  });

  it("shows only executive destinations and the shared logout action for EXCO", () => {
    render(<MemoryRouter initialEntries={["/exco"]}><RecruiterSidebar variant="exco" /></MemoryRouter>);
    expect(screen.getByRole("navigation", { name: "EXCO navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Go to EXCO Dashboard" })).toHaveAttribute("href", "/exco");
    expect(screen.getByRole("link", { name: "CRM" })).toHaveAttribute("href", "/exco/crm");
    expect(screen.getByRole("button", { name: "Log Out" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByRole("link", { name: "Pipeline" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New Job Post" })).not.toBeInTheDocument();
  });

  it("marks CRM active without marking the dashboard active on the EXCO CRM route", () => {
    render(<MemoryRouter initialEntries={["/exco/crm"]}><RecruiterSidebar variant="exco" /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "CRM" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });
});
