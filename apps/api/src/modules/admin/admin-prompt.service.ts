import { Inject, Injectable } from "@nestjs/common";
import type { MvpPromptKey } from "@cryptopilot/types";
import { AuditService } from "../common/audit.service";
import { PromptService } from "../prompt/prompt.service";

@Injectable()
export class AdminPromptService {
  constructor(
    @Inject(PromptService) private readonly promptService: PromptService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  list(promptKey?: string) {
    return this.promptService.listByKey(promptKey);
  }

  async create(input: { prompt_key: MvpPromptKey; content: string }, adminUserId: string) {
    const row = await this.promptService.createDraft(input);
    await this.audit.log({
      adminUserId,
      action: "prompt.create",
      entityType: "prompt",
      entityId: row.id,
      after: row
    });
    return row;
  }

  async update(id: string, content: string, adminUserId: string) {
    const row = await this.promptService.updateDraft(id, content);
    await this.audit.log({
      adminUserId,
      action: "prompt.update",
      entityType: "prompt",
      entityId: id,
      after: row
    });
    return row;
  }

  async activate(id: string, adminUserId: string) {
    const row = await this.promptService.activate(id);
    await this.audit.log({
      adminUserId,
      action: "prompt.activate",
      entityType: "prompt",
      entityId: id,
      after: row
    });
    return row;
  }

  async archive(id: string, adminUserId: string) {
    const row = await this.promptService.archive(id);
    await this.audit.log({
      adminUserId,
      action: "prompt.archive",
      entityType: "prompt",
      entityId: id,
      after: row
    });
    return row;
  }

  test(id: string, variables: Record<string, string>) {
    return this.promptService.testPrompt(id, variables);
  }
}
