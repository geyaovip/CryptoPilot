import type { NarrativeSummary } from "@cryptopilot/types";
import Link from "next/link";

type NarrativeTagLinksProps = {
  narratives: NarrativeSummary[];
};

export function NarrativeTagLinks({ narratives }: NarrativeTagLinksProps) {
  if (narratives.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {narratives.map((narrative) => (
        <Link
          className="rounded-full bg-[#F7F5EE] px-2.5 py-1 text-xs text-[#20808D] hover:bg-[#E8F4F6]"
          href={`/narratives/${narrative.slug}`}
          key={narrative.id}
        >
          {narrative.name}
        </Link>
      ))}
    </div>
  );
}
