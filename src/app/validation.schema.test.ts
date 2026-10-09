import { describe, expect, it } from "vitest";
import {
  candidateSignUpSchema,
  jobTitleSchema,
  residentialLocationSchema,
} from "@/app/validation.schema";

const validSignup = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  mobileNumber: "0821234567",
  password: "Password1!",
  confirmPassword: "Password1!",
  acceptTerms: true,
};

describe("candidateSignUpSchema email validation", () => {
  it.each([
    "piyal+-_.chatterjee@email.com",
    "piyal+chatterjee@sub-domain.email.com",
    "!#$%&'*+/=?^_`{|}~-@email.com",
  ])("accepts valid dot-atom and domain syntax in %s", (email) => {
      expect(
        candidateSignUpSchema.safeParse({ ...validSignup, email }).success,
      ).toBe(true);
  });

  it.each([
    ".piyal@email.com",
    "piyal.@email.com",
    "piyal..chatterjee@email.com",
  ])("rejects invalid local-part dot placement in %s", (email) => {
    expect(
      candidateSignUpSchema.safeParse({ ...validSignup, email }).success,
    ).toBe(false);
  });

  it.each([
    "piyal@email..com",
    "piyal@-email.com",
    "piyal@email-.com",
    "piyal@email.c",
    "piyal@email.123",
  ])("rejects invalid domain syntax in %s", (email) => {
    expect(
      candidateSignUpSchema.safeParse({ ...validSignup, email }).success,
    ).toBe(false);
  });

  it("accepts a local part without separators", () => {
    expect(
      candidateSignUpSchema.safeParse({
        ...validSignup,
        email: "piyalchatterjee@email.com",
      }).success,
    ).toBe(true);
  });
});

describe("candidateSignUpSchema name validation", () => {
  it.each(["'", "---", " ' - ", "\u0301"])(
    "rejects first names without a letter: %j",
    (firstName) => {
      const result = candidateSignUpSchema.safeParse({ ...validSignup, firstName });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes("firstName") &&
              issue.message.includes("must include at least one letter"),
          ),
        ).toBe(true);
      }
    },
  );

  it("rejects a first name containing only spaces", () => {
    const result = candidateSignUpSchema.safeParse({
      ...validSignup,
      firstName: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("accepts names with letters and supported separators", () => {
    const result = candidateSignUpSchema.safeParse({
      ...validSignup,
      firstName: "Mary Jane",
      lastName: "O'Neil-Smith",
    });

    expect(result.success).toBe(true);
  });

  it.each([
    { value: "Piya-", message: "must start and end with a letter" },
    { value: "-Piya", message: "must start and end with a letter" },
    { value: "Piya'", message: "must start and end with a letter" },
    { value: "Piya1", message: "can only contain letters, spaces, apostrophes, or hyphens" },
    { value: "Piya--Paul", message: "Use only one space, apostrophe, or hyphen between letters" },
    { value: "Piya  Paul", message: "Use only one space, apostrophe, or hyphen between letters" },
  ])("explains the specific name validation failure for $value", ({ value, message }) => {
    for (const name of ["firstName", "lastName"] as const) {
      const result = candidateSignUpSchema.safeParse({ ...validSignup, [name]: value });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.find((issue) => issue.path[0] === name)?.message).toContain(message);
      }
    }
  });

  it.each(["Piya-Paul", "O'Neil", "D\u2019Arcy", "Jos\u00e9", "Jose\u0301"])(
    "preserves valid name acceptance for %s",
    (firstName) => {
      expect(candidateSignUpSchema.safeParse({ ...validSignup, firstName }).success).toBe(true);
    },
  );
});
describe("jobTitleSchema", () => {
  it.each([
    "Software Engineer",
    "UI/UX Designer",
    "C++ / C# Developer",
    "R&D Manager",
    "Sr. Engineer, Platform",
    "Full-Stack Developer (Contract)",
    "Head of O'Brien Operations",
  ])("accepts %s", (value) => {
    expect(jobTitleSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["Engineer@Home", "can only contain"],
    ["Dev <script>", "can only contain"],
    ["Engineer; DROP", "can only contain"],
    ["Engineer!", "can only contain"],
    ["123 / 456", "must include at least one letter"],
    ["   ", "is required"],
  ])("rejects %s", (value, message) => {
    const result = jobTitleSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain(message);
  });
});

describe("residentialLocationSchema", () => {
  it.each([
    "Cape Town",
    "Cape Town, Western Cape",
    "12 Main Rd, Sandton",
    "Port Elizabeth/Gqeberha",
    "St. Francis Bay",
    "Bloemfontein-Central",
    "KwaZulu-Natal",
  ])("accepts %s", (value) => {
    expect(residentialLocationSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["Cape Town #1", "can only contain"],
    ["Durban & Umhlanga", "can only contain"],
    ["Sandton (North)", "can only contain"],
    ["Pretoria!", "can only contain"],
    ["1234", "must include at least one letter"],
    ["", "is required"],
  ])("rejects %s", (value, message) => {
    const result = residentialLocationSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain(message);
  });
});
