"use client";

import { useAppStore } from "@/store/prompt-store";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const TONE_OPTIONS = [
  { value: "Default", label: "Default", description: "No specific tone" },
  { value: "Technical", label: "Technical", description: "Developer / expert audience" },
  { value: "Simple", label: "Simple", description: "Plain language for everyone" },
  { value: "Executive", label: "Executive", description: "Business-level summary" },
  { value: "Creative", label: "Creative", description: "Imaginative and expressive" },
  { value: "Child-friendly", label: "Child", description: "Simple, friendly, joyful" },
] as const;

export type ToneValue = (typeof TONE_OPTIONS)[number]["value"];

export function AudienceTuner() {
  const tone = useAppStore((s) => s.tone);
  const setTone = useAppStore((s) => s.setTone);

  return (
    <div className="flex items-center gap-1.5">
      <Users className="h-3 w-3 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5">
        {TONE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTone(opt.value)}
            title={opt.description}
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-medium transition-all",
              tone === opt.value
                ? "bg-background shadow-sm text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
