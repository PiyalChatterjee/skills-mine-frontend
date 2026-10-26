import { beforeEach, describe, expect, it, vi } from "vitest";
import { crmApi } from "./crmApi";

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("./axios", () => ({ crmApiClient: mocks }));

describe("CRM Swagger contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses size, search, status and 1-based pages with the direct list response", async () => {
    const data = {
      summary: { needsAttention: 5, hotLeads: 8, warmContacts: 3, coldLeads: 2 },
      clients: [{ clientId: "client-1", clientName: "Employer", status: "hot_lead" }],
      page: 2, size: 20, totalElements: 38, totalPages: 2,
    };
    const params = { page: 2, size: 20, search: "bank", status: "hot_lead" } as const;
    mocks.get.mockResolvedValue({ data });
    await expect(crmApi.listClients(params)).resolves.toEqual(data);
    expect(mocks.get).toHaveBeenCalledExactlyOnceWith("/crm/clients", { params });
  });

  it("submits classification and exact Swagger date keys when adding a note", async () => {
    const payload = {
      classification: "warm_contact", note: "Discussed hiring plans",
      followupDate: "2026-11-01", lastcontactDate: "2026-10-26",
    } as const;
    const data = { clientId: "client/1", status: "warm_contact", note: payload.note };
    mocks.post.mockResolvedValue({ data });
    await expect(crmApi.addClientNote("client/1", payload)).resolves.toEqual(data);
    expect(mocks.post).toHaveBeenCalledExactlyOnceWith("/crm/clients/client%2F1/notes", payload);
  });

  it("creates an employer with the CRM field names and returns the direct response", async () => {
    const payload = {
      employerName: "Employer", contactName: "Recruiter", contactNumber: "+27 11 123 4567",
      emailId: "contact@example.com", clientRate: 0,
    };
    const data = { clientId: "client-1", clientName: "Employer" };
    mocks.post.mockResolvedValue({ data });
    await expect(crmApi.createEmployer(payload)).resolves.toEqual(data);
    expect(mocks.post).toHaveBeenCalledExactlyOnceWith("/crm/employer", payload);
  });

  it("URL-encodes employer names for detail lookup", async () => {
    const data = { clientId: "client-1", clientName: "A & B/SA" };
    mocks.get.mockResolvedValue({ data });
    await expect(crmApi.getEmployerByName("A & B/SA")).resolves.toEqual(data);
    expect(mocks.get).toHaveBeenCalledExactlyOnceWith("/crm/employers/A%20%26%20B%2FSA");
  });

  it("propagates API failures rather than returning empty success data", async () => {
    const error = new Error("CRM unavailable");
    mocks.get.mockRejectedValue(error);
    await expect(crmApi.listClients()).rejects.toBe(error);
  });
});
