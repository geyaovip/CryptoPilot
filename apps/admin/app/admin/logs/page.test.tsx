import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LogsPage from "./page";

vi.mock("../_components/admin-shell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
vi.mock("./logs-panel", () => ({
  LogsPanel: ({ items }: { items: Array<unknown> }) => <div>日志中心 ({items.length})</div>
}));
vi.mock("../_components/admin-pagination", () => ({
  AdminPagination: () => <div>分页</div>
}));
vi.mock("../../lib/api", () => ({
  getAdminLogs: () =>
    Promise.resolve({
      items: [],
      from: "",
      to: "",
      total: 0,
      page: 1,
      limit: 25,
      total_pages: 1,
      has_prev: false,
      has_next: false
    })
}));

describe("Admin logs page", () => {
  it("renders logs panel", async () => {
    const page = await LogsPage({ searchParams: Promise.resolve({}) });
    render(page);
    expect(screen.getByRole("heading", { name: "日志中心", level: 1 })).toBeTruthy();
  });
});
