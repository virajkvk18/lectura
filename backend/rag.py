Action: file_editor create /app/backend/rag.py --file-text "\"\"\"
Lightweight RAG retrieval pipeline (no external vector DB).

Pipeline:
  1. Transcript ingestion: each Lecture has TranscriptSegment[] (timestamped chunks).
  2. Chunking: segments are merged into ~window chunks (~30s each) for retrieval.
  3. \"Embedding\": term-frequency vectors using token sets (lightweight TF retrieval).
  4. Semantic retrieval: cosine similarity between query TF vector and chunk vectors.
  5. Context ranking: top-K chunks (sorted by similarity), with the chunk closest to
     the user's current playback time slightly boosted.
  6. Prompt orchestration: chunks formatted with [time] markers and injected as system context.
\"\"\"
from __future__ import annotations
import math
import re
from collections import Counter
from typing import List, Tuple

from models import TranscriptSegment


_STOPWORDS = {
    \"the\", \"a\", \"an\", \"is\", \"are\", \"was\", \"were\", \"be\", \"been\", \"being\",
    \"to\", \"of\", \"in\", \"on\", \"for\", \"with\", \"and\", \"or\", \"but\", \"if\", \"then\",
    \"so\", \"this\", \"that\", \"these\", \"those\", \"it\", \"its\", \"as\", \"at\", \"by\",
    \"from\", \"about\", \"into\", \"we\", \"you\", \"i\", \"he\", \"she\", \"they\", \"them\",
    \"do\", \"does\", \"did\", \"have\", \"has\", \"had\", \"will\", \"would\", \"can\", \"could\",
    \"should\", \"may\", \"might\", \"what\", \"which\", \"who\", \"how\", \"why\", \"when\",
    \"where\", \"there\", \"here\", \"your\", \"our\", \"my\", \"his\", \"her\", \"their\",
}


def _tokenize(text: str) -> List[str]:
    tokens = re.findall(r\"[a-zA-Z][a-zA-Z\-']+\", text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 1]


def _cosine(a: Counter, b: Counter) -> float:
    if not a or not b:
        return 0.0
    common = set(a) & set(b)
    dot = sum(a[t] * b[t] for t in common)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def chunk_segments(segments: List[TranscriptSegment], window_seconds: float = 30.0) -> List[TranscriptSegment]:
    \"\"\"Merge fine-grained segments into ~window-sized retrieval chunks.\"\"\"
    if not segments:
        return []
    chunks: List[TranscriptSegment] = []
    cur_text: List[str] = []
    cur_start = segments[0].start
    cur_end = segments[0].end
    for seg in segments:
        if seg.end - cur_start <= window_seconds:
            cur_text.append(seg.text)
            cur_end = seg.end
        else:
            chunks.append(TranscriptSegment(start=cur_start, end=cur_end, text=\" \".join(cur_text)))
            cur_text = [seg.text]
            cur_start = seg.start
            cur_end = seg.end
    if cur_text:
        chunks.append(TranscriptSegment(start=cur_start, end=cur_end, text=\" \".join(cur_text)))
    return chunks


def retrieve(
    query: str,
    segments: List[TranscriptSegment],
    current_time: float = 0.0,
    top_k: int = 5,
) -> List[Tuple[TranscriptSegment, float]]:
    \"\"\"Return top-K (chunk, score) tuples ranked by similarity + temporal proximity boost.\"\"\"
    chunks = chunk_segments(segments, window_seconds=30.0)
    if not chunks:
        return []

    q_vec = Counter(_tokenize(query))
    scored: List[Tuple[TranscriptSegment, float]] = []
    for ch in chunks:
        c_vec = Counter(_tokenize(ch.text))
        sim = _cosine(q_vec, c_vec)
        # Temporal boost: if the chunk is near the user's current playback time,
        # nudge its score up slightly. Decays over 60s.
        if current_time > 0:
            dist = abs((ch.start + ch.end) / 2 - current_time)
            boost = max(0.0, 0.15 * (1 - min(dist, 60.0) / 60.0))
            sim += boost
        scored.append((ch, sim))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [s for s in scored[:top_k] if s[1] > 0.01]


def format_context(top_chunks: List[Tuple[TranscriptSegment, float]]) -> str:
    \"\"\"Format retrieved chunks into a markdown-friendly context block.\"\"\"
    if not top_chunks:
        return \"(no relevant transcript context found)\"
    lines = []
    for ch, _ in top_chunks:
        ts = f\"[{int(ch.start)//60:02d}:{int(ch.start)%60:02d} - {int(ch.end)//60:02d}:{int(ch.end)%60:02d}]\"
        lines.append(f\"{ts} {ch.text}\")
    return \"\n\".join(lines)
"
Observation: Create successful: /app/backend/rag.py