import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfigPage from "./page";

vi.mock("../_components/admin-shell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
vi.mock("./config-panel", () => ({
  ConfigPanel: ({ items, loadError }: { items: Array<unknown>; loadError: string | null }) => (
    <div>系统配置 ({items.length})</div>
  )
}));
vi.mock("../../lib/api", () => ({
  getAdminConfig: () => Promise.resolve({ items: [{ key: "test", value: "val" }] })
}));

describe("Admin config page", () => {
  it("renders config panel", async () => {
    const page = await ConfigPage();
    render(page);
    expect(screen.getByText("系统配置 (1)")).toBeTruthy();
  });
});
