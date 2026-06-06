/** Strip punctuation and normalize whitespace for search term extraction. */
export function normalizeSearchQuery(query: string): string {
  return query
    .replace(/[？?！!。．，,；;：:、"'""''()（）\[\]【】《》<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract search terms from mixed Chinese/English queries.
 * Chinese text without spaces is split into short CJK segments so keyword search can match partial titles.
 */
export function extractSearchTerms(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [];

  const terms = new Set<string>();

  for (const chunk of normalized.split(" ")) {
    if (chunk.length >= 2) terms.add(chunk);
  }

  for (const run of normalized.match(/[\u4e00-\u9fff\u3400-\u4dbf]+/g) ?? []) {
    if (run.length <= 6) {
      terms.add(run);
      continue;
    }
    terms.add(run.slice(0, 4));
    terms.add(run.slice(0, 2));
    for (let i = 0; i < run.length - 1; i += 1) {
      terms.add(run.slice(i, i + 2));
      if (terms.size >= 12) break;
    }
  }

  for (const token of normalized.match(/\b[a-zA-Z][a-zA-Z0-9.-]{0,}\b/g) ?? []) {
    if (token.length >= 2) terms.add(token);
  }

  return [...terms].slice(0, 10);
}

export function dedupeContextIds(ids: string[]): string[] {
  return [...new Set(ids)];
}
