import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebUserMenu } from "./web-user-menu";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() })
}));

vi.mock("../lib/auth-store", () => ({
  useAuthStore: (selector: (state: { accessToken: string | null; setAccessToken: (t: string | null) => void }) => unknown) =>
    selector({ accessToken: null, setAccessToken: vi.fn() })
}));

describe("WebUserMenu", () => {
  it("navigates to login when guest clicks profile", () => {
    push.mockClear();
    render(<WebUserMenu />);

    expect(screen.queryByRole("menuitem", { name: "退出登录" })).toBeNull();
    fireEvent.click(screen.getByText("登录"));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
