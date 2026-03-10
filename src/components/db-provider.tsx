"use client";

/**
 * DbProvider — syncs Zustand store with Supabase (via /api/db/sync).
 *
 * Behaviour:
 *  - When a user logs in  → loads their data from DB → hydrates the store.
 *  - When store changes   → debounces a save to DB (1.5s after last change).
 *  - When user logs out   → resets so next login triggers a fresh load.
 *  - Unauthenticated users stay on localStorage only (no change).
 */

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/prompt-store";

export function DbProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load from DB on login ─────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated" || !session?.user || loaded.current) return;

    fetch("/api/db/sync")
      .then((r) => r.json())
      .then((data) => {
        const { entries, folders, analytics } = data;
        // Only overwrite local data if DB has actual data (avoid wiping on first login)
        if (entries?.length || folders?.length || analytics?.length) {
          useAppStore.setState({
            entries: entries ?? [],
            folders: folders ?? [],
            analyticsData: analytics ?? [],
          });
        }
        // Mark loaded AFTER setState tick so the subscribe handler ignores this initial write
        setTimeout(() => {
          loaded.current = true;
        }, 0);
      })
      .catch((err) => {
        console.error("[DbProvider] Failed to load from DB:", err);
        // Still mark loaded so user changes are saved going forward
        loaded.current = true;
      });
  }, [status, session]);

  // ── Reset on logout ───────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      loaded.current = false;
    }
  }, [status]);

  // ── Debounced save on store changes ───────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const unsubscribe = useAppStore.subscribe((state) => {
      if (!loaded.current) return;

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/db/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entries: state.entries,
            folders: state.folders,
            analytics: state.analyticsData,
          }),
        }).catch((err) => console.error("[DbProvider] Failed to save to DB:", err));
      }, 1500);
    });

    return () => {
      unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [status, session]);

  return <>{children}</>;
}
