import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { buildHeaderNavItems } from "@/layouts/headerNav";
import { PublicHeader } from "./PublicHeader";

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: () => ({ user: null, tokens: null, logout: vi.fn() }),
}));

vi.mock("@/services/api/authApi", () => ({
  authApi: { logout: vi.fn() },
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
  it("shows social links in mobile navigation without redirecting", () => {
    renderHeader();

    const mobileNavPanel = document.getElementById("mobile-nav-menu");
    expect(mobileNavPanel).not.toBeNull();
    const links = Array.from(
      mobileNavPanel!.querySelectorAll<HTMLAnchorElement>("a[aria-label]"),
    );

    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "Facebook",
      "Twitter",
      "LinkedIn",
      "Instagram",
    ]);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "#");
      expect(
        link.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        ),
      ).toBe(false);
    });
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
