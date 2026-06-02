import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LogsPage from "./page";

vi.mock("../_components/admin-shell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
vi.mock("./logs-panel", () => ({
  LogsPanel: () => <div>日志中心</div>
}));

describe("Admin logs page", () => {
  it("renders logs panel", () => {
    render(<LogsPage />);
    expect(screen.getByRole("heading", { name: "日志中心", level: 1 })).toBeTruthy();
  });
});
