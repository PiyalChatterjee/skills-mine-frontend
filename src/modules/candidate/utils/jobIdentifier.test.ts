import { describe, expect, it } from "vitest";
import { getJobOperationId } from "./jobIdentifier";

describe("getJobOperationId", () => {
  it("prefers the API operation identifier", () => {
    expect(
      getJobOperationId({ jobId: "job-1", jobProfileId: "profile-1" }),
    ).toBe("profile-1");
  });

  it("falls back to the job identifier", () => {
    expect(getJobOperationId({ jobId: "job-1" })).toBe("job-1");
  });
});