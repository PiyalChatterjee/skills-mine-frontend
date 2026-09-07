import { describe, expect, it } from "vitest";
import { formatEnumLabel } from "./formatEnumLabel";

describe("formatEnumLabel", () => {
  it.each([
    ["FULL_TIME", "Full Time"],
    ["PART_TIME", "Part Time"],
    ["ON_HOLD", "On Hold"],
    ["AI_GENERATED", "AI Generated"],
    ["POSTED", "Posted"],
    ["ONSITE", "On-site"],
  ])("formats %s", (value, expected) => {
    expect(formatEnumLabel(value)).toBe(expected);
  });

  it("preserves text that is already display-ready", () => {
    expect(formatEnumLabel("Full Time")).toBe("Full Time");
    expect(formatEnumLabel("Construction & Real Estate")).toBe("Construction & Real Estate");
  });

  it("handles empty values", () => {
    expect(formatEnumLabel()).toBe("");
    expect(formatEnumLabel(null)).toBe("");
  });
});