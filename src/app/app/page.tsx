"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PromptEditor } from "@/components/editor/prompt-editor";
import { RightPanel } from "@/components/editor/right-panel";
import { PenLine, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppPage() {
  const [hydrated, setHydrated] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background relative">
      {/* Ambient background glows — subtle depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] dark:bg-violet-500/[0.07] blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-sky-500/[0.025] dark:bg-sky-500/[0.04] blur-3xl" />
      </div>

      <Navbar />

      <main className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Editor — full width on mobile when panel is hidden */}
        <div className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden dot-grid",
          showPanel ? "hidden md:flex" : "flex"
        )}>
          <PromptEditor />
        </div>

        {/* Gradient panel divider */}
        <div className="hidden md:block w-px shrink-0 bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Right panel */}
        <aside className={cn(
          "flex-col overflow-hidden bg-card/80 backdrop-blur-sm",
          "md:flex md:w-[380px] xl:w-[420px] md:shrink-0",
          showPanel ? "flex flex-1" : "hidden"
        )}>
          <RightPanel />
        </aside>
      </main>

      {/* Mobile bottom tab bar — segmented pill control */}
      <div className="md:hidden shrink-0 border-t bg-background/90 backdrop-blur-xl px-3 py-2.5">
        <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
          <button
            onClick={() => setShowPanel(false)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200",
              !showPanel
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PenLine className="h-3.5 w-3.5" />
            Editor
          </button>
          <button
            onClick={() => setShowPanel(true)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200",
              showPanel
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Results
          </button>
        </div>
      </div>
    </div>
  );
}
