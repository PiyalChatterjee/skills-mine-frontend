import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildHeaderNavItems } from "@/layouts/headerNav";
import { PublicHeader } from "./PublicHeader";

const mocks = vi.hoisted(() => ({
  logoutApi: vi.fn(),
  logout: vi.fn(),
  beginLogoutNavigation: vi.fn(),
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: () => ({ user: null, tokens: null, logout: mocks.logout }),
}));

vi.mock("@/services/api/authApi", () => ({
  authApi: { logout: mocks.logoutApi },
}));

vi.mock("@/app/auth/logoutNavigation", () => ({
  beginLogoutNavigation: mocks.beginLogoutNavigation,
}));

const CAREER_SUPPORT_LINKS = [
  [
    "Career Direction Self-Assessment",
    "https://theskillsmine.com/career-direction-self-assessment/",
  ],
  [
    "CV Checklist and Sample CV",
    "https://theskillsmine.com/resource-1-cv-checklist-and-sample-cv/",
  ],
  [
    "Job Opportunity Websites Guide",
    "https://theskillsmine.com/resource-2-learner-opportunity-websites-guide/",
  ],
  [
    "LinkedIn Profile Checklist and Sample Profile",
    "https://theskillsmine.com/resource-3-linkedin-profile-checklist-and-sample-profile/",
  ],
];

const renderHeader = () =>
  render(
    <MemoryRouter>
      <PublicHeader
        canAccessProtectedRoutes
        navItems={buildHeaderNavItems({
          keys: ["candidateCvBuilder", "candidateCareerSupport"],
          pathname: "/",
        })}
        onProtectedNavClick={vi.fn()}
        onHelpClick={vi.fn()}
      />
    </MemoryRouter>,
  );

describe("PublicHeader career support dropdown", () => {
  it("shows social links in mobile navigation with their destinations", () => {
    renderHeader();

    const mobileNavPanel = document.getElementById("mobile-nav-menu");
    expect(mobileNavPanel).not.toBeNull();
    const links = Array.from(
      mobileNavPanel!.querySelectorAll<HTMLAnchorElement>("a[aria-label]"),
    );

    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "LinkedIn",
      "Facebook",
      "Instagram",
      "Website",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://www.linkedin.com/company/the-skills-mine/",
      "https://www.facebook.com/theskillsmine",
      "https://www.instagram.com/theskillsmine/",
      "https://theskillsmine.com/",
    ]);
  });

  it("opens a menu of external career support links", async () => {
    const user = userEvent.setup();
    renderHeader();

    const trigger = document.getElementById(
      "nav-menu-candidateCareerSupport-trigger",
    ) as HTMLElement;
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu", { name: "Career Support" });
    const items = within(menu).getAllByRole("menuitem");

    expect(
      items.map((item) => [item.textContent, item.getAttribute("href")]),
    ).toEqual(CAREER_SUPPORT_LINKS);
    items.forEach((item) => {
      expect(item).toHaveAttribute("target", "_blank");
      expect(item).toHaveAttribute("rel", "noreferrer");
    });
  });

  it("expands career support links in the mobile navigation", async () => {
    const user = userEvent.setup();
    renderHeader();

    const mobileTrigger = document.querySelector(
      '[aria-controls="mobile-nav-submenu-candidateCareerSupport"]',
    ) as HTMLElement;
    expect(
      document.getElementById("mobile-nav-submenu-candidateCareerSupport"),
    ).toBeNull();

    await user.click(mobileTrigger);

    expect(mobileTrigger).toHaveAttribute("aria-expanded", "true");
    const subMenu = document.getElementById(
      "mobile-nav-submenu-candidateCareerSupport",
    ) as HTMLElement;
    expect(
      within(subMenu)
        .getAllByRole("link", { hidden: true })
        .map((link) => link.getAttribute("href")),
    ).toEqual(CAREER_SUPPORT_LINKS.map(([, href]) => href));
  });
});

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}`}</span>;
};

const renderProfileHeader = (restrictNavigation: boolean) =>
  render(
    <MemoryRouter initialEntries={["/profile/create"]}>
      <PublicHeader
        canAccessProtectedRoutes
        navItems={buildHeaderNavItems({
          keys: ["candidateSkillsBuild", "candidateCareerSupport"],
          pathname: "/profile/create",
        })}
        onProtectedNavClick={vi.fn()}
        onHelpClick={vi.fn()}
        showProfileBadge
        restrictNavigation={restrictNavigation}
      />
      <LocationProbe />
    </MemoryRouter>,
  );

const openProfileMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Open profile menu" }));
  return screen.getByRole("menu");
};

describe("PublicHeader profile menu and onboarding restriction", () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    vi.clearAllMocks();
  });

  it("navigates to profile settings when navigation is not restricted", async () => {
    const user = userEvent.setup();
    renderProfileHeader(false);

    const menu = await openProfileMenu(user);
    await user.click(within(menu).getByRole("menuitem", { name: "Profile settings" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/profile");
    expect(screen.getByTestId("location")).not.toHaveTextContent("/profile/create");
  });

  it("navigates to change password when navigation is not restricted", async () => {
    const user = userEvent.setup();
    renderProfileHeader(false);

    const menu = await openProfileMenu(user);
    await user.click(within(menu).getByRole("menuitem", { name: "Change password" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/reset-password?mode=change");
  });

  it("keeps the user on the current page for account links and the logo while restricted", async () => {
    const user = userEvent.setup();
    renderProfileHeader(true);

    let menu = await openProfileMenu(user);
    await user.click(within(menu).getByRole("menuitem", { name: "Profile settings" }));
    menu = await openProfileMenu(user);
    await user.click(within(menu).getByRole("menuitem", { name: "Change password" }));
    await user.click(screen.getByRole("link", { name: "Go to landing page" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/profile/create");
  });

  it("still allows logging out while restricted", async () => {
    const user = userEvent.setup();
    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, replace },
    });
    mocks.logoutApi.mockResolvedValue(undefined);
    renderProfileHeader(true);

    const menu = await openProfileMenu(user);
    await user.click(within(menu).getByRole("menuitem", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(mocks.logoutApi).toHaveBeenCalled();
    expect(mocks.beginLogoutNavigation).toHaveBeenCalled();
    expect(mocks.logout).toHaveBeenCalled();
  });

  it("logs out locally even when the logout API fails", async () => {
    const user = userEvent.setup();
    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, replace },
    });
    mocks.logoutApi.mockRejectedValue(new Error("network"));
    renderProfileHeader(true);

    const menu = await openProfileMenu(user);
    await user.click(within(menu).getByRole("menuitem", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(mocks.logout).toHaveBeenCalled();
  });

  it("keeps Skills Build and Career Support usable while restricted", async () => {
    const user = userEvent.setup();
    renderProfileHeader(true);

    expect(screen.getAllByRole("button", { name: "Skills Build" }).length).toBeGreaterThan(0);
    await user.click(
      document.getElementById("nav-menu-candidateCareerSupport-trigger") as HTMLElement,
    );
    expect(screen.getByRole("menu", { name: "Career Support" })).toBeInTheDocument();
  });
});
