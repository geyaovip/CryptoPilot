"use client";

import Link from "next/link";

const tabs = [
  { id: "hottest", label: "最热" },
  { id: "rising", label: "上升最快" },
  { id: "discussed", label: "讨论最多" }
] as const;

export function NarrativeSortTabs({ active }: { active: "hottest" | "rising" | "discussed" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          className={`rounded-full px-3 py-1 text-sm ${
            active === tab.id ? "bg-[#102A2C] text-white" : "bg-[#F7F5EE] text-[#5F6868]"
          }`}
          href={`/narratives?sort=${tab.id}`}
          key={tab.id}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
