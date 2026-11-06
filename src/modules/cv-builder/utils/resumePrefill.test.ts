import { describe, expect, it } from "vitest";
import { buildResumePrefillData } from "./resumePrefill";

describe("buildResumePrefillData", () => {
  it("maps parsed profile data and PDF text sections into CV form values", () => {
    const result = buildResumePrefillData(
      {
        personal_details: {
          first_name: "Ben",
          last_name: "Hur",
          email: "ben@example.com",
          phone_number: "+27123456789",
          race: "African",
          gender: "Male",
          disability_status: "None",
          nationality: "African",
          residential_location: "Cape Town",
        },
        education: {
          tertiary: [
            {
              institution_name: "University of Whitsand",
              qualification: "BTech",
              year_completed: 2021,
            },
          ],
          secondary: {
            institution_name: "Highschool of Gauteng",
            highest_grade_passed: "Grade 12",
            year_completed: 2018,
          },
        },
      },
      "Key Skills\n- React Js\n- Nest Js\nLanguages\nEnglish (Conversational)",
    );

    expect(result.personalDetails?.fullName).toBe("Ben Hur");
    expect(result.personalDetails?.email).toBe("ben@example.com");
    expect(result.personalDetails?.phoneNumber).toBe("+27123456789");
    expect(result.tertiaryEducation?.[0]).toEqual({
      institutionName: "University of Whitsand",
      degreeOrCertification: "BTech",
      yearCompleted: "2021",
    });
    expect(result.secondaryEducation?.[0].highestGradePassed).toBe("Grade 12");
    expect(result.skills).toEqual([{ name: "React Js" }, { name: "Nest Js" }]);
    expect(result.languages).toEqual(["English"]);
  });

  it("maps parsed languages outside the preset list to Other", () => {
    const result = buildResumePrefillData(
      { languages: ["English", "Spanish"] } as never,
      "",
    );

    expect(result.languages).toEqual(["English", "Other"]);
    expect(result.otherLanguage).toBe("Spanish");
  });
});