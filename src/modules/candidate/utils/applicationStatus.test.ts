import { describe, expect, it } from "vitest";
import { getApplicationStatusKey, getApplicationStatusLabel } from "./applicationStatus";

describe("getApplicationStatusKey", () => {
  it.each([
    ["INBOUND", "applied"],
    ["applied", "applied"],
    [" Screening ", "screening"],
    ["ASSESSMENT", "assessment"],
    ["INTERVIEW", "interview"],
    ["SHORTLIST", "shortlisted"],
    ["OFFER", "offer_extended"],
    ["offer_accepted", "offer_accepted"],
    ["CLOSED", "offer_accepted"],
    ["offer_declined", "offer_declined"],
    ["REJECT", "rejected"],
    ["OFFER_REJECT", "rejected"],
    [" offer_reject ", "rejected"],
    ["rejected", "rejected"],
  ])("maps %s to %s", (stage, key) => {
    expect(getApplicationStatusKey(stage)).toBe(key);
  });

  it.each([undefined, null, "", "SOMETHING_NEW"])("returns unknown for %s", (stage) => {
    expect(getApplicationStatusKey(stage)).toBe("unknown");
  });
});

describe("getApplicationStatusLabel", () => {
  it.each([
    ["INBOUND", "Applied"],
    ["SHORTLIST", "Shortlisted"],
    ["OFFER", "Offer"],
    ["REJECT", "Closed"],
    ["OFFER_REJECT", "Closed"],
    ["CLOSED", "Closed"],
    ["PLACED", "Placed"],
  ])("labels %s as %s", (stage, label) => {
    expect(getApplicationStatusLabel(stage)).toBe(label);
  });

  it("returns undefined for a missing stage and echoes unknown stages", () => {
    expect(getApplicationStatusLabel(undefined)).toBeUndefined();
    expect(getApplicationStatusLabel("CUSTOM_STAGE")).toBe("CUSTOM_STAGE");
  });
});
