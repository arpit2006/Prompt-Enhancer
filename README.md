# 🚀 PromptCraft

<p align="center">
  <img width="500" alt="PromptCraft Logo" src="https://github.com/user-attachments/assets/40a7b571-f94a-4bd6-84a3-b66611c09c59" />
</p>

<p align="center">
<strong>Analyze • Improve • Optimize your AI prompts</strong>
</p>

<p align="center">
A powerful AI prompt engineering tool that analyzes and rewrites prompts for clarity, tone, and effectiveness.
</p>

<p align="center">
Supports <b>Gemini</b>, <b>Groq</b>, <b>OpenAI</b>, and <b>Ollama</b>.
</p>

---

## Features

- **Prompt Enhancement** — Analyze and rewrite prompts with clarity + completeness scoring
- **Multi-Provider** — Gemini, Groq, OpenAI (cloud) and Ollama (local)
- **Audience Tuning** — Adjust tone: Technical, Simple, Executive, Creative, Child
- **Diff Viewer** — Word-level side-by-side comparison of original vs. enhanced
- **Test Prompt** — Fire your prompt at the active LLM and see the live response
- **Auto-Tagging** — Prompts are automatically tagged by type and tone
- **Prompt History** — Full version history with clarity score tracking per prompt
- **Folders** — Organize prompts into color-coded collections
- **Template Library** — Pre-built templates for writing, coding, data analysis, image generation, and more
- **API Request Panel** — Send custom HTTP requests directly from the app
- **Analytics & Stats** — 14-day activity chart, model usage breakdown, quality averages (Profile page)
- **Auth** — Google & GitHub OAuth via Auth.js v5; privacy mode to skip saving history
- **Cloud Sync** — Prompt history, folders, and analytics synced to Supabase (per user, any device)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 3.4, Radix UI |
| State | Zustand 5 (localStorage + Supabase sync) |
| Database | Supabase (PostgreSQL) via Prisma 5 |
| Auth | Auth.js v5 (Google + GitHub OAuth) |
| Language | TypeScript (strict) |
| Icons | lucide-react |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/prompt-enhancer.git
cd prompt-enhancer
npm install
```

### 2. Set up Supabase (free database)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings  Database  Connection Pooling**
3. Set mode to **Transaction** and copy the connection string (port `6543`)  `DATABASE_URL`

> If your password contains special characters like `@`, encode them as `%40` in the URL.

### 3. Create the database table

Go to **Supabase  SQL Editor  New Query**, paste and run:

```sql
CREATE TABLE IF NOT EXISTS "UserData" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL,
  "entries"   JSONB NOT NULL DEFAULT '[]',
  "folders"   JSONB NOT NULL DEFAULT '[]',
  "analytics" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserData_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserData_userId_key" ON "UserData"("userId");
```

### 4. Configure environment variables

Create a `.env.local` file in the project root (see `.env.example` for reference):

```env
# Auth.js
AUTH_URL=http://localhost:3000
AUTH_SECRET=          # generate: npx auth secret

# Google OAuth
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# GitHub OAuth
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Supabase — use Transaction pooler URL (port 6543)
# Encode special chars in password: @ becomes %40
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How Cloud Sync Works

- **Not logged in** — data stays in localStorage only
- **Logged in** — on login, data loads from Supabase and hydrates the app
- **Any change** — debounced auto-save to Supabase after 1.5s
- **Any device** — log in from another browser and your prompts load automatically

---

## Project Structure

```
src/
 app/
    api/
       analyze/          # Gemini enhancement
       analyze-groq/     # Groq enhancement
       analyze-openai/   # OpenAI enhancement
       analyze-local/    # Ollama (local) enhancement
       test-prompt/      # Raw prompt test
       db/sync/          # Supabase sync (GET + POST)
    login/                # Sign-in page
    profile/              # User profile, stats and tools
 components/
    editor/               # Prompt editor, diff, test, analysis panels
    analytics/            # Analytics dashboard
    api-request/          # API request panel
    auth/                 # API key modals
    history/              # Prompt history with folders
    layout/               # Navbar
    templates/            # Template library
    db-provider.tsx       # Auto-sync to Supabase
 lib/
    prisma.ts             # Prisma client singleton
 store/                    # Zustand store
 types/                    # TypeScript interfaces
 data/                     # AI model list, templates
 prisma/
     schema.prisma         # Database schema
```

---

## API Routes

| Route | Description |
|---|---|
| `POST /api/analyze` | Enhance prompt via Gemini |
| `POST /api/analyze-groq` | Enhance prompt via Groq |
| `POST /api/analyze-openai` | Enhance prompt via OpenAI |
| `POST /api/analyze-local` | Enhance prompt via Ollama |
| `POST /api/test-prompt` | Run raw prompt against active LLM |
| `GET /api/ollama-test` | Check Ollama connectivity |
| `GET /api/db/sync` | Load user data from Supabase |
| `POST /api/db/sync` | Save user data to Supabase |

---

## License

MIT
