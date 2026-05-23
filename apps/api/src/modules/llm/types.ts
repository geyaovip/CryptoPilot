export type LlmJsonInput = {
  promptKey: string;
  system?: string;
  user: string;
  userId?: string;
};

export type LlmTextInput = LlmJsonInput;

export type LlmJsonResult = {
  data: unknown;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};

export type LlmTextResult = Omit<LlmJsonResult, "data"> & { text: string };

export type LlmEmbedResult = {
  vectors: number[][];
  provider: string;
  model: string;
  inputTokens: number;
  latencyMs: number;
};

export interface LlmProvider {
  readonly name: string;
  generateJson(input: LlmJsonInput): Promise<LlmJsonResult>;
  generateText(input: LlmTextInput): Promise<LlmTextResult>;
  embed(texts: string[], promptKey?: string): Promise<LlmEmbedResult>;
}
