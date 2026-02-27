"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PILLS = [
  { href: "/growth-ops", label: "Today" },
  { href: "/growth-ops/assets", label: "Assets" },
  { href: "/growth-ops/publish", label: "Publish" },
  { href: "/growth-ops/distribute", label: "Distribute" },
  { href: "/growth-ops/report", label: "Report" },
  { href: "/growth-ops/calendar", label: "Calendar", secondary: true },
];

export default function GrowthOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/growth-ops") return pathname === "/growth-ops";
    return pathname.startsWith(href);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">Growth Ops</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Execute the daily loop. Create, publish, distribute, report.
        </p>
      </div>

      {/* Pill navigation */}
      <nav className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto">
        {PILLS.map((pill) => (
          <Link
            key={pill.href}
            href={pill.href}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap -mb-px border-b-2",
              isActive(pill.href)
                ? "border-purple-600 text-purple-700 dark:text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              pill.secondary && !isActive(pill.href) && "text-muted-foreground/60 text-xs"
            )}
          >
            {pill.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
