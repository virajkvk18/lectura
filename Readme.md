Action: file_editor create /app/README.md --file-text "# Lumen.ai — AI-Powered Learning Companion for LMS

A full-stack, futuristic learning platform that turns lecture videos into an interactive,
RAG-grounded experience: ask questions mid-lecture, jump to moments, generate summaries,
flashcards, and quizzes — all powered by Gemini 3 Flash.

## ✨ Features

- **Contextual Q&A** with RAG over transcript chunks (term-frequency cosine retrieval, no external vector DB required)
- **Streaming AI responses** via Server-Sent Events (token-by-token typing)
- **Smart summaries** — full lecture, chapter, last 5 minutes, or topic
- **Jump-to-moment** — clickable `[mm:ss]` timestamps that seek the player
- **Flashcards & quizzes** auto-generated from any lecture
- **Notes + bookmarks** pinned to timestamps; PDF export
- **Custom video player** with chapter markers, bookmark dots, speed control, fullscreen
- **Synced transcript** that auto-highlights the current segment (click to seek)
- **Dashboard** with progress tracking, AI insights, and watch history
- **Voice input** via Web Speech API
- **Auth**: JWT + bcrypt, fully self-contained
- **Aurora design system**: Cabinet Grotesk display + Manrope, obsidian black with
  rose/amber/emerald sunset gradient accent

## 🧱 Architecture

```
                    ┌──────────────────────────┐
                    │   React (CRA) frontend   │
                    │  Tailwind + Framer Motion│
                    │  ShadCN UI · Lucide      │
                    └────────────┬─────────────┘
                                 │ /api/* (REACT_APP_BACKEND_URL)
                                 ▼
                    ┌──────────────────────────┐
                    │   FastAPI backend        │
                    │  JWT auth · Motor        │
                    │  emergentintegrations    │
                    │  RAG (in-process TF cos) │
                    └────────────┬─────────────┘
                       ┌─────────┼─────────────┐
                       ▼         ▼             ▼
                 ┌──────────┐ ┌──────────┐ ┌─────────────┐
                 │ MongoDB  │ │ Gemini 3 │ │ SSE stream  │
                 │  (motor) │ │  Flash   │ │  to client  │
                 └──────────┘ └──────────┘ └─────────────┘
```

### RAG pipeline

1. **Ingest** — Each lecture stores `segments[]` with `start`/`end`/`text`.
2. **Chunk** — Segments merged into ~30s windows (`rag.py::chunk_segments`).
3. **Embed (lightweight)** — Token sets via stop-word filtering; term-frequency vectors.
4. **Retrieve** — Cosine similarity between query vector and chunk vectors, with a small
   temporal boost for chunks near the current playback time.
5. **Format** — Top-K chunks formatted as `[mm:ss - mm:ss] text` and injected into the
   system prompt.
6. **Generate** — Gemini 3 Flash via `emergentintegrations.LlmChat`. Streamed back to the
   client as SSE `token` events; citations sent first as a `citations` event.

## 📁 Folder structure

```
/app
├── backend/
│   ├── server.py        # FastAPI app, all /api routes
│   ├── auth.py          # JWT + bcrypt helpers
│   ├── models.py        # Pydantic schemas (User, Lecture, ChatMessage, …)
│   ├── rag.py           # Chunking + retrieval (no external vector DB)
│   ├── seed_data.py     # Three sample lectures with transcripts
│   ├── requirements.txt
│   └── .env             # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, JWT_SECRET
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── lib/
│   │   │   ├── api.js     # axios + SSE streamChat()
│   │   │   ├── auth.jsx   # AuthContext / Provider / useAuth
│   │   │   └── utils.js
│   │   ├── components/
│   │   │   ├── Aurora.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── TranscriptPanel.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── NotesPanel.jsx
│   │   │   ├── SummaryPanel.jsx
│   │   │   ├── FlashcardsPanel.jsx
│   │   │   └── QuizPanel.jsx
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── Dashboard.jsx
│   │       └── VideoLearning.jsx
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔑 Environment variables

### `backend/.env`

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-...
JWT_SECRET=your-long-random-secret
```

### `frontend/.env`

```
REACT_APP_BACKEND_URL=https://<your-host>
```

> All frontend API calls use `${REACT_APP_BACKEND_URL}/api/...`. All backend routes are
> prefixed with `/api` per Kubernetes ingress rules.

## 🚀 Local development

```bash
# Backend
cd backend
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start          # runs on :3000, proxies via REACT_APP_BACKEND_URL
```

The first time the backend boots it auto-seeds three sample lectures.

## 🧪 API surface

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | /api/auth/signup | – | Register, returns JWT |
| POST   | /api/auth/login  | – | Login, returns JWT |
| GET    | /api/auth/me     | ✅ | Current user |
| GET    | /api/lectures    | ✅ | List lecture cards |
| GET    | /api/lectures/{id} | ✅ | Full lecture incl. segments |
| POST   | /api/chat/stream | ✅ | SSE: `citations`, `session`, `token`, `done` |
| GET    | /api/chat/history/{lecture_id} | ✅ | Chat replay |
| POST   | /api/summary | ✅ | Generate summary (full / chapter / last_5 / topic) |
| POST   | /api/flashcards/{lecture_id} | ✅ | Auto-generate 8 flashcards |
| POST   | /api/quiz/{lecture_id}       | ✅ | Auto-generate 5 MCQs |
| POST/GET/DELETE | /api/notes(/{id}) | ✅ | Notes CRUD |
| POST/GET/DELETE | /api/bookmarks(/{id}) | ✅ | Bookmarks CRUD |
| POST/GET | /api/progress    | ✅ | Watch progress |
| GET      | /api/dashboard/stats | ✅ | Stats card data |

## 🎨 Design system

- **Theme**: dark obsidian (`#000` / `#0A0A0A` / `#111`) with sunset aurora accent
  (`rose-500 → amber-500 → emerald-500`).
- **Typography**: `Cabinet Grotesk` for display, `Manrope` for body, `JetBrains Mono` for
  code/UI labels.
- **Surfaces**: glassmorphism (`backdrop-blur-xl`), bento cards, subtle 1px borders
  (`#27272A`).
- **Motion**: Framer Motion entrance animations, staggered lists, shimmer hovers, animated
  aurora orbs in the background.

## 🛠 Troubleshooting

- **Chat returns LLM error**: check `EMERGENT_LLM_KEY` is set in `backend/.env`. The Universal
  Key (`sk-emergent-...`) covers Gemini 3 Flash.
- **Empty lecture list**: seed only runs when `lectures` collection is empty. Drop the
  collection and restart backend.
- **CORS errors**: confirm `CORS_ORIGINS` allows the frontend host.

## 🗺 Roadmap

- Real vector embeddings (Pinecone / pgvector) once user provides a key
- Spaced-repetition scheduling for flashcards
- Real-time collaborative notes (WebSocket)
- Admin panel + analytics
"
Observation: Overwrite successful: /app/README.md