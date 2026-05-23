import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "./page";

vi.mock("../_components/admin-user-menu", () => ({
  AdminUserMenu: () => <div data-testid="admin-user-menu" />
}));

describe("AdminDashboardPage", () => {
  it("renders dashboard empty metrics", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByRole("heading", { name: "仪表盘", level: 1 })).toBeTruthy();
    expect(screen.getByText("暂无运营数据")).toBeTruthy();
  });
});
