import { beforeEach, describe, expect, it, vi } from "vitest";
import { PromptService } from "./prompt.service";

describe("PromptService.activate", () => {
  const prisma = {
    prompt: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[]))
  };

  const service = new PromptService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("archives previous active prompt when activating draft", async () => {
    prisma.prompt.findUnique.mockResolvedValue({
      id: "p2",
      promptKey: "feed_summary_prompt",
      status: "DRAFT",
      deletedAt: null
    });
    prisma.prompt.updateMany.mockResolvedValue({ count: 1 });
    prisma.prompt.update.mockResolvedValue({ id: "p2", status: "ACTIVE" });

    await service.activate("p2");

    expect(prisma.prompt.updateMany).toHaveBeenCalledWith({
      where: { promptKey: "feed_summary_prompt", status: "ACTIVE", deletedAt: null },
      data: { status: "ARCHIVED" }
    });
    expect(prisma.prompt.update).toHaveBeenCalledWith({
      where: { id: "p2" },
      data: { status: "ACTIVE" }
    });
  });
});
