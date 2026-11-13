import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  lastContactDays: 1, followupDays: 0, overdueDays: 0, lastNote: "Hiring next month",
  contactName: "Account contact", contactNumber: "+27111234567", emailId: "contact@example.com",
};
const response = {
  clients: [client], summary: { needsAttention: 7, hotLeads: 42, warmContacts: 9, coldLeads: 2 },
  page: 1, size: 20, totalElements: 21, totalPages: 2,
};

function renderPage(navigation: 'recruiter' | 'exco' = 'recruiter') {
  const store = configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
  render(<Provider store={store}><RecruiterCrmPage navigation={navigation} /></Provider>);
  return store;
}

describe("live CRM screen", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.setSystemTime(new Date(2026, 10, 4, 12));
    vi.mocked(crmApi.listClients).mockResolvedValue(response);
    vi.mocked(crmApi.getEmployerByName).mockResolvedValue({
      ...client, contactName: "Account contact", contactNumber: "+27111234567",
      emailId: "contact@example.com", clientRate: 15,
    });
    vi.mocked(crmApi.addClientNote).mockResolvedValue(client);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(['recruiter', 'exco'] as const)("populates contact and overdue dates on the %s CRM screen", async (navigation) => {
    vi.mocked(crmApi.listClients).mockResolvedValue({
      ...response,
      clients: [{ ...client, lastContactDays: 7, overdueDays: 3, followupDays: 5 }],
    });
    renderPage(navigation);
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("textbox", { name: "Last Contact Date" })).toHaveValue("2026-10-28");
    expect(within(dialog).getByRole("textbox", { name: "Follow-up Date" })).toHaveValue("2026-11-01");
  });

  it.each([
    { lastContactDays: 0, followupDays: 0, overdueDays: 0, contactDate: "2026-11-04", followupDate: "2026-11-04" },
    { lastContactDays: 4, followupDays: 30, overdueDays: 0, contactDate: "2026-10-31", followupDate: "2026-12-04" },
    { lastContactDays: null, followupDays: null, overdueDays: null, contactDate: "", followupDate: "" },
    { lastContactDays: undefined, followupDays: undefined, overdueDays: undefined, contactDate: "", followupDate: "" },
    { lastContactDays: NaN, followupDays: Infinity, overdueDays: 0, contactDate: "", followupDate: "" },
  ])("initializes dates from $lastContactDays contact days and $followupDays follow-up days", async ({ contactDate, followupDate, ...timing }) => {
    vi.mocked(crmApi.listClients).mockResolvedValue({
      ...response, clients: [{ ...client, ...timing }],
    });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("textbox", { name: "Last Contact Date" })).toHaveValue(contactDate);
    expect(within(dialog).getByRole("textbox", { name: "Follow-up Date" })).toHaveValue(followupDate);
  });

  it("renders server counts, names, notes and zero-day timing", async () => {
    vi.mocked(crmApi.listClients).mockResolvedValue({
      ...response, clients: [{ ...client, lastContactDays: 0 }],
    });
    renderPage();
    expect(await screen.findByRole("heading", { name: "Live Employer" })).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Hiring next month")).toBeInTheDocument();
    expect(screen.getByText(/0 days/, { selector: "span" })).toHaveTextContent("Follow up: 0 days");
    expect(screen.getByText("Last Contact: 0 days ago")).toBeInTheDocument();
    expect(screen.getByText("Account contact").tagName).toBe("SPAN");
    expect(screen.queryByRole("link", { name: "Account contact" })).not.toBeInTheDocument();
    expect(screen.getByText("+27111234567").tagName).toBe("SPAN");
    expect(screen.queryByRole("link", { name: "+27111234567" })).not.toBeInTheDocument();
    expect(crmApi.listClients).toHaveBeenCalledWith({ page: 1, size: 20 });
  });

  it.each(['recruiter', 'exco'] as const)("shows only search on the %s CRM screen", async (navigation) => {
    renderPage(navigation);
    await screen.findByText("Live Employer");
    expect(screen.getByRole("textbox", { name: "Search contacts" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Classification" })).not.toBeInTheDocument();
  });

  it("requests pages and resets to page 1 for debounced server search", async () => {
    renderPage();
    await screen.findByText("Live Employer");
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    await waitFor(() => expect(crmApi.listClients).toHaveBeenLastCalledWith({ page: 2, size: 20 }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search contacts" }), { target: { value: " Bank " } });
    await waitFor(() => expect(crmApi.listClients).toHaveBeenLastCalledWith({ page: 1, size: 20, search: "Bank" }));
  });

  it("validates notes, submits exact payload and refreshes clients from the redesigned popup", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("radio", { name: "Hot Lead" })).toBeChecked();
    expect(within(dialog).getByLabelText(/Add Note/)).toHaveValue(client.lastNote);
    expect(crmApi.addClientNote).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText(/Add Note/), { target: { value: "  Spoke to contact  " } });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Follow-up Date" }), { target: { value: "2026-11-05" } });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Update" })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole("button", { name: "Update" }));
    await waitFor(() => expect(crmApi.addClientNote).toHaveBeenCalledExactlyOnceWith("client-1", {
      classification: "hot_lead", note: "Spoke to contact", followupDate: "2026-11-05",
      lastcontactDate: "2026-11-03",
    }));
    expect(await screen.findByText("Client updated successfully.")).toBeInTheDocument();
    await waitFor(() => expect(crmApi.listClients).toHaveBeenCalledTimes(2));
  });

  it.each(["Last Contact Date"])(
    "rejects a future %s",
    async (label) => {
      renderPage();
      fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
      const dialog = screen.getByRole("dialog");
      fireEvent.change(within(dialog).getByRole("textbox", { name: label }), {
        target: { value: "2026-11-05" },
      });

      expect(await within(dialog).findByText("Date cannot be in the future")).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Update" })).toBeDisabled();
      expect(crmApi.addClientNote).not.toHaveBeenCalled();
    },
  );

  it.each(["Last Contact Date"])(
    "disables future dates in the %s calendar",
    async (label) => {
      renderPage();
      fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
      const dialog = screen.getByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", {
        name: `Choose ${label.toLowerCase()}`,
      }));

      const calendar = await screen.findByRole("dialog", { name: `${label} calendar` });
      const tomorrow = within(calendar).getAllByRole("gridcell")
        .find((cell) => cell.textContent === "5");
      expect(tomorrow).toBeDisabled();
    },
  );

  it.each(["2026-11-02", "2026-11-03"])(
    "rejects follow-up %s on or before the contact date and revalidates when contact changes",
    async (followupDate) => {
      renderPage();
      fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
      const dialog = screen.getByRole("dialog");
      fireEvent.change(within(dialog).getByRole("textbox", { name: "Follow-up Date" }), {
        target: { value: followupDate },
      });

      expect(await within(dialog).findByText("Follow-up Date must be after Last Contact Date")).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Update" })).toBeDisabled();
      expect(crmApi.addClientNote).not.toHaveBeenCalled();

      fireEvent.change(within(dialog).getByRole("textbox", { name: "Last Contact Date" }), {
        target: { value: "2026-11-01" },
      });
      await waitFor(() => {
        expect(within(dialog).queryByText("Follow-up Date must be after Last Contact Date")).not.toBeInTheDocument();
        expect(within(dialog).getByRole("button", { name: "Update" })).toBeEnabled();
      });

      fireEvent.change(within(dialog).getByRole("textbox", { name: "Last Contact Date" }), {
        target: { value: "2026-11-04" },
      });
      expect(await within(dialog).findByText("Follow-up Date must be after Last Contact Date")).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Update" })).toBeDisabled();
    },
  );

  it.each(["recruiter", "exco"] as const)(
    "limits the follow-up calendar to dates after last contact on %s",
    async (navigation) => {
      renderPage(navigation);
      fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
      const dialog = screen.getByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", { name: "Choose follow-up date" }));
      const calendar = await screen.findByRole("dialog", { name: "Follow-up Date calendar" });
      const days = within(calendar).getAllByRole("gridcell");
      expect(days.find((cell) => cell.textContent === "2")).toBeDisabled();
      expect(days.find((cell) => cell.textContent === "3")).toBeDisabled();
      expect(days.find((cell) => cell.textContent === "4")).toBeEnabled();
      expect(days.find((cell) => cell.textContent === "5")).toBeEnabled();
    },
  );

  it("submits the existing note when only classification changes", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText(/Add Note/)).toHaveValue("Hiring next month");
    fireEvent.click(within(dialog).getByRole("radio", { name: "Warm Contact" }));
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Update" })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole("button", { name: "Update" }));
    await waitFor(() => expect(crmApi.addClientNote).toHaveBeenCalledExactlyOnceWith("client-1", {
      classification: "warm_contact", note: "Hiring next month",
      lastcontactDate: "2026-11-03", followupDate: "2026-11-04",
    }));
  });

  it.each([null, undefined, ""])("keeps the note empty and required when the existing note is %s", async (lastNote) => {
    vi.mocked(crmApi.listClients).mockResolvedValue({
      ...response, clients: [{ ...client, lastNote }],
    });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText(/Add Note/)).toHaveValue("");
    fireEvent.click(within(dialog).getByRole("radio", { name: "Warm Contact" }));
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Update" })).toBeDisabled());
    expect(crmApi.addClientNote).not.toHaveBeenCalled();
  });

  it("restores the saved note after cancelling an edited draft", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Update Live Employer" }));
    fireEvent.change(screen.getByLabelText(/Add Note/), { target: { value: "Unsaved draft" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Update Live Employer" }));
    expect(screen.getByLabelText(/Add Note/)).toHaveValue(client.lastNote);
    expect(crmApi.addClientNote).not.toHaveBeenCalled();
  });

  it("does not expose employer creation on the dashboard", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Live Employer" });
    expect(screen.queryByRole("button", { name: "Add employer" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(crmApi.createEmployer).not.toHaveBeenCalled();
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
