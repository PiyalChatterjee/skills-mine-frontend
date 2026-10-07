import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { useZodForm } from "@/hooks/useZodForm";
import { CvBuilderControlledTextField, CvBuilderSelectField } from "../components/CvBuilderFormPrimitives";
import { describe, expect, it, vi } from "vitest";
import { focusFirstErrorField, validateAndFocusForm } from "@/app/formValidation";

const CvFields = ({ fullName }: { fullName: string }) => {
  const form = useZodForm(z.object({
    fullName: z.string().min(1, "Full name is required"),
    gender: z.string().min(1, "Gender is required"),
  }), { defaultValues: { fullName, gender: "" } });
  const { control } = form;
  return (
    <>
      <CvBuilderControlledTextField control={control} name="fullName" label="Full name" />
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <CvBuilderSelectField
            name={field.name}
            label="Gender"
            value={field.value}
            onChange={field.onChange}
            inputRef={field.ref}
            options={["Female", "Male"]}
          />
        )}
      />
      <button onClick={() => void validateAndFocusForm(form)}>Submit CV</button>
    </>
  );
};

describe("CV validation focus", () => {
  it.each([
    { fullName: "", role: "textbox", label: "Full name" },
    { fullName: "Jane", role: "combobox", label: "Gender" },
  ])("focuses the invalid CV $role through its registered ref", async ({ fullName, role, label }) => {
    const user = userEvent.setup();
    render(<CvFields fullName={fullName} />);
    await user.click(screen.getByRole("button", { name: "Submit CV" }));
    await waitFor(() => expect(screen.getByRole(role, { name: label })).toHaveFocus());
  });

  it("focuses a select combobox rather than its hidden input", () => {
    render(
      <div data-field="personalDetails.gender" data-testid="field">
        <input aria-hidden="true" tabIndex={-1} />
        <div role="combobox" aria-label="Gender" tabIndex={0} />
      </div>,
    );
    screen.getByTestId("field").scrollIntoView = vi.fn();

    expect(focusFirstErrorField({ personalDetails: { gender: { type: "required" } } })).toBe(true);
    expect(screen.getByRole("combobox", { name: "Gender" })).toHaveFocus();
  });

  it("focuses a date picker section instead of its hidden input", () => {
    render(
      <div data-field="careerHistory.0.startDate" data-testid="field">
        <input type="hidden" />
        <span role="spinbutton" aria-label="Month" contentEditable tabIndex={0} />
      </div>,
    );
    screen.getByTestId("field").scrollIntoView = vi.fn();

    expect(focusFirstErrorField({ careerHistory: [{ startDate: { type: "required" } }] })).toBe(true);
    expect(screen.getByRole("spinbutton", { name: "Month" })).toHaveFocus();
  });

  it("focuses the add action for an empty required array", () => {
    render(
      <div data-field="skills" data-testid="field">
        <button>Add skill</button>
      </div>,
    );
    screen.getByTestId("field").scrollIntoView = vi.fn();

    expect(focusFirstErrorField({ skills: { root: { type: "min" } } })).toBe(true);
    expect(screen.getByRole("button", { name: "Add skill" })).toHaveFocus();
  });
});