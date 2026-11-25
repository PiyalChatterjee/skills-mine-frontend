import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormField } from "./FormField";
import { FormDateField } from "./FormDateField";

describe("shared form fields", () => {
  it("associates external labels and errors with the input and exposes required state", () => {
    render(<FormField label="Email" required error helperText="Invalid email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Invalid email");
  });

  it("supports multiline values and disabled inputs", () => {
    render(<FormField label="Notes" multiline rows={4} defaultValue={"Line 1\nLine 2"} disabled />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveValue("Line 1\nLine 2");
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
  });

  it("supports typing ISO dates and selecting calendar dates", () => {
    const onChange = vi.fn();
    render(<FormDateField label="Follow-up" value="" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Follow-up" });
    expect(input).toHaveAttribute("placeholder", "Select date");
    fireEvent.change(input, { target: { value: "2026-11-01" } });
    expect(onChange).toHaveBeenCalledWith("2026-11-01");
    fireEvent.click(screen.getByRole("button", { name: "Choose follow-up" }));
    const day = screen.getAllByRole("gridcell").find((cell) => cell.textContent === "15");
    expect(day).toBeDefined();
    fireEvent.click(day!);
    expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^\d{4}-\d{2}-15$/));
  });

  it("opens the calendar from the keyboard", () => {
    render(<FormDateField label="Contact date" value="" onChange={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Contact date" }), { key: "ArrowDown" });
    expect(screen.getByRole("dialog", { name: "Contact date calendar" })).toBeInTheDocument();
  });
});
