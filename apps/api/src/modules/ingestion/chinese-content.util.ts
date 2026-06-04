/** Heuristic: enough CJK characters to treat copy as Chinese-facing. */
export function chineseTextRatio(text: string): number {
  const chars = text.replace(/\s/g, "");
  if (!chars.length) return 0;
  const cjk = chars.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g)?.length ?? 0;
  return cjk / chars.length;
}

export function isChineseContent(text: string, minRatio = 0.08): boolean {
  return chineseTextRatio(text) >= minRatio;
}

export function pickChineseDisplayText(parts: Array<string | null | undefined>): string | null {
  for (const part of parts) {
    const trimmed = part?.trim();
    if (trimmed && isChineseContent(trimmed)) return trimmed;
  }
  return null;
}

/** Strip trailing punctuation that doesn't belong in titles (。.，,；;！!？?) */
export function stripTrailingPunctuation(text: string): string {
  return text.replace(/[。.，,；;！!？?]+$/, "").trim();
}
