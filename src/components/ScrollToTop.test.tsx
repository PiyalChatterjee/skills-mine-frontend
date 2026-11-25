import { render } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { ScrollToTop } from "./ScrollToTop";

const BackButton = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>back</button>;
};

const renderApp = (initialEntries: string[] = ["/"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <ScrollToTop />
      <Link to="/next">next</Link>
      <Link to="/next#section">anchor</Link>
      <Link to="/restored" state={{ restoreScrollY: 640 }}>restore</Link>
      <BackButton />
      <Routes>
        <Route path="*" element={<div />} />
      </Routes>
    </MemoryRouter>,
  );

describe("ScrollToTop", () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    scrollTo.mockClear();
    window.scrollTo = scrollTo;
  });

  it("scrolls to the top on PUSH navigation", async () => {
    const { getByText } = renderApp();
    scrollTo.mockClear();

    await userEvent.click(getByText("next"));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("does not scroll when the URL has a hash", async () => {
    const { getByText } = renderApp();
    scrollTo.mockClear();

    await userEvent.click(getByText("anchor"));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("does not scroll on back/forward (POP) navigation", async () => {
    const { getByText } = renderApp();
    await userEvent.click(getByText("next"));
    scrollTo.mockClear();

    await userEvent.click(getByText("back"));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("restores the requested scroll offset from navigation state", async () => {
    const { getByText } = renderApp();
    scrollTo.mockClear();

    await userEvent.click(getByText("restore"));

    expect(scrollTo).toHaveBeenCalledWith({
      top: 640,
      left: 0,
      behavior: "instant",
    });
  });
});
