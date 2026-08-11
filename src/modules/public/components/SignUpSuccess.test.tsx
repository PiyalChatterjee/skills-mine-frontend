import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignUpSuccess } from "@/modules/public/components/SignUpSuccess";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SignUpSuccess", () => {
  it("navigates with replace when CTA is clicked", () => {
    render(<SignUpSuccess navigateTo="/login?postSignup=candidate" ctaLabel="Done" />);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(mockNavigate).toHaveBeenCalledWith("/login?postSignup=candidate", {
      replace: true,
    });
  });
});
