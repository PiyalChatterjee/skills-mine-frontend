import { beforeEach, describe, expect, it, vi } from "vitest";
import { excoApi } from "./excoApi";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("./axios", () => ({ mancoApiClient: mocks }));

describe("EXCO Swagger contract", () => {
  beforeEach(() => vi.resetAllMocks());

  it("requests the latest snapshot without supplying a date and returns the direct response", async () => {
    const data = { metricDate: "2026-10-28", strategicKpis: { placementsYtd: 0 } };
    mocks.get.mockResolvedValue({ data });
    await expect(excoApi.getDashboard()).resolves.toBe(data);
    expect(mocks.get).toHaveBeenCalledExactlyOnceWith("/exco/dashboard", { params: undefined });
  });

  it("passes an explicit snapshot date using the documented parameter", async () => {
    mocks.get.mockResolvedValue({ data: { metricDate: "2026-08-18" } });
    await excoApi.getDashboard("2026-08-18");
    expect(mocks.get).toHaveBeenCalledExactlyOnceWith("/exco/dashboard", {
      params: { metricDate: "2026-08-18" },
    });
  });

  it("propagates unavailable snapshot and permission errors without success fallbacks", async () => {
    const error = new Error("Snapshot not found");
    mocks.get.mockRejectedValue(error);
    await expect(excoApi.getDashboard()).rejects.toBe(error);
  });
});
