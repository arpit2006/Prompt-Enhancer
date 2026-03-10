"use client";

import { useState } from "react";
import { Wrench, GitCompare, FlaskConical, Globe, X } from "lucide-react";
import { DiffPanel } from "@/components/editor/diff-panel";
import { TestPanel } from "@/components/editor/test-panel";
import { ApiRequestPanel } from "@/components/api-request/api-request-panel";
import { cn } from "@/lib/utils";

type ToolTab = "compare" | "test" | "api";

const TOOLS = [
  { id: "compare" as const, label: "Diff", icon: GitCompare },
  { id: "test" as const, label: "Test Prompt", icon: FlaskConical },
  { id: "api" as const, label: "API Request", icon: Globe },
];

export function ToolsModal() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ToolTab>("compare");

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Tools — Diff, Test Prompt, API Request"
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
      >
        <Wrench className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Tools</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Dialog */}
          <div className="relative flex flex-col w-full max-w-4xl h-[75vh] rounded-2xl border bg-background shadow-2xl overflow-hidden">
            {/* Dialog header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Tools</span>

              {/* Tab bar */}
              <div className="flex items-center gap-1 ml-4">
                {TOOLS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      active === id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {active === "compare" && <DiffPanel />}
              {active === "test" && <TestPanel />}
              {active === "api" && <ApiRequestPanel />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
