/**
 * Global application state managed with Zustand.
 * Prompt history is persisted to localStorage via the persist middleware.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  PromptEntry,
  PromptVersion,
  PromptSuggestion,
  PromptAnalysis,
  ApiRequestConfig,
  ApiRequestResponse,
  Folder,
  FolderColor,
  AnalyticsEntry,
} from "@/types";
import { uid } from "@/lib/utils";
import { DEFAULT_MODEL_ID } from "@/data/models";

// ─── AI Mode ─────────────────────────────────────────────────────────────────
// "gemini" = Google Gemini (cloud), "groq" = Groq (cloud), "openai" = OpenAI (cloud), "mistral" = Mistral AI (cloud), "local" = Ollama
export type AiMode = "gemini" | "groq" | "openai" | "mistral" | "local";

// ─── API Key State ───────────────────────────────────────────────────────────

interface ApiKeyState {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  mistralApiKey: string;
  setMistralApiKey: (key: string) => void;
  aiMode: AiMode;
  setAiMode: (mode: AiMode) => void;
  // Ollama (local mode) settings
  ollamaModel: string;
  ollamaEndpoint: string;
  setOllamaModel: (m: string) => void;
  setOllamaEndpoint: (e: string) => void;
  // Privacy
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  /** Wipe all persisted data: API keys, history, settings. */
  clearAllData: () => void;
}

// ─── Editor State ─────────────────────────────────────────────────────────────

interface EditorState {
  // Current editor session
  currentPrompt: string;
  selectedModelId: string;
  // Which AI model the user wants to OPTIMIZE their prompt FOR
  targetModelId: string;
  analysis: PromptAnalysis | null;
  suggestions: PromptSuggestion[];
  isAnalyzing: boolean;
  isEnhancing: boolean;
  enhanceError: string | null;

  // Active prompt entry (null = unsaved / new)
  activeEntryId: string | null;

  // Sidebar tab
  rightPanel: "analysis" | "suggestions" | "history" | "templates" | "api-request" | "compare" | "test" | "analytics";

  // Audience tone
  tone: string;
  setTone: (tone: string) => void;

  // Comparison (diff) — stores the pre-enhance prompt
  lastOriginalPrompt: string;
  setLastOriginalPrompt: (prompt: string) => void;

  // Test-Your-Prompt results
  testResult: string | null;
  setTestResult: (result: string | null) => void;
  isTestRunning: boolean;
  setIsTestRunning: (v: boolean) => void;

  // Actions
  setCurrentPrompt: (prompt: string) => void;
  setSelectedModelId: (id: string) => void;
  setTargetModelId: (id: string) => void;
  setAnalysis: (analysis: PromptAnalysis | null) => void;
  setSuggestions: (suggestions: PromptSuggestion[]) => void;
  setIsAnalyzing: (v: boolean) => void;
  setIsEnhancing: (v: boolean) => void;
  setEnhanceError: (err: string | null) => void;
  setRightPanel: (panel: EditorState["rightPanel"]) => void;
  applySuggestion: (suggestion: PromptSuggestion) => void;
  clearSession: () => void;
}

// ─── API Request Tester State ─────────────────────────────────────────────────────

const DEFAULT_API_CONFIG: ApiRequestConfig = {
  endpoint: "",
  method: "POST",
  authMethod: "none",
  authHeaderName: "Authorization",
  authHeaderValue: "",
  basicUsername: "",
  basicPassword: "",
  customHeaders: [],
  bodyTemplate: JSON.stringify({ prompt: "{{prompt}}" }, null, 2),
};

interface ApiRequestState {
  apiRequestConfig: ApiRequestConfig;
  apiRequestResponse: ApiRequestResponse | null;
  apiRequestError: string | null;
  isApiRequesting: boolean;
  setApiRequestConfig: (patch: Partial<ApiRequestConfig>) => void;
  setApiRequestResponse: (r: ApiRequestResponse | null) => void;
  setApiRequestError: (e: string | null) => void;
  setIsApiRequesting: (v: boolean) => void;
}

// ─── Folder State ──────────────────────────────────────────────────

interface FolderState {
  folders: Folder[];
  activeFolderId: string | null;
  addFolder: (name: string, color: FolderColor) => string;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  moveEntryToFolder: (entryId: string, folderId: string | null) => void;
  setActiveFolderId: (id: string | null) => void;
}

// ─── Analytics State ───────────────────────────────────────────────

interface AnalyticsState {
  analyticsData: AnalyticsEntry[];
  trackEnhancement: (aiMode: string, score?: number) => void;
}

// ─── History State ────────────────────────────────────────────────────────────

interface HistoryState {
  entries: PromptEntry[];

  // Actions
  saveVersion: (
    prompt: string,
    modelId: string,
    analysis?: PromptAnalysis
  ) => string; // returns entry id
  addEntry: (title: string, prompt: string, modelId: string) => string;
  updateEntryTitle: (entryId: string, title: string) => void;
  deleteEntry: (entryId: string) => void;
  deleteVersion: (entryId: string, versionId: string) => void;
  labelVersion: (
    entryId: string,
    versionId: string,
    label: string
  ) => void;
  loadVersion: (version: PromptVersion, modelId: string) => void;
  addTag: (entryId: string, tag: string) => void;
  removeTag: (entryId: string, tag: string) => void;
}

// ─── Combined Store ───────────────────────────────────────────────────────────

type AppStore = ApiKeyState & EditorState & HistoryState & ApiRequestState & FolderState & AnalyticsState;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── API Key defaults ─────────────────────────────────────────────────
      geminiApiKey: "",
      setGeminiApiKey: (key) => set({ geminiApiKey: key.trim() }),
      groqApiKey: "",
      setGroqApiKey: (key) => set({ groqApiKey: key.trim() }),
      openaiApiKey: "",
      setOpenaiApiKey: (key) => set({ openaiApiKey: key.trim() }),
      mistralApiKey: "",
      setMistralApiKey: (key) => set({ mistralApiKey: key.trim() }),
      aiMode: "gemini",
      setAiMode: (mode) => set({ aiMode: mode }),
      ollamaModel: "llama3.2",
      ollamaEndpoint: "http://localhost:11434",
      setOllamaModel: (m) => set({ ollamaModel: m.trim() || "llama3.2" }),
      setOllamaEndpoint: (e) => set({ ollamaEndpoint: e.trim() || "http://localhost:11434" }),
      privacyMode: false,
      setPrivacyMode: (v) => set({ privacyMode: v }),
      clearAllData: () => {
        // Remove persisted storage entirely, then reset in-memory state
        try {
          localStorage.removeItem("ai-prompt-enhancer-storage");
        } catch {
          // SSR / unavailable
        }
        set({
          geminiApiKey: "",
          groqApiKey: "",
          openaiApiKey: "",
          mistralApiKey: "",
          aiMode: "gemini",
          ollamaModel: "llama3.2",
          ollamaEndpoint: "http://localhost:11434",
          privacyMode: false,
          currentPrompt: "",
          analysis: null,
          suggestions: [],
          enhanceError: null,
          activeEntryId: null,
          entries: [],
          folders: [],
          activeFolderId: null,
          analyticsData: [],
          lastOriginalPrompt: "",
          testResult: null,
          tone: "Default",
          selectedModelId: DEFAULT_MODEL_ID,
          targetModelId: "",
          apiRequestConfig: DEFAULT_API_CONFIG,
          apiRequestResponse: null,
          apiRequestError: null,
        });
      },

      // ── Editor defaults ──────────────────────────────────────────────────
      currentPrompt: "",
      selectedModelId: DEFAULT_MODEL_ID,
      targetModelId: "",
      analysis: null,
      suggestions: [],
      isAnalyzing: false,
      isEnhancing: false,
      enhanceError: null,
      activeEntryId: null,
      rightPanel: "analysis",

      // ── Editor actions ───────────────────────────────────────────────────
      setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
      setSelectedModelId: (id) => set({ selectedModelId: id, analysis: null, suggestions: [] }),
      setTargetModelId: (id) => set({ targetModelId: id }),
      setAnalysis: (analysis) => set({ analysis }),
      setSuggestions: (suggestions) => set({ suggestions }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),
      setIsEnhancing: (v) => set({ isEnhancing: v }),
      setEnhanceError: (err) => set({ enhanceError: err }),
      setRightPanel: (panel) => set({ rightPanel: panel }),

      tone: "Default",
      setTone: (tone) => set({ tone }),
      lastOriginalPrompt: "",
      setLastOriginalPrompt: (prompt) => set({ lastOriginalPrompt: prompt }),
      testResult: null,
      setTestResult: (result) => set({ testResult: result }),
      isTestRunning: false,
      setIsTestRunning: (v) => set({ isTestRunning: v }),

      applySuggestion: (suggestion) => {
        set({ currentPrompt: suggestion.content });
        // Save as a new version — create an entry if none exists yet
        const { activeEntryId, selectedModelId, analysis, entries } = get();

        const newVersion: PromptVersion = {
          id: uid(),
          content: suggestion.content,
          modelId: selectedModelId,
          createdAt: new Date().toISOString(),
          label: `Applied: ${suggestion.title}`,
          analysis: analysis ?? undefined,
        };

        if (activeEntryId && entries.find((e) => e.id === activeEntryId)) {
          // Append version to existing entry
          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === activeEntryId
                ? {
                    ...e,
                    versions: [...e.versions, newVersion],
                    updatedAt: new Date().toISOString(),
                  }
                : e
            ),
          }));
        } else {
          // No active entry — create one automatically
          const entryId = uid();
          const entry: PromptEntry = {
            id: entryId,
            title: suggestion.content.slice(0, 50) + (suggestion.content.length > 50 ? "…" : ""),
            versions: [newVersion],
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            entries: [entry, ...state.entries],
            activeEntryId: entryId,
          }));
        }
      },

      clearSession: () =>
        set({
          currentPrompt: "",
          analysis: null,
          suggestions: [],
          enhanceError: null,
          activeEntryId: null,
          lastOriginalPrompt: "",
          testResult: null,
        }),

      // ── API Request Tester defaults ──────────────────────────────────────────
      apiRequestConfig: DEFAULT_API_CONFIG,
      apiRequestResponse: null,
      apiRequestError: null,
      isApiRequesting: false,

      // ── API Request Tester actions ──────────────────────────────────────────
      setApiRequestConfig: (patch) =>
        set((state) => ({
          apiRequestConfig: { ...state.apiRequestConfig, ...patch },
        })),
      setApiRequestResponse: (r) => set({ apiRequestResponse: r }),
      setApiRequestError: (e) => set({ apiRequestError: e }),
      setIsApiRequesting: (v) => set({ isApiRequesting: v }),
      // ── Folder defaults ───────────────────────────────────────────────────────────────
      folders: [],
      activeFolderId: null,

      // ── Folder actions ─────────────────────────────────────────────────────────────────
      addFolder: (name, color) => {
        const folderId = uid();
        const folder: Folder = {
          id: folderId,
          name: name.trim() || "New Folder",
          color,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ folders: [...state.folders, folder] }));
        return folderId;
      },

      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          entries: state.entries.map((e) =>
            e.folderId === id ? { ...e, folderId: undefined } : e
          ),
          activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
        })),

      renameFolder: (id, name) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, name: name.trim() || f.name } : f
          ),
        })),

      moveEntryToFolder: (entryId, folderId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? { ...e, folderId: folderId ?? undefined }
              : e
          ),
        })),

      setActiveFolderId: (id) => set({ activeFolderId: id }),

      // ── Analytics defaults ──────────────────────────────────────────────────────────
      analyticsData: [],

      trackEnhancement: (aiMode, score) => {
        const today = new Date().toISOString().slice(0, 10);
        set((state) => {
          const existing = state.analyticsData.find((d) => d.date === today);
          if (existing) {
            return {
              analyticsData: state.analyticsData.map((d) =>
                d.date === today
                  ? {
                      ...d,
                      enhancements: d.enhancements + 1,
                      modelCounts: {
                        ...d.modelCounts,
                        [aiMode]: (d.modelCounts[aiMode] ?? 0) + 1,
                      },
                      totalScore: d.totalScore + (score ?? 0),
                      scoreCount: d.scoreCount + (score != null ? 1 : 0),
                    }
                  : d
              ),
            };
          }
          const newEntry: AnalyticsEntry = {
            date: today,
            enhancements: 1,
            modelCounts: { [aiMode]: 1 },
            totalScore: score ?? 0,
            scoreCount: score != null ? 1 : 0,
          };
          return { analyticsData: [...state.analyticsData, newEntry] };
        });
      },
      // ── History defaults ─────────────────────────────────────────────────
      entries: [],

      // ── History actions ──────────────────────────────────────────────────
      saveVersion: (prompt, modelId, analysis) => {
        const { activeEntryId, entries } = get();

        const newVersion: PromptVersion = {
          id: uid(),
          content: prompt,
          modelId,
          createdAt: new Date().toISOString(),
          analysis,
        };

        if (activeEntryId && entries.find((e) => e.id === activeEntryId)) {
          // Append to existing entry
          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === activeEntryId
                ? {
                    ...e,
                    versions: [...e.versions, newVersion],
                    updatedAt: new Date().toISOString(),
                  }
                : e
            ),
          }));
          return activeEntryId;
        } else {
          // Create a new entry
          const entryId = uid();
          const entry: PromptEntry = {
            id: entryId,
            title: prompt.slice(0, 50) + (prompt.length > 50 ? "…" : ""),
            versions: [newVersion],
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            entries: [entry, ...state.entries],
            activeEntryId: entryId,
          }));
          return entryId;
        }
      },

      addEntry: (title, prompt, modelId) => {
        const entryId = uid();
        const entry: PromptEntry = {
          id: entryId,
          title,
          versions: [
            {
              id: uid(),
              content: prompt,
              modelId,
              createdAt: new Date().toISOString(),
            },
          ],
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          entries: [entry, ...state.entries],
          activeEntryId: entryId,
        }));
        return entryId;
      },

      updateEntryTitle: (entryId, title) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? { ...e, title } : e
          ),
        })),

      deleteEntry: (entryId) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
          activeEntryId:
            state.activeEntryId === entryId ? null : state.activeEntryId,
        })),

      deleteVersion: (entryId, versionId) =>
        set((state) => ({
          entries: state.entries
            .map((e) =>
              e.id === entryId
                ? {
                    ...e,
                    versions: e.versions.filter((v) => v.id !== versionId),
                  }
                : e
            )
            .filter((e) => e.versions.length > 0),
        })),

      labelVersion: (entryId, versionId, label) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  versions: e.versions.map((v) =>
                    v.id === versionId ? { ...v, label } : v
                  ),
                }
              : e
          ),
        })),

      loadVersion: (version, modelId) =>
        set({
          currentPrompt: version.content,
          selectedModelId: modelId || version.modelId,
          analysis: version.analysis ?? null,
          suggestions: [],
          enhanceError: null,
        }),

      addTag: (entryId, tag) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId && !e.tags.includes(tag)
              ? { ...e, tags: [...e.tags, tag] }
              : e
          ),
        })),

      removeTag: (entryId, tag) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? { ...e, tags: e.tags.filter((t) => t !== tag) }
              : e
          ),
        })),
    }),
    {
      name: "ai-prompt-enhancer-storage",
      storage: createJSONStorage(() => localStorage),
      // Persist history, preferences, API key, and custom API config
      partialize: (state) => ({
        entries: state.entries,
        selectedModelId: state.selectedModelId,
        targetModelId: state.targetModelId,
        geminiApiKey: state.geminiApiKey,
        groqApiKey: state.groqApiKey,
        openaiApiKey: state.openaiApiKey,
        mistralApiKey: state.mistralApiKey,
        aiMode: state.aiMode,
        ollamaModel: state.ollamaModel,
        ollamaEndpoint: state.ollamaEndpoint,
        apiRequestConfig: state.apiRequestConfig,
        privacyMode: state.privacyMode,
        folders: state.folders,
        analyticsData: state.analyticsData,
        tone: state.tone,
      }),
    }
  )
);
