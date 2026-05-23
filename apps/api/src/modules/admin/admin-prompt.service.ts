import { Inject, Injectable } from "@nestjs/common";
import type { MvpPromptKey } from "@cryptopilot/types";
import { PromptService } from "../prompt/prompt.service";

@Injectable()
export class AdminPromptService {
  constructor(@Inject(PromptService) private readonly promptService: PromptService) {}

  list(promptKey?: string) {
    return this.promptService.listByKey(promptKey);
  }

  create(input: { prompt_key: MvpPromptKey; content: string }) {
    return this.promptService.createDraft(input);
  }

  update(id: string, content: string) {
    return this.promptService.updateDraft(id, content);
  }

  activate(id: string) {
    return this.promptService.activate(id);
  }

  archive(id: string) {
    return this.promptService.archive(id);
  }

  test(id: string, variables: Record<string, string>) {
    return this.promptService.testPrompt(id, variables);
  }
}
