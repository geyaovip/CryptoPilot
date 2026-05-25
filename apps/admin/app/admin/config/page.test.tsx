import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfigPage from "./page";

vi.mock("../_components/admin-shell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
vi.mock("./config-panel", () => ({
  ConfigPanel: () => <div>系统配置</div>
}));

describe("Admin config page", () => {
  it("renders config panel", () => {
    render(<ConfigPage />);
    expect(screen.getByText("系统配置")).toBeTruthy();
  });
});
