import { describe, expect, it } from "vitest";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";

describe("FeedController", () => {
  it("returns cursor feed list response", async () => {
    const service = {
      list: async () => ({ items: [], next_cursor: null })
    } as unknown as FeedService;
    const controller = new FeedController(service);
    const response = await controller.list({});

    expect(response.data).toEqual({ items: [], next_cursor: null });
    expect(response.request_id).toBeTruthy();
  });

  it("returns feed detail response", async () => {
    const service = {
      getById: async () => ({ id: "feed-1", similar_feed: [] })
    } as unknown as FeedService;
    const controller = new FeedController(service);
    const response = await controller.getById("feed-1");

    expect(response.data.id).toBe("feed-1");
  });
});
