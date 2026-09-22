import { describe, expect, it } from "vitest";
import { getJobCity, getJobTags } from "./jobPresentation";

describe("job presentation helpers", () => {
  it("uses the first comma-separated location segment as the city", () => {
    expect(getJobCity("Cape Town, Western Cape")).toBe("Cape Town");
  });

  it("preserves the existing fallback when location is unavailable", () => {
    expect(getJobCity(undefined, "Johannesburg")).toBe("Johannesburg");
  });

  it("builds the job card tags in their current display order", () => {
    expect(
      getJobTags({
        industry: "Technology",
        location: "Durban, KwaZulu-Natal",
        employmentType: "Full Time",
      }),
    ).toEqual(["Technology", "Durban", "Full Time"]);
  });
});