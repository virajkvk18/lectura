"""
Pydantic models for Lectura AI Learning Companion.
All models use UUID-based ids and exclude MongoDB's _id on read.
"""
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import uuid


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uid() -> str:
    return str(uuid.uuid4())


# ---------- Auth ----------
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# ---------- Lectures & Transcripts ----------
class Chapter(BaseModel):
    title: str
    start: float  # seconds
    end: float


class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class Lecture(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    title: str
    description: str
    instructor: str
    duration: float  # seconds
    thumbnail: str
    video_url: str
    tags: List[str] = []
    chapters: List[Chapter] = []
    segments: List[TranscriptSegment] = []
    created_at: str = Field(default_factory=_now)


class LectureCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    instructor: str
    duration: float
    thumbnail: str
    tags: List[str] = []
    chapters: List[Chapter] = []


# ---------- Chat ----------
class ChatRequest(BaseModel):
    lecture_id: str
    session_id: Optional[str] = None
    message: str
    current_time: float = 0.0


class Citation(BaseModel):
    start: float
    end: float
    text: str


class ChatMessage(BaseModel):
    id: str = Field(default_factory=_uid)
    session_id: str
    lecture_id: str
    user_id: str
    role: str  # "user" | "assistant"
    content: str
    citations: List[Citation] = []
    created_at: str = Field(default_factory=_now)


# ---------- Notes ----------
class NoteCreate(BaseModel):
    lecture_id: str
    content: str
    timestamp: float = 0.0


class Note(BaseModel):
    id: str = Field(default_factory=_uid)
    user_id: str
    lecture_id: str
    content: str
    timestamp: float = 0.0
    created_at: str = Field(default_factory=_now)


# ---------- Bookmarks ----------
class BookmarkCreate(BaseModel):
    lecture_id: str
    label: str
    timestamp: float


class Bookmark(BaseModel):
    id: str = Field(default_factory=_uid)
    user_id: str
    lecture_id: str
    label: str
    timestamp: float
    created_at: str = Field(default_factory=_now)


# ---------- Flashcards & Quiz ----------
class Flashcard(BaseModel):
    id: str = Field(default_factory=_uid)
    front: str
    back: str


class QuizQuestion(BaseModel):
    id: str = Field(default_factory=_uid)
    question: str
    options: List[str]
    correct_index: int
    explanation: str


# ---------- Progress ----------
class ProgressUpdate(BaseModel):
    lecture_id: str
    position: float
    duration: float


class Progress(BaseModel):
    id: str = Field(default_factory=_uid)
    user_id: str
    lecture_id: str
    position: float = 0.0
    duration: float = 0.0
    percent: float = 0.0
    updated_at: str = Field(default_factory=_now)


# ---------- Summary ----------
class SummaryRequest(BaseModel):
    lecture_id: str
    kind: str = "full"  # "full" | "chapter" | "last_5" | "topic"
    chapter_index: Optional[int] = None
    current_time: Optional[float] = None
    topic: Optional[str] = None


class SummaryResponse(BaseModel):
    kind: str
    title: str
    bullets: List[str]
    text: str
