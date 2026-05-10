Action: file_editor create /app/memory/PRD.md --file-text "# Lumen.ai — Product Requirements Document

## Original problem statement
Build a full-stack production-ready \"AI-Powered Learning Companion for LMS\". RAG-based
contextual Q&A integrated into a video player, with summaries, jump-to-moment, streaming
responses, session memory, flashcards, quizzes, notes, dashboard, and a futuristic UI.

## Stack chosen
- React (CRA) + Tailwind + Framer Motion + ShadCN UI
- FastAPI (Python) + Motor (MongoDB)
- Gemini 3 Flash via `emergentintegrations` (Universal Key)
- JWT auth + bcrypt
- Lightweight TF-cosine RAG (no external vector DB)

## User personas
1. **Self-learner** — watches MOOC-style lectures, wants summaries and Q&A.
2. **University student** — uses notes, bookmarks, and flashcards for revision.
3. **Bootcamp instructor** — uploads lectures (future), reviews engagement analytics (future).

## Core requirements (static)
- Auth (signup/login/me)
- Lecture library + detail
- Custom video player with chapters & bookmarks
- Synced transcript with click-to-seek
- AI chat with streaming + citations + jump-to-moment
- Summaries (full / chapter / last 5 min / topic)
- Notes & bookmarks CRUD with PDF export
- Flashcards & quizzes (Gemini-generated)
- Progress tracking + dashboard stats
- Voice input

## Implemented (Feb 2026)
✅ All core requirements above.
✅ Three pre-seeded sample lectures (Neural Nets, RAG, Prompt Engineering).
✅ Aurora dark design system; landing page; login/signup; dashboard; video learning page.

## Backlog / next
- P1: Vector embeddings via Pinecone (when user provides key)
- P1: Admin panel (user management, analytics, transcript upload)
- P2: Real-time collaborative notes (WebSocket)
- P2: Spaced repetition for flashcards
- P2: Multi-language transcript support
- P2: Lecture upload + automatic transcription
"
Observation: Create successful: /app/memory/PRD.md