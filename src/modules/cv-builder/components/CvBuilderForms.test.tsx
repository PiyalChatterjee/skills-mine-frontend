import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { describe, expect, it, vi } from "vitest";
import { cvBuilderSchema, type CvBuilderFormValues } from "@/app/validation.schema";
import { AVAILABILITY_LABELS } from "@/modules/candidate/utils/profileEnums";
import CvBuilderCareerHistoryForm from "./CvBuilderCareerHistoryForm";
import CvBuilderEducationForm from "./CvBuilderEducationForm";
import CvBuilderLanguagesForm from "./CvBuilderLanguagesForm";
import CvBuilderPersonalDetailsForm from "./CvBuilderPersonalDetailsForm";

const buildValues = (
  overrides: Partial<CvBuilderFormValues["personalDetails"]> = {},
): CvBuilderFormValues => ({
  personalDetails: {
    fullName: "",
    email: "",
    phoneNumber: "",
    race: "",
    gender: "",
    disabilityStatus: "",
    nationality: "",
    residentialLocation: "",
    currentCompany: "",
    currentPosition: "",
    noticePeriod: "",
    ...overrides,
  },
  careerHistory: [
    {
      companyName: "",
      positionHeld: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      tasks: [""],
      projects: [""],
    },
  ],
  skills: [{ name: "" }],
  tertiaryEducation: [
    { institutionName: "", degreeOrCertification: "", yearCompleted: "" },
  ],
  secondaryEducation: [
    { institutionName: "", highestGradePassed: "", yearCompleted: "" },
  ],
  languages: [],
  otherLanguage: "",
});

const FormHarness = ({
  children,
  values,
}: {
  children: ReactNode;
  values: CvBuilderFormValues;
}) => {
  const form = useForm<CvBuilderFormValues>({
    defaultValues: values,
    mode: "onBlur",
    resolver: zodResolver(cvBuilderSchema) as never,
  });
  return (
    <FormProvider {...form}>
      {children}
      <button type="button" onClick={() => void form.trigger()}>Validate form</button>
    </FormProvider>
  );
};

const renderInForm = (ui: ReactNode, values = buildValues()) =>
  render(<FormHarness values={values}>{ui}</FormHarness>);

const label = (text: string) => screen.getByText(text, { selector: "label" });

describe("CvBuilderPersonalDetailsForm", () => {
  it("marks always-required fields with * and shows the required hint", () => {
    renderInForm(<CvBuilderPersonalDetailsForm />);

    [
      "Full Name*",
      "Race*",
      "Gender*",
      "Disability Status*",
      "Nationality*",
      "Residential Location*",
    ].forEach((text) => expect(label(text)).toBeInTheDocument());
    expect(screen.getByText("*Required fields")).toBeInTheDocument();
  });

  it("keeps current position and notice period optional while current company is empty", () => {
    renderInForm(<CvBuilderPersonalDetailsForm />);

    expect(label("Current Company")).toBeInTheDocument();
    expect(label("Current Position")).toBeInTheDocument();
    expect(label("Notice Period")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Email address" })).not.toBeInTheDocument();
  });

  it("uses availability labels for notice period options", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderPersonalDetailsForm />);

    await user.click(screen.getByRole("combobox", { name: "Notice period" }));

    Object.values(AVAILABILITY_LABELS).forEach((availabilityLabel) => {
      expect(screen.getByRole("option", { name: availabilityLabel })).toBeInTheDocument();
    });
    expect(screen.queryByRole("option", { name: "Notice Required" })).not.toBeInTheDocument();
  });

  it("marks current position and notice period required once a current company is entered", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderPersonalDetailsForm />);

    await user.type(screen.getByRole("textbox", { name: "Current company" }), "Acme");

    expect(label("Current Position*")).toBeInTheDocument();
    expect(label("Notice Period*")).toBeInTheDocument();
  });

  it("sets aria-required on required inputs and keeps the accessible name without *", () => {
    renderInForm(<CvBuilderPersonalDetailsForm />);

    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByRole("combobox", { name: "Race" })).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Current company" })).not.toHaveAttribute(
      "aria-required",
    );
  });

  it("does not render validation errors on initial render", () => {
    renderInForm(<CvBuilderPersonalDetailsForm />);

    expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
  });

  it("shows visitor contact fields as required and validates email format on blur", async () => {
    const user = userEvent.setup();
    const onEmailBlur = vi.fn();
    renderInForm(<CvBuilderPersonalDetailsForm isVisitor onEmailBlur={onEmailBlur} />);

    expect(label("Email Address*")).toBeInTheDocument();
    expect(label("Phone Number*")).toBeInTheDocument();
    expect(label("Notice Period*")).toBeInTheDocument();

    const email = screen.getByRole("textbox", { name: "Email address" });
    await user.type(email, "bad-email");
    await user.tab();

    expect(onEmailBlur).toHaveBeenCalledWith("bad-email");
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("accepts a valid visitor email without an error", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderPersonalDetailsForm isVisitor />);

    await user.type(screen.getByRole("textbox", { name: "Email address" }), "jane@example.com");
    await user.tab();

    expect(screen.queryByText("Enter a valid email address")).not.toBeInTheDocument();
  });
});

describe("CvBuilderCareerHistoryForm", () => {
  it("clears stale career errors after current company and history are cleared", async () => {
    const user = userEvent.setup();
    renderInForm(
      <>
        <CvBuilderPersonalDetailsForm />
        <CvBuilderCareerHistoryForm />
      </>,
      buildValues({ currentCompany: "Acme" }),
    );

    await user.click(screen.getByRole("button", { name: "Validate form" }));
    expect(await screen.findByText("Company name is required")).toBeInTheDocument();
    expect(screen.getByText("Position held is required")).toBeInTheDocument();
    expect(screen.getByText("Current position is required when current company is provided")).toBeInTheDocument();

    await user.clear(screen.getByRole("textbox", { name: "Current company" }));

    expect(screen.queryByText("Company name is required")).not.toBeInTheDocument();
    expect(screen.queryByText("Position held is required")).not.toBeInTheDocument();
    expect(screen.queryByText("Employment start date is required")).not.toBeInTheDocument();
    expect(screen.queryByText("Current position is required when current company is provided")).not.toBeInTheDocument();
  });

  it("does not mark position fields required while current company is empty", () => {
    renderInForm(<CvBuilderCareerHistoryForm />);

    expect(label("Company Name")).toBeInTheDocument();
    expect(label("Position Held")).toBeInTheDocument();
    expect(label("Employment Start Date")).toBeInTheDocument();
    expect(label("End Date")).toBeInTheDocument();
  });

  it("marks position fields required when a current company is provided", () => {
    renderInForm(
      <CvBuilderCareerHistoryForm />,
      buildValues({ currentCompany: "Acme" }),
    );

    expect(label("Company Name*")).toBeInTheDocument();
    expect(label("Position Held*")).toBeInTheDocument();
    expect(label("Employment Start Date*")).toBeInTheDocument();
    expect(label("End Date")).toBeInTheDocument();
  });

  it("validates career history when current company makes the fields required", async () => {
    const user = userEvent.setup();
    renderInForm(
      <>
        <CvBuilderPersonalDetailsForm />
        <CvBuilderCareerHistoryForm />
      </>,
    );

    await user.type(screen.getByRole("textbox", { name: "Current company" }), "Acme");

    expect(await screen.findByText("Company name is required")).toBeInTheDocument();
    expect(screen.getByText("Position held is required")).toBeInTheDocument();
    expect(screen.getByText("Employment start date is required")).toBeInTheDocument();
  });

  it("adds another position", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderCareerHistoryForm />);

    await user.click(screen.getByRole("button", { name: "+ Add position" }));

    expect(screen.getByRole("heading", { name: "Position 2" })).toBeInTheDocument();
    expect(screen.getAllByText("*Required fields")).toHaveLength(1);
  });

  it("adds and removes tasks, keeping at least one empty task row", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderCareerHistoryForm />);

    await user.click(screen.getByRole("button", { name: "+ Add a task" }));
    expect(screen.getByPlaceholderText("Task 2")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Task 1"), "Designed APIs");
    await user.click(screen.getByRole("button", { name: "Remove task 1" }));
    expect(screen.queryByPlaceholderText("Task 2")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Task 1")).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Remove task 1" }));
    expect(screen.getByPlaceholderText("Task 1")).toBeInTheDocument();
  });

  it("adds a project row", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderCareerHistoryForm />);

    await user.click(screen.getByRole("button", { name: "+ Add a project" }));

    expect(screen.getByPlaceholderText("Project 2")).toBeInTheDocument();
  });
});

describe("CvBuilderEducationForm", () => {
  it("marks every education entry field as required", () => {
    renderInForm(<CvBuilderEducationForm />);

    expect(screen.getAllByText("Institution Name*", { selector: "label" })).toHaveLength(2);
    expect(label("Degree Or Certification*")).toBeInTheDocument();
    expect(label("Highest Grade Passed*")).toBeInTheDocument();
    expect(screen.getAllByText("Year Completed*", { selector: "label" })).toHaveLength(2);
    expect(screen.getByText("*Required fields")).toBeInTheDocument();
  });

  it("keeps year completed numeric and capped at four digits", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderEducationForm />);

    const [tertiaryYear] = screen.getAllByPlaceholderText("YYYY");
    await user.type(tertiaryYear, "20a2x45");

    expect(tertiaryYear).toHaveValue("2024");
  });

  it("adds and removes a tertiary entry", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderEducationForm />);

    await user.click(screen.getByRole("button", { name: "+ Add tertiary entry" }));
    expect(screen.getByText("Tertiary entry 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove tertiary entry 2" }));
    expect(screen.queryByText("Tertiary entry 2")).not.toBeInTheDocument();
  });
});

describe("CvBuilderLanguagesForm", () => {
  it("shows a language-specific required hint instead of the generic one", () => {
    renderInForm(<CvBuilderLanguagesForm />);

    expect(screen.getByText("*Select at least one language")).toBeInTheDocument();
    expect(screen.queryByText("*Required fields")).not.toBeInTheDocument();
  });

  it("reveals a required Other language input when Other is selected and hides it when cleared", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderLanguagesForm />);

    const otherOption = screen.getByRole("button", { name: "Other" });
    await user.click(otherOption);

    expect(screen.getByText("Other language*")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Enter language");
    await user.type(input, "Klingon");
    expect(input).toHaveValue("Klingon");

    await user.click(otherOption);
    expect(screen.queryByText("Other language*")).not.toBeInTheDocument();
  });

  it("toggles a language selection on and off", async () => {
    const user = userEvent.setup();
    renderInForm(<CvBuilderLanguagesForm />);

    const english = screen.getByRole("button", { name: "English" });
    await user.click(english);
    expect(english.querySelector("img")).not.toBeNull();

    await user.click(english);
    expect(english.querySelector("img")).toBeNull();
  });
});
