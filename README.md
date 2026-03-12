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
Supports <b>Gemini</b> • <b>Groq</b> • <b>OpenAI</b> • <b>Ollama</b>
</p>

<p align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![NextJS](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

</p>

---

# 🎬 Demo

<p align="center">
<img src="https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif" width="800"/>
</p>

---

# ✨ Features

### 🧠 Prompt Intelligence

* **Prompt Enhancement** — Analyze and rewrite prompts with clarity + completeness scoring
* **Audience Tuning** — Adjust tone: Technical, Simple, Executive, Creative, Child

### 🤖 Multi-Provider AI Support

* **Gemini**
* **Groq**
* **OpenAI**
* **Ollama (local models)**

### 🔍 Prompt Analysis Tools

* **Diff Viewer** — Word-level side-by-side comparison
* **Test Prompt** — Run prompts directly against LLMs
* **Auto-Tagging** — Prompts automatically tagged by type and tone

### 📚 Prompt Management

* **Prompt History** — Full version history with clarity score tracking
* **Folders** — Organize prompts into color-coded collections
* **Template Library** — Pre-built templates for writing, coding, data analysis, image generation, and more

### 📊 Insights & Analytics

* Model usage breakdown
* Prompt quality averages
* 14-day activity chart

### ☁️ Cloud Features

* **Google & GitHub OAuth authentication**
* **Privacy mode** to skip saving history
* **Cross-device cloud sync via Supabase**

---

# 🧱 Tech Stack

| Layer     | Technology                               |
| --------- | ---------------------------------------- |
| Framework | Next.js 15 (App Router)                  |
| UI        | React 19, Tailwind CSS 3.4, Radix UI     |
| State     | Zustand 5 (localStorage + Supabase sync) |
| Database  | Supabase PostgreSQL via Prisma 5         |
| Auth      | Auth.js v5 (Google + GitHub OAuth)       |
| Language  | TypeScript (strict)                      |
| Icons     | lucide-react                             |

---

# 🚀 Getting Started

## 1. Clone & Install

```bash
git clone https://github.com/your-username/prompt-enhancer.git
cd prompt-enhancer
npm install
```

---

## 2. Set Up Supabase

1. Create a project at
   https://supabase.com

2. Go to

```
Project Settings → Database → Connection Pooling
```

3. Copy the **Transaction Pooler URL (port 6543)**.

> If your password contains special characters like `@`, encode them as `%40`.

---

## 3. Create the Database Table

Run this query in **Supabase SQL Editor**.

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

CREATE UNIQUE INDEX IF NOT EXISTS "UserData_userId_key"
ON "UserData"("userId");
```

---

## 4. Configure Environment Variables

Create `.env.local`

```env
# Auth.js
AUTH_URL=http://localhost:3000
AUTH_SECRET=

# Google OAuth
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# GitHub OAuth
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Supabase
DATABASE_URL=
DIRECT_URL=
```

Generate secret:

```bash
npx auth secret
```

---

## 5. Run the Development Server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# 🔄 How Cloud Sync Works

| State         | Behavior                    |
| ------------- | --------------------------- |
| Not logged in | Data stored locally         |
| Logged in     | Data synced from Supabase   |
| Changes       | Auto-save after 1.5 seconds |
| New device    | Prompts load automatically  |

---

# 🗂 Project Structure

```
src
 ├ app
 │   ├ api
 │   │   ├ analyze
 │   │   ├ analyze-groq
 │   │   ├ analyze-openai
 │   │   ├ analyze-local
 │   │   ├ test-prompt
 │   │   └ db/sync
 │
 │   ├ login
 │   └ profile
 │
 ├ components
 │   ├ editor
 │   ├ analytics
 │   ├ api-request
 │   ├ history
 │   ├ templates
 │   └ layout
 │
 ├ store
 ├ lib
 ├ types
 └ data
```

---

# 🔌 API Routes

| Route                      | Description                       |
| -------------------------- | --------------------------------- |
| POST `/api/analyze`        | Enhance prompt via Gemini         |
| POST `/api/analyze-groq`   | Enhance prompt via Groq           |
| POST `/api/analyze-openai` | Enhance prompt via OpenAI         |
| POST `/api/analyze-local`  | Enhance prompt via Ollama         |
| POST `/api/test-prompt`    | Run raw prompt against active LLM |
| GET `/api/ollama-test`     | Check Ollama connectivity         |
| GET `/api/db/sync`         | Load user data from Supabase      |
| POST `/api/db/sync`        | Save user data to Supabase        |

---

# ⚠️ Known Limitations (v1.0)

PromptCraft **v1.0** is the first public release and is actively being improved.

### Improvements in Progress

* Performance optimization for prompt analysis
* Improved diff viewer rendering
* Better error handling for API providers
* UI responsiveness fixes
* Expanded analytics metrics

These will be addressed in upcoming releases.

💡 Contributions, feedback, and suggestions are welcome.

---

# 🛣 Roadmap

Future improvements planned:

* Prompt benchmarking system
* Prompt sharing marketplace
* Team collaboration
* Browser extension
* VS Code extension

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

# 📜 License

MIT License

---

# ⭐ Support the Project

If you find PromptCraft useful:

⭐ Star the repository
🐛 Report issues
💡 Suggest new features
