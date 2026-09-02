import { describe, expect, it } from "vitest";
import { splitCandidateFullName } from "./candidateName";

describe("splitCandidateFullName", () => {
  it("separates a conventional first and last name", () => {
    expect(splitCandidateFullName("Jane Mary Doe")).toEqual({
      firstName: "Jane",
      lastName: "Mary Doe",
    });
  });

  it("normalizes repeated whitespace between name parts", () => {
    expect(splitCandidateFullName("  Jane\t  Mary   Doe ")).toEqual({
      firstName: "Jane",
      lastName: "Mary Doe",
    });
  });

  it("returns empty values for blank input", () => {
    expect(splitCandidateFullName("  ")).toEqual({ firstName: "", lastName: "" });
  });
});