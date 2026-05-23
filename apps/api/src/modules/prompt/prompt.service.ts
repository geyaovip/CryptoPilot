import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { MvpPromptKey } from "@cryptopilot/types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PromptService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getActiveContent(promptKey: MvpPromptKey): Promise<string> {
    const prompt = await this.prisma.prompt.findFirst({
      where: { promptKey, status: "ACTIVE", deletedAt: null },
      orderBy: { version: "desc" }
    });
    if (!prompt) throw new NotFoundException(`未找到 active Prompt: ${promptKey}`);
    return prompt.content;
  }

  renderTemplate(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (content, [key, value]) => content.replaceAll(`{{${key}}}`, value),
      template
    );
  }

  async listByKey(promptKey?: string) {
    const items = await this.prisma.prompt.findMany({
      where: { deletedAt: null, ...(promptKey ? { promptKey } : {}) },
      orderBy: [{ promptKey: "asc" }, { version: "desc" }]
    });
    return items.map((item) => ({
      id: item.id,
      prompt_key: item.promptKey as MvpPromptKey,
      version: item.version,
      status: item.status.toLowerCase(),
      content: item.content,
      updated_at: item.updatedAt.toISOString()
    }));
  }

  async createDraft(input: { prompt_key: MvpPromptKey; content: string; created_by?: string }) {
    const latest = await this.prisma.prompt.findFirst({
      where: { promptKey: input.prompt_key, deletedAt: null },
      orderBy: { version: "desc" }
    });
    const version = (latest?.version ?? 0) + 1;
    const prompt = await this.prisma.prompt.create({
      data: {
        promptKey: input.prompt_key,
        version,
        content: input.content,
        status: "DRAFT",
        createdBy: input.created_by
      }
    });
    return { id: prompt.id, version: prompt.version };
  }

  async updateDraft(id: string, content: string) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id } });
    if (!prompt || prompt.deletedAt) throw new NotFoundException("Prompt 不存在");
    if (prompt.status !== "DRAFT") throw new ConflictException("仅 draft 版本可编辑");
    await this.prisma.prompt.update({ where: { id }, data: { content } });
    return { success: true };
  }

  async activate(id: string) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id } });
    if (!prompt || prompt.deletedAt) throw new NotFoundException("Prompt 不存在");
    if (prompt.status !== "DRAFT") throw new ConflictException("仅 draft 可激活");

    await this.prisma.$transaction([
      this.prisma.prompt.updateMany({
        where: { promptKey: prompt.promptKey, status: "ACTIVE", deletedAt: null },
        data: { status: "ARCHIVED" }
      }),
      this.prisma.prompt.update({ where: { id }, data: { status: "ACTIVE" } })
    ]);
    return { success: true };
  }

  async archive(id: string) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id } });
    if (!prompt || prompt.deletedAt) throw new NotFoundException("Prompt 不存在");
    await this.prisma.prompt.update({ where: { id }, data: { status: "ARCHIVED" } });
    return { success: true };
  }

  async testPrompt(id: string, variables: Record<string, string>) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id } });
    if (!prompt || prompt.deletedAt) throw new NotFoundException("Prompt 不存在");
    return { rendered: this.renderTemplate(prompt.content, variables) };
  }
}
