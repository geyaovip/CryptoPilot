import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUserMenu } from "./admin-user-menu";

const push = vi.fn();
const setAccessToken = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() })
}));

vi.mock("../../lib/auth-store", () => ({
  useAdminAuthStore: (selector: (state: { accessToken: string | null; setAccessToken: (t: string | null) => void }) => unknown) =>
    selector({ accessToken: "fake-token", setAccessToken })
}));

describe("AdminUserMenu", () => {
  beforeEach(() => {
    push.mockClear();
    setAccessToken.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { user: { name: "管理员", email: "admin@example.com", role: "admin" } }
        })
      })
    );
  });

  it("logs out and redirects to admin login", async () => {
    render(<AdminUserMenu />);

    await waitFor(() => {
      expect(screen.getByText("管理员")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /管理员/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "退出登录" }));

    expect(setAccessToken).toHaveBeenCalledWith(null);
    expect(push).toHaveBeenCalledWith("/admin/login");
  });
});
