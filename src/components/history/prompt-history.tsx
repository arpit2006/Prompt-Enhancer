"use client";

import { useState } from "react";
import { useAppStore } from "@/store/prompt-store";
import { formatDate, truncate, cn } from "@/lib/utils";
import type { FolderColor } from "@/types";
import {
  History,
  ChevronDown,
  ChevronRight,
  Trash2,
  Tag,
  RotateCcw,
  FolderPlus,
  Folder,
  FolderOpen,
  X,
} from "lucide-react";

// ─── Folder colour map ────────────────────────────────────────────────────────

const FOLDER_RING: Record<FolderColor, string> = {
  violet: "ring-violet-400 border-violet-300 dark:border-violet-700",
  blue: "ring-blue-400 border-blue-300 dark:border-blue-700",
  emerald: "ring-emerald-400 border-emerald-300 dark:border-emerald-700",
  amber: "ring-amber-400 border-amber-300 dark:border-amber-700",
  rose: "ring-rose-400 border-rose-300 dark:border-rose-700",
  slate: "ring-slate-400 border-slate-300 dark:border-slate-700",
};

const FOLDER_DOT: Record<FolderColor, string> = {
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-500",
};

const FOLDER_COLORS: FolderColor[] = ["violet", "blue", "emerald", "amber", "rose", "slate"];

// ─── Component ────────────────────────────────────────────────────────────────

export function PromptHistory() {
  const {
    entries,
    deleteEntry,
    deleteVersion,
    loadVersion,
    activeEntryId,
    folders,
    activeFolderId,
    setActiveFolderId,
    addFolder,
    deleteFolder,
    renameFolder,
    moveEntryToFolder,
  } = useAppStore();

  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState<FolderColor>("violet");
  const [movingEntryId, setMovingEntryId] = useState<string | null>(null);

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName("");
    setShowAddFolder(false);
  };

  // Filter entries by active folder
  const filteredEntries =
    activeFolderId === null
      ? entries
      : activeFolderId === "__none__"
      ? entries.filter((e) => !e.folderId)
      : entries.filter((e) => e.folderId === activeFolderId);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
          <History className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-sm font-semibold">No saved prompts</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Click Save in the editor or apply a suggestion to start building your history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto flex-1 min-h-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {entries.length} saved prompt{entries.length !== 1 ? "s" : ""}
          </h3>
          <button
            onClick={() => setShowAddFolder((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors rounded-md px-1.5 py-0.5 hover:bg-muted/60"
            title="Add folder"
          >
            <FolderPlus className="h-3 w-3" />
            New folder
          </button>
        </div>

        {/* Add folder form */}
        {showAddFolder && (
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1.5">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddFolder();
                if (e.key === "Escape") setShowAddFolder(false);
              }}
              placeholder="Folder name…"
              className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground/50"
            />
            {/* Color swatches */}
            <div className="flex gap-0.5">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewFolderColor(c)}
                  className={cn(
                    "h-3.5 w-3.5 rounded-full transition-all",
                    FOLDER_DOT[c],
                    newFolderColor === c ? "ring-1 ring-offset-1 ring-foreground/50" : "opacity-60 hover:opacity-100"
                  )}
                />
              ))}
            </div>
            <button
              onClick={handleAddFolder}
              disabled={!newFolderName.trim()}
              className="text-[10px] font-medium text-primary disabled:opacity-40"
            >
              Add
            </button>
            <button onClick={() => setShowAddFolder(false)}>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Folder filter chips */}
        {(folders.length > 0 || true) && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveFolderId(null)}
              className={cn(
                "flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-all",
                activeFolderId === null
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              All
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolderId(f.id === activeFolderId ? null : f.id)}
                className={cn(
                  "flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-all group/chip",
                  activeFolderId === f.id
                    ? cn("bg-muted/60 font-medium border", FOLDER_RING[f.color as FolderColor])
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", FOLDER_DOT[f.color as FolderColor])} />
                {f.name}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(f.id);
                  }}
                  className="ml-0.5 opacity-0 group-hover/chip:opacity-60 hover:!opacity-100 cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries list */}
      <div className="flex flex-col gap-2 p-4">
        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FolderOpen className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No prompts in this folder.</p>
          </div>
        )}
        {filteredEntries.map((entry) => {
          const isExpanded = expandedEntries.has(entry.id);
          const isActive = entry.id === activeEntryId;
          const latestVersion = entry.versions[entry.versions.length - 1];
          const entryFolder = entry.folderId
            ? folders.find((f) => f.id === entry.folderId)
            : null;

          return (
            <div key={entry.id} className={cn("rounded-xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md", isActive && "ring-1 ring-primary/30 border-primary/30")}>
              {/* Entry header */}
              <div className={cn("flex items-start gap-2 px-3.5 py-3 group", isActive && "bg-primary/5")}>
                <button
                  onClick={() => toggleEntry(entry.id)}
                  className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium truncate">{entry.title}</p>
                    {entryFolder && (
                      <span className={cn("flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border font-medium", FOLDER_RING[entryFolder.color as FolderColor])}>
                        <span className={cn("h-1 w-1 rounded-full", FOLDER_DOT[entryFolder.color as FolderColor])} />
                        {entryFolder.name}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDate(entry.updatedAt)} ·{" "}
                    {entry.versions.length} version
                    {entry.versions.length !== 1 ? "s" : ""}
                  </p>

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick load latest + move to folder + delete */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {/* Move to folder */}
                  {folders.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMovingEntryId(
                            movingEntryId === entry.id ? null : entry.id
                          )
                        }
                        className="rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Move to folder"
                      >
                        <Folder className="h-3 w-3" />
                      </button>
                      {movingEntryId === entry.id && (
                        <div className="absolute right-0 top-7 z-30 w-36 rounded-lg border bg-popover shadow-lg py-1">
                          <button
                            onClick={() => {
                              moveEntryToFolder(entry.id, null);
                              setMovingEntryId(null);
                            }}
                            className="w-full text-left px-2.5 py-1 text-[11px] hover:bg-muted/60 transition-colors text-muted-foreground"
                          >
                            No folder
                          </button>
                          {folders.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => {
                                moveEntryToFolder(entry.id, f.id);
                                setMovingEntryId(null);
                              }}
                              className={cn(
                                "w-full text-left px-2.5 py-1 text-[11px] hover:bg-muted/60 transition-colors flex items-center gap-1.5",
                                entry.folderId === f.id && "font-medium text-primary"
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", FOLDER_DOT[f.color as FolderColor])} />
                              {f.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => loadVersion(latestVersion, latestVersion.modelId)}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Load latest version"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete prompt"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Expanded versions */}
              {isExpanded && (
                <div className="border-t bg-muted/20 px-3.5 py-3 space-y-2">
                  {[...entry.versions].reverse().map((version, i) => (
                    <div
                      key={version.id}
                      className="group/version flex items-start gap-2 rounded-lg border bg-card p-2.5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                          {formatDate(version.createdAt)}
                          {version.label && (
                            <span className="font-medium text-foreground">· {version.label}</span>
                          )}
                          {i === 0 && (
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                              latest
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] mt-1 text-muted-foreground font-mono leading-relaxed">
                          {truncate(version.content, 80)}
                        </p>
                        {version.analysis && (
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                              Clarity {version.analysis.clarityScore}%
                            </span>
                            <span className="text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded-full">
                              Complete {version.analysis.completenessScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover/version:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => loadVersion(version, version.modelId)}
                          className="rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Load this version"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteVersion(entry.id, version.id)}
                          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete version"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}