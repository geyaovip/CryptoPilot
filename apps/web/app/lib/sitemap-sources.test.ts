import { describe, expect, it, vi } from "vitest";
import { collectCursorPages } from "./sitemap-sources";

describe("collectCursorPages", () => {
  it("walks cursor pages and deduplicates ids", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          { id: "a", label: 1 },
          { id: "b", label: 2 }
        ],
        next_cursor: "b"
      })
      .mockResolvedValueOnce({
        items: [
          { id: "b", label: 2 },
          { id: "c", label: 3 }
        ],
        next_cursor: null
      });

    const items = await collectCursorPages(fetchPage, 10);

    expect(items.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage.mock.calls[1]?.[0]).toBe("b");
  });

  it("stops at max item cap", async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      items: [{ id: "1" }, { id: "2" }, { id: "3" }],
      next_cursor: "cursor"
    });

    const items = await collectCursorPages(fetchPage, 2);

    expect(items).toHaveLength(2);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
