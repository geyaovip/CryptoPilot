import { AppHttpException } from "../common/app-http.exception";
import type { LlmEmbedResult, LlmJsonInput, LlmJsonResult, LlmProvider, LlmTextInput, LlmTextResult } from "./types";

type OpenAiCompatibleConfig = {
  apiKey: string;
  baseUrl: string;
  providerName: string;
  apiStyle: "openai" | "deepseek";
  chatModel: string;
  embeddingModel: string;
  temperature: number;
  maxOutputTokens: number;
  embeddingsEnabled: boolean;
  extraBody?: Record<string, unknown>;
};

export class OpenAiProvider implements LlmProvider {
  readonly name: string;

  constructor(private readonly config: OpenAiCompatibleConfig) {
    this.name = config.providerName;
  }

  async generateJson(input: LlmJsonInput): Promise<LlmJsonResult> {
    const started = Date.now();
    const response = await this.chat({
      messages: [
        { role: "system", content: input.system ?? "Return valid JSON only." },
        { role: "user", content: input.user }
      ],
      response_format: { type: "json_object" }
    });
    const parsed = JSON.parse(response.content) as unknown;
    return {
      data: parsed,
      provider: this.name,
      model: this.config.chatModel,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      latencyMs: Date.now() - started
    };
  }

  async generateText(input: LlmTextInput): Promise<LlmTextResult> {
    const started = Date.now();
    const response = await this.chat({
      messages: [
        { role: "system", content: input.system ?? "You are a helpful assistant." },
        { role: "user", content: input.user }
      ]
    });
    return {
      text: response.content,
      provider: this.name,
      model: this.config.chatModel,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      latencyMs: Date.now() - started
    };
  }

  async embed(texts: string[]): Promise<LlmEmbedResult> {
    if (!this.config.embeddingsEnabled) {
      throw new AppHttpException("LLM_PROVIDER_ERROR", "当前 LLM 提供商不支持 Embedding", 502);
    }
    const started = Date.now();
    const response = await fetch(this.embeddingsUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: this.config.embeddingModel, input: texts })
    });
    if (!response.ok) {
      throw new AppHttpException("LLM_PROVIDER_ERROR", "Embedding 调用失败", 502);
    }
    const body = (await response.json()) as {
      data: { embedding: number[] }[];
      usage?: { prompt_tokens?: number };
    };
    return {
      vectors: body.data.map((row) => row.embedding),
      provider: this.name,
      model: this.config.embeddingModel,
      inputTokens: body.usage?.prompt_tokens ?? 0,
      latencyMs: Date.now() - started
    };
  }

  private async chat(input: {
    messages: { role: "system" | "user"; content: string }[];
    response_format?: { type: "json_object" };
  }) {
    const response = await fetch(this.chatCompletionsUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.chatModel,
        temperature: this.config.temperature,
        max_tokens: this.config.maxOutputTokens,
        messages: input.messages,
        response_format: input.response_format,
        ...this.config.extraBody
      })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new AppHttpException(
        "LLM_PROVIDER_ERROR",
        `Chat 调用失败${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        502
      );
    }
    const body = (await response.json()) as {
      choices: { message: { content?: string | null; reasoning_content?: string | null } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const message = body.choices[0]?.message;
    const content = message?.content?.trim() || message?.reasoning_content?.trim();
    if (!content) {
      throw new AppHttpException("LLM_PROVIDER_ERROR", "LLM 返回空内容", 502);
    }
    return {
      content,
      inputTokens: body.usage?.prompt_tokens ?? 0,
      outputTokens: body.usage?.completion_tokens ?? 0
    };
  }

  private chatCompletionsUrl(): string {
    const base = this.config.baseUrl.replace(/\/$/, "");
    if (this.config.apiStyle === "deepseek") return `${base}/chat/completions`;
    if (base.endsWith("/v1")) return `${base}/chat/completions`;
    return `${base}/v1/chat/completions`;
  }

  private embeddingsUrl(): string {
    const base = this.config.baseUrl.replace(/\/$/, "");
    return `${base}/v1/embeddings`;
  }
}
