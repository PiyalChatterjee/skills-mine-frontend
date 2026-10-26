import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { crmApi } from "@/services/api/crmApi";
import { apiSlice } from "@/store/api/apiSlice";
import RecruiterCrmPage from "./RecruiterCrmPage";

vi.mock("@/modules/recruiter/components/RecruiterSidebar", () => ({ RecruiterSidebar: () => null }));
vi.mock("@/services/api/crmApi", () => ({
  crmApi: {
    listClients: vi.fn(), getEmployerByName: vi.fn(),
    addClientNote: vi.fn(), createEmployer: vi.fn(),
  },
}));

const client = {
  clientId: "client-1", clientName: "Live Employer", status: "hot_lead",
  lastContactDays: 0, followupDays: 0, overdueDays: 0, lastNote: "Hiring next month",
  contactName: "Account contact", contactNumber: "+27111234567", emailId: "contact@example.com",
};
const response = {
  clients: [client], summary: { needsAttention: 7, hotLeads: 42, warmContacts: 9, coldLeads: 2 },
  page: 1, size: 20, totalElements: 21, totalPages: 2,
};

function renderPage() {
  const store = configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
  render(<Provider store={store}><RecruiterCrmPage /></Provider>);
  return store;
}

describe("live CRM screen", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(crmApi.listClients).mockResolvedValue(response);
    vi.mocked(crmApi.getEmployerByName).mockResolvedValue({
      ...client, contactName: "Account contact", contactNumber: "+27111234567",
      emailId: "contact@example.com", clientRate: 15,
    });
    vi.mocked(crmApi.addClientNote).mockResolvedValue(client);
    vi.mocked(crmApi.createEmployer).mockResolvedValue(client);
  });

  it("renders server counts, names, notes and zero-day timing", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Live Employer" })).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Hiring next month")).toBeInTheDocument();
    expect(screen.getByText(/0 days/, { selector: "span" })).toHaveTextContent("Follow up: 0 days");
    expect(screen.getByText("Last Contact: 0 days ago")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Account contact" })).toHaveAttribute("href", "mailto:contact@example.com");
    expect(screen.getByRole("link", { name: "+27111234567" })).toHaveAttribute("href", "tel:+27111234567");
    expect(crmApi.listClients).toHaveBeenCalledWith({ page: 1, size: 20 });
  });

  it("requests pages and resets to page 1 for debounced server search and filters", async () => {
    renderPage();
    await screen.findByText("Live Employer");
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    await waitFor(() => expect(crmApi.listClients).toHaveBeenLastCalledWith({ page: 2, size: 20 }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search contacts" }), { target: { value: " Bank " } });
    await waitFor(() => expect(crmApi.listClients).toHaveBeenLastCalledWith({ page: 1, size: 20, search: "Bank" }));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Classification" }));
    fireEvent.click(await screen.findByRole("option", { name: "Warm Contact" }));
    await waitFor(() => expect(crmApi.listClients).toHaveBeenLastCalledWith({
      page: 1, size: 20, search: "Bank", status: "warm_contact",
    }));
  });

  it("validates notes, submits exact payload and refreshes clients from the redesigned popup", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("radio", { name: "Hot Lead" })).toBeChecked();
    expect(within(dialog).getByRole("button", { name: "Update" })).toBeDisabled();
    expect(crmApi.addClientNote).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText(/Add Note/), { target: { value: "  Spoke to contact  " } });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Last Follow-up Date" }), { target: { value: "2026-11-01" } });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Update" })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole("button", { name: "Update" }));
    await waitFor(() => expect(crmApi.addClientNote).toHaveBeenCalledExactlyOnceWith("client-1", {
      classification: "hot_lead", note: "Spoke to contact", followupDate: "2026-11-01",
    }));
    expect(await screen.findByText("Client updated successfully.")).toBeInTheDocument();
    await waitFor(() => expect(crmApi.listClients).toHaveBeenCalledTimes(2));
  });

  it("creates employers and preserves a zero client rate", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Add employer" }));
    const dialog = screen.getByRole("dialog");
    for (const [label, value] of [
      ["Employer name", "New Employer"], ["Contact name", "Recruiter"],
      ["Contact number", "+27 11 123 4567"], ["Email address", "recruiter@example.com"], ["Client rate", "0"],
    ]) {
      fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
    }
    fireEvent.click(within(dialog).getByRole("button", { name: "Create employer" }));
    await waitFor(() => expect(crmApi.createEmployer).toHaveBeenCalledExactlyOnceWith({
      employerName: "New Employer", contactName: "Recruiter", contactNumber: "+27 11 123 4567",
      emailId: "recruiter@example.com", clientRate: 0,
    }));
    expect(await screen.findByText("Employer created successfully.")).toBeInTheDocument();
  });

  it("retains note drafts and displays server errors when a mutation fails", async () => {
    vi.mocked(crmApi.addClientNote).mockRejectedValue({ response: { status: 403, data: { message: "No permission to update" } } });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    fireEvent.change(screen.getByLabelText(/Add Note/), { target: { value: "Keep this draft" } });
    await waitFor(() => expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Update" })).toBeEnabled());
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Update" }));
    expect(await screen.findByText("No permission to update")).toBeInTheDocument();
    expect(screen.getByLabelText(/Add Note/)).toHaveValue("Keep this draft");
    expect(crmApi.listClients).toHaveBeenCalledTimes(1);
  });

  it("switches classification, rejects more than four note lines and closes without writing", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("radio", { name: "Warm Contact" }));
    expect(within(dialog).getByRole("radio", { name: "Warm Contact" })).toBeChecked();
    fireEvent.change(within(dialog).getByLabelText(/Add Note/), { target: { value: "1\n2\n3\n4\n5" } });
    expect(await within(dialog).findByText("Note must be no more than 4 lines")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Update" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close update dialog" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(crmApi.addClientNote).not.toHaveBeenCalled();
  });

  it("shows errors with retry, then an empty state after recovery", async () => {
    vi.mocked(crmApi.listClients).mockRejectedValueOnce(new Error("CRM unavailable"))
      .mockResolvedValueOnce({ ...response, clients: [], totalElements: 0, totalPages: 0 });
    renderPage();
    expect(await screen.findByText("CRM unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No CRM clients found.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No CRM clients found.")).toBeInTheDocument();
  });
});
