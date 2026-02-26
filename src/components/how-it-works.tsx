"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronDown } from "lucide-react";

interface HowItWorksProps {
  steps: string[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left cursor-pointer"
      >
        <BookOpen className="h-4 w-4 text-purple-600 shrink-0" />
        <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">
          How It Works
        </span>
        <ChevronDown
          className={`h-4 w-4 text-purple-400 ml-auto transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <CardContent className="pt-0 pb-4 px-4">
          <ol className="space-y-2 ml-1">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      )}
    </Card>
  );
}
