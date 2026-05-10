"""
Lectura - AI-Powered Learning Companion
FastAPI backend with JWT auth, MongoDB, RAG pipeline, SSE streaming
"""
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from auth import create_token, get_current_user_id, hash_password, verify_password
from models import (
    Bookmark, BookmarkCreate, ChatMessage, ChatRequest, Citation,
    Flashcard, Lecture, LectureCard, Note, NoteCreate, Progress,
    ProgressUpdate, QuizQuestion, SummaryRequest, SummaryResponse,
    TokenOut, UserLogin, UserPublic, UserSignup,
)
from rag import format_context, retrieve
from seed_data import seed_lectures

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# --- Database -----------------------------------------------------------------
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "lectura_db")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
GEMINI_MODEL = ("gemini", "gemini-2.0-flash")

# --- App & router -------------------------------------------------------------
app = FastAPI(title="Lectura - AI Learning Companion", version="1.0.0")
api = APIRouter(prefix="/api")


# --- Helpers ------------------------------------------------------------------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _get_lecture(lecture_id: str) -> Lecture:
    doc = await db.lectures.find_one({"id": lecture_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return Lecture(**doc)


def _make_chat(session_id: str, system_message: str):
    """Create LlmChat instance bound to Gemini Flash."""
    from emergentintegrations.llm.chat import LlmChat
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model(*GEMINI_MODEL)


def _safe_json(raw) -> dict:
    """Extract JSON object from a model response that may include markdown fences."""
    if not isinstance(raw, str):
        raw = str(raw)
    txt = raw.strip()
    if txt.startswith("```"):
        lines = txt.split("\n")
        txt = "\n".join(lines[1:])
        if txt.endswith("```"):
            txt = txt[:-3].strip()
    a = txt.find("{")
    b = txt.rfind("}")
    if a >= 0 and b > a:
        txt = txt[a:b + 1]
    try:
        return json.loads(txt)
    except Exception:
        return {}


# --- Health -------------------------------------------------------------------
@api.get("/")
async def root():
    return {"service": "lectura-ai-companion", "ok": True, "version": "1.0.0"}


@api.get("/health")
async def health():
    try:
        await db.command("ping")
        db_ok = True
    except Exception:
        db_ok = False
    return {"ok": True, "db": db_ok}


# --- Auth ---------------------------------------------------------------------
@api.post("/auth/signup", response_model=TokenOut)
async def signup(body: UserSignup):
    if await db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "created_at": _now_iso(),
    }
    await db.users.insert_one(doc)
    user = UserPublic(id=user_id, name=doc["name"], email=doc["email"], created_at=doc["created_at"])
    return TokenOut(access_token=create_token(user_id), user=user)


@api.post("/auth/login", response_model=TokenOut)
async def login(body: UserLogin):
    doc = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not doc or not verify_password(body.password, doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = UserPublic(id=doc["id"], name=doc["name"], email=doc["email"], created_at=doc["created_at"])
    return TokenOut(access_token=create_token(doc["id"]), user=user)


@api.get("/auth/me", response_model=UserPublic)
async def me(user_id: str = Depends(get_current_user_id)):
    doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic(**doc)


# --- Lectures -----------------------------------------------------------------
@api.get("/lectures", response_model=List[LectureCard])
async def list_lectures(_: str = Depends(get_current_user_id)):
    docs = await db.lectures.find({}, {"_id": 0, "segments": 0}).to_list(100)
    return [LectureCard(**d) for d in docs]


@api.get("/lectures/{lecture_id}", response_model=Lecture)
async def get_lecture(lecture_id: str, _: str = Depends(get_current_user_id)):
    return await _get_lecture(lecture_id)


# --- Chat (RAG + streaming SSE) -----------------------------------------------
@api.post("/chat/stream")
async def chat_stream(body: ChatRequest, user_id: str = Depends(get_current_user_id)):
    """Server-Sent Events stream of the AI response with RAG citations."""
    lecture = await _get_lecture(body.lecture_id)
    session_id = body.session_id or str(uuid.uuid4())

    top = retrieve(body.message, lecture.segments, current_time=body.current_time, top_k=5)
    context_block = format_context(top)
    citations = [Citation(start=ch.start, end=ch.end, text=ch.text[:160]) for ch, _ in top]

    user_msg = ChatMessage(
        session_id=session_id,
        lecture_id=body.lecture_id,
        user_id=user_id,
        role="user",
        content=body.message,
    )
    await db.chat_messages.insert_one(user_msg.model_dump())

    cur_min = int(body.current_time) // 60
    cur_sec = int(body.current_time) % 60
    system_message = (
        f"You are Lectura, an AI learning companion for the lecture '{lecture.title}' by {lecture.instructor}. "
        f"Answer questions using the transcript context below plus general knowledge to clarify. "
        f"When referencing the lecture, cite timestamps like [mm:ss]. "
        f"Be concise, use markdown formatting, and suggest one helpful follow-up question at the end.\n\n"
        f"Current playback time: {cur_min:02d}:{cur_sec:02d}\n\n"
        f"=== Transcript context ===\n{context_block}\n=== end context ==="
    )

    async def event_gen():
        yield f"event: citations\ndata: {json.dumps([c.model_dump() for c in citations])}\n\n"
        yield f"event: session\ndata: {json.dumps({'session_id': session_id})}\n\n"

        try:
            from emergentintegrations.llm.chat import UserMessage
            chat = _make_chat(session_id=session_id, system_message=system_message)
            response = await chat.send_message(UserMessage(text=body.message))
            text = response if isinstance(response, str) else str(response)
        except Exception as e:
            logger.exception("LLM error")
            text = f"I encountered an error reaching the AI model: {e}. Please check your API key and try again."

        assistant_msg = ChatMessage(
            session_id=session_id,
            lecture_id=body.lecture_id,
            user_id=user_id,
            role="assistant",
            content=text,
            citations=citations,
        )
        await db.chat_messages.insert_one(assistant_msg.model_dump())

        import asyncio
        words = text.split(" ")
        for i, w in enumerate(words):
            piece = w if i == 0 else " " + w
            yield f"event: token\ndata: {json.dumps({'t': piece})}\n\n"
            await asyncio.sleep(0.012)
        yield f"event: done\ndata: {json.dumps({'message_id': assistant_msg.id})}\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@api.get("/chat/history/{lecture_id}", response_model=List[ChatMessage])
async def chat_history(lecture_id: str, user_id: str = Depends(get_current_user_id)):
    docs = await db.chat_messages.find(
        {"lecture_id": lecture_id, "user_id": user_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    return [ChatMessage(**d) for d in docs]


@api.delete("/chat/history/{lecture_id}")
async def clear_chat_history(lecture_id: str, user_id: str = Depends(get_current_user_id)):
    result = await db.chat_messages.delete_many({"lecture_id": lecture_id, "user_id": user_id})
    return {"deleted": result.deleted_count}


# --- Summary ------------------------------------------------------------------
@api.post("/summary", response_model=SummaryResponse)
async def summarize(body: SummaryRequest, _: str = Depends(get_current_user_id)):
    lecture = await _get_lecture(body.lecture_id)

    if body.kind == "chapter" and body.chapter_index is not None and 0 <= body.chapter_index < len(lecture.chapters):
        ch = lecture.chapters[body.chapter_index]
        segs = [s for s in lecture.segments if s.start >= ch.start and s.end <= ch.end]
        title = ch.title
    elif body.kind == "last_5" and body.current_time is not None:
        start = max(0, body.current_time - 300)
        segs = [s for s in lecture.segments if s.start >= start and s.end <= body.current_time]
        title = "Last 5 minutes"
    elif body.kind == "topic" and body.topic:
        top = retrieve(body.topic, lecture.segments, top_k=8)
        segs = [c for c, _ in top]
        title = f"Topic: {body.topic}"
    else:
        segs = lecture.segments
        title = "Full lecture"

    if not segs:
        raise HTTPException(status_code=400, detail="No transcript content found for this summary type")

    transcript_text = "\n".join(
        f"[{int(s.start)//60:02d}:{int(s.start)%60:02d}] {s.text}" for s in segs
    )
    system = (
        "You write crisp educational summaries. Return STRICT JSON with keys: "
        "title (string), bullets (array of 5-7 bullet strings each < 120 chars), "
        "text (2-3 paragraph cohesive summary in markdown). No prose outside JSON."
    )
    prompt = f"Summarize this lecture segment ({title}):\n\n{transcript_text}\n\nReturn JSON only."

    try:
        from emergentintegrations.llm.chat import UserMessage
        chat = _make_chat(session_id=f"summary-{uuid.uuid4()}", system_message=system)
        raw = await chat.send_message(UserMessage(text=prompt))
        parsed = _safe_json(raw)
        return SummaryResponse(
            kind=body.kind,
            title=parsed.get("title") or title,
            bullets=parsed.get("bullets") or [],
            text=parsed.get("text") or str(raw),
        )
    except Exception as e:
        logger.exception("summary failed")
        raise HTTPException(status_code=500, detail=f"Summary error: {e}")


# --- Flashcards ---------------------------------------------------------------
class FlashcardsResponse(BaseModel):
    cards: List[Flashcard]


@api.post("/flashcards/{lecture_id}", response_model=FlashcardsResponse)
async def gen_flashcards(lecture_id: str, _: str = Depends(get_current_user_id)):
    lecture = await _get_lecture(lecture_id)
    transcript = " ".join(s.text for s in lecture.segments)
    system = (
        "You are a study coach. Produce exactly 8 flashcards from the transcript. "
        'Return STRICT JSON: {"cards":[{"front":"...","back":"..."}, ...]}. '
        "Front is a concise question; back is a 1-2 sentence answer. No prose outside JSON."
    )
    try:
        from emergentintegrations.llm.chat import UserMessage
        chat = _make_chat(session_id=f"fc-{uuid.uuid4()}", system_message=system)
        raw = await chat.send_message(UserMessage(text=transcript[:8000]))
        parsed = _safe_json(raw)
        cards = [
            Flashcard(front=c.get("front", ""), back=c.get("back", ""))
            for c in parsed.get("cards", [])
            if c.get("front") and c.get("back")
        ]
        if not cards:
            raise ValueError("No cards parsed from response")
        return FlashcardsResponse(cards=cards)
    except Exception as e:
        logger.exception("flashcards failed")
        raise HTTPException(status_code=500, detail=f"Flashcards error: {e}")


# --- Quiz ---------------------------------------------------------------------
class QuizResponse(BaseModel):
    questions: List[QuizQuestion]


@api.post("/quiz/{lecture_id}", response_model=QuizResponse)
async def gen_quiz(lecture_id: str, _: str = Depends(get_current_user_id)):
    lecture = await _get_lecture(lecture_id)
    transcript = " ".join(s.text for s in lecture.segments)
    system = (
        "You are an exam-writer. Create exactly 5 multiple-choice questions from the transcript. "
        'Return STRICT JSON: {"questions":[{"question":"...","options":["a","b","c","d"],'
        '"correct_index":0,"explanation":"..."}, ...]}. '
        "Each question has exactly 4 options, one correct. correct_index is 0-3. No prose outside JSON."
    )
    try:
        from emergentintegrations.llm.chat import UserMessage
        chat = _make_chat(session_id=f"quiz-{uuid.uuid4()}", system_message=system)
        raw = await chat.send_message(UserMessage(text=transcript[:8000]))
        parsed = _safe_json(raw)
        qs = []
        for q in parsed.get("questions", []):
            opts = q.get("options") or []
            if len(opts) == 4:
                qs.append(QuizQuestion(
                    question=q.get("question", ""),
                    options=opts,
                    correct_index=int(q.get("correct_index", 0)),
                    explanation=q.get("explanation", ""),
                ))
        if not qs:
            raise ValueError("No questions parsed")
        return QuizResponse(questions=qs)
    except Exception as e:
        logger.exception("quiz failed")
        raise HTTPException(status_code=500, detail=f"Quiz error: {e}")


# --- Notes --------------------------------------------------------------------
@api.post("/notes", response_model=Note)
async def create_note(body: NoteCreate, user_id: str = Depends(get_current_user_id)):
    note = Note(user_id=user_id, **body.model_dump())
    await db.notes.insert_one(note.model_dump())
    return note


@api.get("/notes/{lecture_id}", response_model=List[Note])
async def list_notes(lecture_id: str, user_id: str = Depends(get_current_user_id)):
    docs = await db.notes.find(
        {"user_id": user_id, "lecture_id": lecture_id}, {"_id": 0}
    ).sort("timestamp", 1).to_list(500)
    return [Note(**d) for d in docs]


@api.put("/notes/{note_id}", response_model=Note)
async def update_note(note_id: str, body: NoteCreate, user_id: str = Depends(get_current_user_id)):
    existing = await db.notes.find_one({"id": note_id, "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.notes.update_one(
        {"id": note_id, "user_id": user_id},
        {"$set": {"content": body.content, "timestamp": body.timestamp}}
    )
    updated = await db.notes.find_one({"id": note_id}, {"_id": 0})
    return Note(**updated)


@api.delete("/notes/{note_id}")
async def delete_note(note_id: str, user_id: str = Depends(get_current_user_id)):
    await db.notes.delete_one({"id": note_id, "user_id": user_id})
    return {"ok": True}


# --- Bookmarks ----------------------------------------------------------------
@api.post("/bookmarks", response_model=Bookmark)
async def create_bookmark(body: BookmarkCreate, user_id: str = Depends(get_current_user_id)):
    bm = Bookmark(user_id=user_id, **body.model_dump())
    await db.bookmarks.insert_one(bm.model_dump())
    return bm


@api.get("/bookmarks/{lecture_id}", response_model=List[Bookmark])
async def list_bookmarks(lecture_id: str, user_id: str = Depends(get_current_user_id)):
    docs = await db.bookmarks.find(
        {"user_id": user_id, "lecture_id": lecture_id}, {"_id": 0}
    ).sort("timestamp", 1).to_list(500)
    return [Bookmark(**d) for d in docs]


@api.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, user_id: str = Depends(get_current_user_id)):
    await db.bookmarks.delete_one({"id": bookmark_id, "user_id": user_id})
    return {"ok": True}


# --- Progress -----------------------------------------------------------------
@api.post("/progress", response_model=Progress)
async def upsert_progress(body: ProgressUpdate, user_id: str = Depends(get_current_user_id)):
    percent = (body.position / body.duration * 100) if body.duration > 0 else 0.0
    prog = Progress(
        user_id=user_id,
        lecture_id=body.lecture_id,
        position=body.position,
        duration=body.duration,
        percent=round(percent, 2),
    )
    await db.progress.update_one(
        {"user_id": user_id, "lecture_id": body.lecture_id},
        {"$set": prog.model_dump()},
        upsert=True,
    )
    return prog


@api.get("/progress", response_model=List[Progress])
async def list_progress(user_id: str = Depends(get_current_user_id)):
    docs = await db.progress.find({"user_id": user_id}, {"_id": 0}).to_list(500)
    return [Progress(**d) for d in docs]


# --- Dashboard stats ----------------------------------------------------------
class DashboardStats(BaseModel):
    lectures_total: int
    lectures_in_progress: int
    lectures_completed: int
    minutes_watched: int
    notes_count: int
    bookmarks_count: int
    chat_messages: int


@api.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(user_id: str = Depends(get_current_user_id)):
    progress_docs = await db.progress.find({"user_id": user_id}, {"_id": 0}).to_list(500)
    in_progress = sum(1 for p in progress_docs if 5 < p.get("percent", 0) < 95)
    completed = sum(1 for p in progress_docs if p.get("percent", 0) >= 95)
    minutes = int(sum(p.get("position", 0) for p in progress_docs) // 60)
    return DashboardStats(
        lectures_total=await db.lectures.count_documents({}),
        lectures_in_progress=in_progress,
        lectures_completed=completed,
        minutes_watched=minutes,
        notes_count=await db.notes.count_documents({"user_id": user_id}),
        bookmarks_count=await db.bookmarks.count_documents({"user_id": user_id}),
        chat_messages=await db.chat_messages.count_documents({"user_id": user_id, "role": "user"}),
    )


# --- Mount + middleware -------------------------------------------------------
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.lectures.create_index("id", unique=True)
    await db.chat_messages.create_index([("lecture_id", 1), ("user_id", 1), ("created_at", 1)])
    await db.notes.create_index([("user_id", 1), ("lecture_id", 1)])
    await db.bookmarks.create_index([("user_id", 1), ("lecture_id", 1)])
    await db.progress.create_index([("user_id", 1), ("lecture_id", 1)])

    n = await seed_lectures(db)
    if n:
        logger.info(f"Seeded {n} sample lectures")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
