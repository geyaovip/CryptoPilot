import { truncateDescription } from "./seo";

export function buildDynamicOgImageUrl(input: { title: string; tag?: string }): string {
  const params = new URLSearchParams({
    title: truncateDescription(input.title, 96)
  });
  if (input.tag) {
    params.set("tag", truncateDescription(input.tag, 20));
  }
  return `/og?${params.toString()}`;
}
