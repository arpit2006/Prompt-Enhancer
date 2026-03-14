# PromptCraft — End-to-End Architecture

A detailed walkthrough of how every part of this Next.js application works together, from the moment a user opens the browser to AI-enhanced prompts being saved to the database.

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Route Protection (Middleware)](#3-route-protection-middleware)
4. [App Layout & State Management](#4-app-layout--state-management)
5. [The Editor — Writing a Prompt](#5-the-editor--writing-a-prompt)
6. [AI Enhancement Flow](#6-ai-enhancement-flow)
7. [AI Provider Routing](#7-ai-provider-routing)
8. [Prompt Enhancement Engine](#8-prompt-enhancement-engine)
9. [AI Analysis & 11-Category Rubric](#9-ai-analysis--11-category-rubric)
10. [Security Layer](#10-security-layer)
11. [Free-Tier Rate Limiting](#11-free-tier-rate-limiting)
12. [Database Sync (Supabase)](#12-database-sync-supabase)
13. [Prompt History & Folders](#13-prompt-history--folders)
14. [Right Panel — Analysis, Suggestions, Compare](#14-right-panel--analysis-suggestions-compare)
15. [Templates & Tools](#15-templates--tools)
16. [Analytics](#16-analytics)
17. [Newsletter](#17-newsletter)
18. [Profile & Account Management](#18-profile--account-management)
19. [Environment Variables Reference](#19-environment-variables-reference)
20. [Data Flow Diagram](#20-data-flow-diagram)

---

## 1. Tech Stack Overview

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + `tailwindcss-animate` |
| Auth | Auth.js v5 (NextAuth) — JWT strategy |
| State | Zustand with `persist` middleware (localStorage) |
| Database | PostgreSQL via Supabase, accessed through Prisma ORM |
| AI — Cloud | Google Gemini 2.0 Flash, Groq (LLaMA 3.3 70B), OpenAI GPT-4o, Mistral AI |
| AI — Local | Ollama (any locally running model) |
| Deployment | Vercel (assumed) |

---

## 2. Authentication Flow

**File:** `src/auth.ts`, `src/app/login/`

### Providers
- **Google OAuth** — via `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- **GitHub OAuth** — via `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- **Dev Credentials** — only active in `NODE_ENV === "development"` when `DEV_TEST_PASSWORD` is set; never compiled into production

### Strategy
Auth.js v5 uses a **JWT session strategy** — no separate `Session` table is needed in the database. The JWT is signed with `AUTH_SECRET` and stored in a secure HttpOnly cookie.

### Session Hydration
```
User clicks "Sign in with Google / GitHub"
  → Next.js routes to /api/auth/[...nextauth]
  → Auth.js handles the OAuth redirect flow
  → On success: JWT cookie set, session available via useSession() / auth()
  → User redirected to /app (or callbackUrl if they were redirected to /login)
```

The JWT `callbacks` in `auth.ts` attach the user's `id` to the token so it's accessible in server-side `auth()` calls:
```ts
jwt({ token, user }) {
  if (user) token.id = user.id;
  return token;
}
```

### Sign-out
Both server action (`src/app/login/sign-out-action.ts`) and the profile page client call `signOut({ redirectTo: "/login" })`, which clears the JWT cookie and lands the user back at the login page.

---

## 3. Route Protection (Middleware)

**File:** `src/middleware.ts`

Next.js Edge Middleware runs on every request **before** it reaches any route handler or page. The middleware reads the JWT cookie via `auth()`:

```
Request arrives
  → auth() checks JWT cookie
  → If authenticated → pass through (NextResponse.next())
  → If unauthenticated → redirect to /login?callbackUrl=<original path>
```

**Public paths** (exempt from protection):
- `/` — landing page
- `/login` — auth page
- `/api/auth/**` — NextAuth endpoints
- `/api/newsletter` — public subscribe endpoint
- `/api/ollama-test` — local model connectivity test
- `/_next/**`, `/favicon.ico` — static assets

Everything else — including `/app`, `/profile`, and all `/api/*` routes — requires a valid session.

---

## 4. App Layout & State Management

**Files:** `src/app/app/page.tsx`, `src/store/prompt-store.ts`, `src/components/db-provider.tsx`

### Layout
```
/app page
├── <Navbar />             — sticky top bar: provider switcher, API keys, user avatar
├── <main>
│   ├── <PromptEditor />   — left pane, flex-1 (full width on mobile)
│   └── <RightPanel />     — right sidebar 380–420px (tabs: Analysis / Suggest / Compare / History / Templates)
└── Mobile tab bar         — segmented pill: "Editor" | "Results" (hidden on desktop)
```

### Zustand Store (`prompt-store.ts`)
All UI state lives in a single Zustand store, **persisted to localStorage** via the `persist` middleware. Key slices:

| Slice | What it holds |
|---|---|
| **Editor** | `currentPrompt`, `analysis`, `suggestions`, `isEnhancing`, `isAnalyzing`, `tone`, `targetModelId` |
| **History** | `entries[]` — saved `PromptEntry` objects with versions, tags, scores |
| **Folders** | `folders[]` — user-created folders linked to history entries |
| **API Keys** | `geminiApiKey`, `groqApiKey`, `openaiApiKey`, `mistralApiKey` (stored locally) |
| **Settings** | `aiMode`, `ollamaModel`, `ollamaEndpoint`, `privacyMode`, `rightPanel` |
| **Analytics** | `analyticsData[]` — per-enhancement tracking records |

API keys are stored in `localStorage` only — they are **never sent to or stored on the server** unless the user explicitly passes them per-request via headers.

---

## 5. The Editor — Writing a Prompt

**File:** `src/components/editor/prompt-editor.tsx`

### Auto-resize Textarea
A `useRef` on the `<textarea>` triggers a `useEffect` whenever `currentPrompt` changes, setting `height: auto` then `height: scrollHeight` for seamless vertical growth.

### Real-time PII Detection
`src/lib/security.ts` exports `detectPII()`, which runs on every keystroke via `useMemo`. It scans for:
- Email addresses, phone numbers, credit/debit card numbers
- US Social Security Numbers, passport numbers
- IPv4 addresses, API keys / secret tokens (AWS-style, `sk-`, `AIza`)

If PII is detected, a dismissible warning banner appears above the editor. This check happens **entirely client-side** — no data is sent to the server just for the warning.

### Debounced Auto-Analysis
1500ms after the user stops typing (and the prompt is ≥ 10 characters), an auto-analysis request fires silently to the analysis API route. On success the right panel switches to the Analysis tab. Errors (including 429s) are swallowed silently — they don't block the UI.

### Token Counter
`estimateTokens()` in `src/lib/utils.ts` provides a rough `chars / 4` token estimate. The progress bar at the bottom fills toward the 8,192-token limit, turning amber at 75% and red when exceeded.

### Audience Tuner (`src/components/editor/audience-tuner.tsx`)
A row of tone/audience presets (Default, Formal, Casual, Technical, Creative, Concise) that sets the `tone` field in the Zustand store. This is forwarded to every enhance request.

---

## 6. AI Enhancement Flow

When the user clicks **✦ Enhance**:

```
handleEnhance() in prompt-editor.tsx
  1. Save original prompt to store (for diff view later)
  2. Set isEnhancing = true; clear any previous error
  3. Build headers: { Content-Type, x-<provider>-api-key? }
  4. POST to /api/enhance-<provider> (e.g. /api/enhance-groq)
     Body: { prompt, tone?, targetModelId?, context? }
  5. Server-side:
     a. auth() — verify JWT → 401 if missing
     b. API key resolution: caller key from header OR platform env key
     c. checkFreeUsage() — 429 if daily limit exceeded (free tier only)
     d. sanitiseInput() — strip dangerous HTML/script content
     e. enforceContentLength() — reject if > 32,000 chars
     f. Call AI provider library → returns EnhanceResponse
  6. Client receives { suggestions[], analysis? }
  7. Store updates: setSuggestions(), setAnalysis(), setRightPanel("suggestions")
  8. Success animation: button turns green "Enhanced!" for 1.8s
  9. Toast notification slides up: "✦ Prompt enhanced! N suggestions ready · Score: X/100"
 10. If !privacyMode: saveVersion() → history; fetch /api/db/log-prompt
 11. trackEnhancement() → analyticsData[]
 12. Auto-tag the saved entry based on promptType / tone / top issue
```

---

## 7. AI Provider Routing

**Files:** `src/app/api/enhance-*/route.ts`, `src/app/api/analyze-*/route.ts`

The navbar's provider switcher sets `aiMode` in the Zustand store. The editor uses this to select the API route:

| `aiMode` | Enhance Route | Analyze Route | Library |
|---|---|---|---|
| `gemini` | `/api/enhance` | `/api/analyze` | `src/lib/gemini.ts` |
| `groq` | `/api/enhance-groq` | `/api/analyze-groq` | `src/lib/groq.ts` |
| `openai` | `/api/enhance-openai` | `/api/analyze-openai` | `src/lib/openai.ts` |
| `mistral` | `/api/enhance-mistral` | `/api/analyze-mistral` | `src/lib/mistral.ts` |
| `local` | `/api/enhance-local` | `/api/analyze-local` | `src/lib/ollama.ts` |

### API Key Resolution
Each route checks for a caller-supplied key in the request header first (`x-gemini-api-key`, `x-groq-api-key`, etc.). If absent, it falls back to the platform's server-side environment variable. If neither exists, it returns `400`.

### Ollama (Local Mode)
The local routes forward `x-ollama-model` and `x-ollama-endpoint` headers to `src/lib/ollama.ts`, which talks to the locally running Ollama server (default: `http://localhost:11434`). The `/api/ollama-test` endpoint is publicly accessible (no auth) so the settings modal can test connectivity before the user logs in.

---

## 8. Prompt Enhancement Engine

**File:** `src/lib/prompt-enhancement.ts`

All five AI providers share a single source-of-truth for instructions:

### `SHARED_ENHANCE_SYSTEM_PROMPT`
Instructs the AI to:
- Return structured JSON: `{ suggestions: [...], analysis: {...} }`
- Produce **3 rewrites** at different improvement levels (light / focused / comprehensive)
- **Never** return a materially identical prompt
- For specification / template prompts: produce **350+ words**, expand every named page/section, add deliverables and technical constraints
- Respect the requested tone (formal, casual, technical, creative, concise)

### `buildEnhanceUserMessage(prompt, tone?, targetModelId?)`
Analyses the raw prompt and appends contextual hints to the system instructions:
- `hasPlaceholders` (`{{…}}`, `[VARIABLE]`) → adds **TEMPLATE EXPANSION REQUIRED** hint
- `isWebOrUiBrief` (keywords: website, landing page, app, dashboard) → adds **WEB/UI SPEC EXPANSION** hint
- `hasPagesList` (keywords: homepage, about page, contact page, etc.) → adds **PAGE/SECTION EXPANSION** hint
- `hasDeliverables` (keywords: deliverables, requirements, features) → adds **DELIVERABLES EXPANSION** hint

This prevents the AI from lightly rewording and returning a prompt that is essentially the same as the input.

### `SHARED_ANALYZE_SYSTEM_PROMPT` + `buildAnalyzeUserMessage()`
Used by analysis-only requests (auto-analysis on keystroke debounce).

### `normalizeEnhanceResponse()` / `normalizePromptAnalysis()`
Parse and validate the AI's JSON output, filling in defaults if the model returns a partial or malformed response.

---

## 9. AI Analysis & 11-Category Rubric

**Files:** `src/lib/prompt-enhancement.ts`, `src/types/index.ts`, `src/components/editor/analysis-panel.tsx`

Every enhance response includes a `PromptAnalysis` object scored against **11 professional categories**:

| # | Category ID | What is measured |
|---|---|---|
| 1 | `role-clarity` | Is there a clear persona/role for the AI? |
| 2 | `objective-clarity` | Is the end goal unambiguous? |
| 3 | `context-completeness` | Is enough background provided? |
| 4 | `task-breakdown` | Are sub-tasks clearly enumerated? |
| 5 | `technical-constraints` | Are tech stack/environment constraints stated? |
| 6 | `design-requirements` | Are visual/UX requirements specified? |
| 7 | `accessibility-considerations` | Are a11y requirements mentioned? |
| 8 | `seo-considerations` | Are SEO requirements included? |
| 9 | `performance-constraints` | Are performance budgets or targets stated? |
| 10 | `output-format-clarity` | Is the desired output format specified? |
| 11 | `reusability-template-support` | Is the prompt reusable / parameterized? |

Each category gets a 0–10 score plus a one-sentence rationale. An `overallScore` (0–100) is computed as a weighted average. The Analysis panel also surfaces `strengths[]`, `weaknesses[]`, and `suggestedImprovements[]`.

---

## 10. Security Layer

**File:** `src/lib/security.ts`

Applied on **every API route** that accepts user content:

| Function | Purpose |
|---|---|
| `sanitiseInput(text)` | Strips `<script>`, `javascript:`, HTML tags to prevent XSS via prompt reflection |
| `enforceContentLength(text)` | Rejects prompts > 32,000 characters (returns `413`) |
| `sanitiseClientError(err)` | Converts internal errors to safe, non-leaking client messages |
| `detectPII(text)` | Client-side only — warns user before submission |

All API routes check `auth()` first and return `401` before touching any business logic.

---

## 11. Free-Tier Rate Limiting

**File:** `src/lib/usage-limit.ts`

- **Limit:** 20 prompts per user per UTC day (when using PromptCraft's own API keys)
- **Counted by:** rows in the `PromptLog` table with `createdAt >= startOfUTCDay`
- **Bypassed by:** providing your own API key in the app settings (key passed in request header; server never gatekeeps it)
- **UI:** `FreeTierBadge` component calls `GET /api/usage` to show remaining prompts
- **Response on exceed:** `429` with `{ error: "...", retryAfter: 86400 }`

---

## 12. Database Sync (Supabase)

**Files:** `src/components/db-provider.tsx`, `src/app/api/db/sync/route.ts`, `prisma/schema.prisma`

### Database Models

**`UserData`** — One row per user. Stores the entire prompt history, folders, and analytics as JSON blobs:
```
userId (unique) | entries (JSON[]) | folders (JSON[]) | analytics (JSON[]) | updatedAt
```

**`PromptLog`** — One row per enhancement. Human-readable log for Supabase Table Editor / analytics:
```
userId | originalPrompt | enhancedPrompt | clarityScore | promptType | tone | aiMode | createdAt
```

**`NewsletterSubscriber`** — Email list:
```
email (unique) | name | subscribedAt | isActive | source
```

### Sync Lifecycle (`DbProvider`)

`DbProvider` is a client component wrapping the entire app (mounted in `src/components/providers.tsx`). It watches `useSession()` status:

```
User logs in (status: "authenticated")
  → GET /api/db/sync
  → If DB has data → hydrate Zustand store (overwrite localStorage)
  → If DB empty   → keep localStorage data (first login)
  → loaded.current = true

Store changes (any field in entries/folders/analytics)
  → Debounce 1500ms
  → POST /api/db/sync  { entries, folders, analytics }
  → Upsert into UserData (create or update)

User logs out
  → loaded.current = false (next login triggers fresh load)
```

This means the database is the **source of truth** for returning users, while localStorage serves as the real-time write buffer.

---

## 13. Prompt History & Folders

**Store:** `prompt-store.ts` | **UI:** `src/components/history/prompt-history.tsx`

Each saved prompt is a `PromptEntry`:
```ts
{
  id, title, createdAt, updatedAt,
  versions: PromptVersion[],  // each enhance creates a new version
  tags: string[],
  folderId?: string,
  targetModelId?: string,
  analysis?: PromptAnalysis
}
```

### Auto-save on Enhance
When enhancement completes and `privacyMode` is off, `saveVersion()` is called. It creates a new `PromptEntry` (or appends a version to an existing one) and stores it in Zustand → persisted to localStorage → synced to Supabase within 1.5s.

### Auto-tagging
After saving, the store automatically applies tags based on:
- `promptType` from analysis (e.g. "coding", "creative", "technical")
- The active tone (e.g. "formal", "concise")
- The highest-severity issue (e.g. "ambiguous", "needs-context")

### Privacy Mode
When `privacyMode` is true, nothing is saved to history, no `PromptLog` row is created, and no sync to Supabase happens. The green shield icon in the navbar indicates active privacy mode.

---

## 14. Right Panel — Analysis, Suggestions, Compare

**File:** `src/components/editor/right-panel.tsx`

Five tabs, each rendered lazily (only when active):

| Tab | Component | Content |
|---|---|---|
| **Analysis** | `analysis-panel.tsx` | Overall score (0–100), 11-category table with rationale, strengths, weaknesses, suggested improvements |
| **Suggest** | `suggestion-panel.tsx` | 3 rewrite suggestions (light / focused / comprehensive), click to apply, copy button |
| **Compare** | `compare-panel.tsx` | Side-by-side diff of original vs. enhanced prompt, score deltas |
| **History** | `prompt-history.tsx` | Saved entries with search, tags, folders, version timeline |
| **Templates** | `template-library.tsx` | Pre-built prompt templates by category, click to load into editor |

The active tab is stored in `rightPanel` in the Zustand store so it persists across page refreshes.

---

## 15. Templates & Tools

**File:** `src/data/templates.ts`, `src/components/templates/template-library.tsx`, `src/components/tools/tools-modal.tsx`

Templates are statically defined TypeScript objects categorised by domain (coding, writing, marketing, etc.). Clicking a template loads it directly into the editor's `currentPrompt`.

The Tools modal (`tools-modal.tsx`) provides quick shortcuts and prompt engineering tips accessible from the navbar.

---

## 16. Analytics

**Store slice:** `analyticsData[]` in `prompt-store.ts`  
**UI:** `src/components/analytics/analytics-panel.tsx`

Each call to `trackEnhancement(aiMode, clarityScore)` appends an `AnalyticsEntry` to the store:
```ts
{ timestamp, aiMode, clarityScore?, promptLength }
```
The analytics panel renders charts/stats over this data. It is synced to Supabase as part of the normal `UserData` JSON blob.

---

## 17. Newsletter

**Route:** `src/app/api/newsletter/route.ts`  
**UI:** `src/components/newsletter/newsletter-modal.tsx`

The `/api/newsletter` endpoint is **publicly accessible** (excluded from auth middleware). It writes a row to the `NewsletterSubscriber` table. The modal can be triggered from the navbar bell icon and from the profile page.

---

## 18. Profile & Account Management

**Files:** `src/app/profile/`, `src/app/api/db/delete-account/route.ts`

The profile page (`/profile`) is a server-rendered page with a client component (`profile-client.tsx`) that shows:
- Avatar, name, email from the OAuth session
- Usage statistics (prompts enhanced, total sessions)
- Option to export data
- **Delete account** — calls `DELETE /api/db/delete-account`, which removes all `UserData` and `PromptLog` rows for the user, then signs them out

---

## 19. Environment Variables Reference

| Variable | Required | Purpose |
|---|---|---|
| `AUTH_SECRET` | **Yes** | Signs/verifies JWT session tokens |
| `AUTH_GOOGLE_ID` | For Google login | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | For Google login | Google OAuth client secret |
| `AUTH_GITHUB_ID` | For GitHub login | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | For GitHub login | GitHub OAuth App client secret |
| `AUTH_URL` | Production | Canonical app URL for OAuth redirects |
| `AUTH_TRUST_HOST` | Dev/proxy | Set to `true` when running behind a reverse proxy |
| `DATABASE_URL` | **Yes** | Supabase PostgreSQL connection string (pooled) |
| `DIRECT_URL` | **Yes** | Supabase direct URL (used by Prisma migrations) |
| `GOOGLE_GEMINI_API_KEY` | Optional | Platform-level Gemini key for free-tier users |
| `GROQ_API_KEY` | Optional | Platform-level Groq key for free-tier users |
| `OPENAI_API_KEY` | Optional | Platform-level OpenAI key for free-tier users |
| `MISTRAL_API_KEY` | Optional | Platform-level Mistral key for free-tier users |
| `DEV_TEST_PASSWORD` | Dev only | Enables a dev Credentials login provider |

---

## 20. Data Flow Diagram

```
Browser
│
├─ /  (landing page — public, no auth)
│
├─ /login
│   └─ Sign in via Google / GitHub OAuth
│       └─ Auth.js issues JWT cookie
│
└─ /app  (protected by middleware)
    │
    ├─ Navbar
    │   ├─ AI Provider Switcher (stores aiMode in Zustand → localStorage)
    │   └─ API Key Modals (stores keys in Zustand → localStorage)
    │
    ├─ DbProvider (useSession → GET /api/db/sync → hydrate Zustand)
    │
    ├─ PromptEditor
    │   ├─ onChange → Zustand currentPrompt
    │   ├─ PII scan (client-side, useMemo)
    │   ├─ Auto-analyze (debounce 1500ms → POST /api/analyze-<provider>)
    │   │       └─ auth() → sanitise → AI call → PromptAnalysis → Zustand
    │   │
    │   └─ Enhance button
    │           POST /api/enhance-<provider>
    │             ├─ auth()                   — 401 if missing
    │             ├─ Key resolution            — caller header or env var
    │             ├─ checkFreeUsage()          — 429 if >20/day (no personal key)
    │             ├─ sanitiseInput()           — strip XSS
    │             ├─ enforceContentLength()    — 413 if >32k chars
    │             └─ AI Library (gemini/groq/openai/mistral/ollama)
    │                   └─ prompt-enhancement.ts (shared system prompts + hints)
    │                         └─ EnhanceResponse { suggestions[], analysis }
    │
    │             Client receives response:
    │             ├─ Zustand: setSuggestions, setAnalysis, setRightPanel
    │             ├─ Success animation (toast + button)
    │             ├─ saveVersion() → history entry in Zustand
    │             ├─ POST /api/db/log-prompt  → PromptLog row in Supabase
    │             └─ DbProvider debounce → POST /api/db/sync → UserData upsert
    │
    └─ RightPanel
        ├─ Analysis tab  → 11-category rubric scores + strengths/weaknesses
        ├─ Suggest tab   → 3 rewrite options, click to apply
        ├─ Compare tab   → diff view original vs enhanced
        ├─ History tab   → saved entries, tags, folders, versions
        └─ Templates tab → pre-built templates, click to load
```
