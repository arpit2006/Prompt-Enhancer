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
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />

      <main className="flex flex-1 overflow-hidden min-h-0">
        {/* Editor — full width on mobile when panel is hidden */}
        <div className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden border-r dot-grid",
          showPanel ? "hidden md:flex" : "flex"
        )}>
          <PromptEditor />
        </div>

        {/* Right panel — bottom-sheet style on mobile, fixed sidebar on desktop */}
        <aside className={cn(
          "flex-col overflow-hidden bg-card",
          "md:flex md:w-[380px] xl:w-[420px] md:shrink-0",
          showPanel ? "flex flex-1" : "hidden"
        )}>
          <RightPanel />
        </aside>
      </main>

      {/* Mobile bottom tab bar — hidden on desktop */}
      <div className="md:hidden flex shrink-0 border-t bg-background">
        <button
          onClick={() => setShowPanel(false)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium transition-colors",
            !showPanel
              ? "text-primary border-t-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenLine className="h-4 w-4" />
          Editor
        </button>
        <button
          onClick={() => setShowPanel(true)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium transition-colors",
            showPanel
              ? "text-primary border-t-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Results
        </button>
      </div>
    </div>
  );
}
