import { describe, expect, it } from "vitest";
import { candidateSignUpSchema } from "@/app/validation.schema";

const validSignup = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  mobileNumber: "0821234567",
  password: "Password1!",
  confirmPassword: "Password1!",
  acceptTerms: true,
};

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