"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PromptEditor } from "@/components/editor/prompt-editor";
import { RightPanel } from "@/components/editor/right-panel";

export default function AppPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />

      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r dot-grid">
          <PromptEditor />
        </div>
        <aside className="w-[380px] xl:w-[420px] shrink-0 flex flex-col overflow-hidden bg-card">
          <RightPanel />
        </aside>
      </main>
    </div>
  );
}
