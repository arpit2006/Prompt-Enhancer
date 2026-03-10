"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Target, X } from "lucide-react";
import { useAppStore } from "@/store/prompt-store";
import { AI_MODELS } from "@/data/models";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  text: "Text / LLM",
  code: "Code",
  image: "Image Generation",
};

const CATEGORY_ORDER = ["text", "code", "image"];

export function TargetModelSelector() {
  const { targetModelId, setTargetModelId } = useAppStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = AI_MODELS.find((m) => m.id === targetModelId);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    models: AI_MODELS.filter((m) => m.category === cat),
  })).filter((g) => g.models.length > 0);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          selected
            ? "border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10"
            : "border-dashed border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground hover:text-foreground"
        )}
        title="Select target AI model to optimize prompt for"
      >
        <Target className="h-3 w-3 shrink-0" />
        <span className="max-w-[120px] truncate">
          {selected ? `For: ${selected.name}` : "Optimize for…"}
        </span>
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setTargetModelId(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setTargetModelId(""); } }}
            className="ml-0.5 text-muted-foreground hover:text-destructive"
            title="Clear target"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-lg border bg-background shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Optimize prompt for…
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              The AI will tailor enhancements to work best with the selected model.
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {grouped.map(({ cat, models }) => (
              <div key={cat}>
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => { setTargetModelId(model.id); setOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 transition-colors hover:bg-accent",
                      targetModelId === model.id && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-xs font-medium truncate">{model.name}</span>
                        <span className="block text-[10px] text-muted-foreground truncate">
                          {model.provider} · {model.description}
                        </span>
                      </div>
                      {targetModelId === model.id && (
                        <span className="shrink-0 text-[10px] font-semibold text-primary">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* None option */}
          <div className="border-t px-3 py-2">
            <button
              onClick={() => { setTargetModelId(""); setOpen(false); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear / No specific target
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
