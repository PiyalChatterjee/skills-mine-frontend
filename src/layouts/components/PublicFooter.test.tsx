import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicFooter } from "./PublicFooter";

const mockViewport = (isMobile: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: isMobile,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
};

afterEach(() => vi.unstubAllGlobals());

describe("PublicFooter external links", () => {
  it("opens social and contact links in a new tab safely", () => {
    mockViewport(false);
    render(<PublicFooter />);

    ["LinkedIn", "Facebook", "Instagram", "Website", "Contact"].forEach(
      (label) => {
        const link = screen.getByRole("link", { name: label });
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      },
    );
  });

  it.each([
    [false, "https://www.facebook.com/theskillsmine"],
    [true, "https://m.facebook.com/theskillsmine"],
  ])("uses the matching Facebook URL at mobile=%s", (isMobile, expectedHref) => {
    mockViewport(isMobile);
    render(<PublicFooter />);

    expect(screen.getByRole("link", { name: "Facebook" })).toHaveAttribute(
      "href",
      expectedHref,
    );
  });
});