import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContextBackLink } from "./context-back-link";

function setReferrer(value: string) {
  Object.defineProperty(document, "referrer", { configurable: true, value });
}

describe("ContextBackLink", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/insights/insight-1");
    vi.spyOn(window.history, "back").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns to the same-origin previous page when available", () => {
    setReferrer(`${window.location.origin}/feed/feed-1`);
    render(<ContextBackLink fallbackHref="/" />);

    fireEvent.click(screen.getByRole("link", { name: /返回上一页/ }));

    expect(window.history.back).toHaveBeenCalledTimes(1);
  });

  it("falls back when the page has no safe referrer", () => {
    setReferrer("https://external.example/news");
    render(<ContextBackLink fallbackHref="/" />);

    expect(screen.getByRole("link", { name: /返回上一页/ }).getAttribute("href")).toBe("/");
    expect(window.history.back).not.toHaveBeenCalled();
  });
});
