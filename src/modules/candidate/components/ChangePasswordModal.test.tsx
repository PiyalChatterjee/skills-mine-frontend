import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChangePasswordModal from "./ChangePasswordModal";

const mocks = vi.hoisted(() => ({
  forgotPassword: vi.fn(),
  dispatch: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  authApi: { forgotPassword: mocks.forgotPassword },
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

const renderModal = (props: Partial<Parameters<typeof ChangePasswordModal>[0]> = {}) => {
  const onClose = vi.fn();
  render(
    <ChangePasswordModal open prefillEmail="" onClose={onClose} {...props} />,
  );
  return { onClose };
};

const emailInput = () => screen.getByRole("textbox", { name: "Email address" });
const sendButton = () => screen.getByRole("button", { name: "Send" });

describe("ChangePasswordModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders reset copy by default and disables Send until an email is entered", () => {
    renderModal();

    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });

  it("renders change copy in change mode with the prefilled email", () => {
    renderModal({ mode: "change", prefillEmail: "jane@example.com" });

    expect(screen.getByText("Change your password")).toBeInTheDocument();
    expect(emailInput()).toHaveValue("jane@example.com");
    expect(sendButton()).toBeEnabled();
  });

  it("does not show a format error before the field is blurred", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(emailInput(), "bad-email");

    expect(screen.queryByText("Enter a valid email address")).not.toBeInTheDocument();
  });

  it("shows a format error on blur and blocks sending an invalid email", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(emailInput(), "bad-email");
    await user.tab();

    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(emailInput()).toHaveAttribute("aria-invalid", "true");

    await user.click(sendButton());
    expect(mocks.forgotPassword).not.toHaveBeenCalled();
  });

  it("surfaces the format error when Send is clicked without blurring first", async () => {
    const user = userEvent.setup();
    renderModal({ prefillEmail: "not-an-email" });

    await user.click(sendButton());

    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(mocks.forgotPassword).not.toHaveBeenCalled();
  });

  it("sends reset instructions, closes, and navigates to the reset page", async () => {
    const user = userEvent.setup();
    mocks.forgotPassword.mockResolvedValue({});
    const { onClose } = renderModal({ prefillEmail: " jane@example.com " });

    await user.click(sendButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mocks.forgotPassword).toHaveBeenCalledWith({ email: "jane@example.com" });
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          level: "success",
          message: "Password reset instructions have been sent.",
        }),
      }),
    );
    expect(mocks.navigate).toHaveBeenCalledWith(
      "/reset-password?email=jane%40example.com",
    );
  });

  it("uses change-specific success copy in change mode", async () => {
    const user = userEvent.setup();
    mocks.forgotPassword.mockResolvedValue({});
    renderModal({ mode: "change", prefillEmail: "jane@example.com" });

    await user.click(sendButton());

    await waitFor(() =>
      expect(mocks.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            message: "Password change instructions have been sent.",
          }),
        }),
      ),
    );
  });

  it("notifies on failure and stays open", async () => {
    const user = userEvent.setup();
    mocks.forgotPassword.mockRejectedValue(new Error("boom"));
    const { onClose } = renderModal({ prefillEmail: "jane@example.com" });

    await user.click(sendButton());

    await waitFor(() =>
      expect(mocks.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ level: "error", title: "Failed to send" }),
        }),
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(sendButton()).toBeEnabled();
  });

  it("uses change-specific failure title in change mode", async () => {
    const user = userEvent.setup();
    mocks.forgotPassword.mockRejectedValue(new Error("boom"));
    renderModal({ mode: "change", prefillEmail: "jane@example.com" });

    await user.click(sendButton());

    await waitFor(() =>
      expect(mocks.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            title: "Failed to send change instructions",
          }),
        }),
      ),
    );
  });

  it("closes from Cancel and the close icon", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
