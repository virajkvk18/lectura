"""
Lightweight RAG retrieval pipeline (no external vector DB required).

Pipeline:
  1. Transcript ingestion: each Lecture has TranscriptSegment[] with timestamps.
  2. Chunking: segments merged into ~30s windows for retrieval.
  3. "Embedding": term-frequency vectors using stop-word filtered tokens.
  4. Retrieval: cosine similarity between query TF vector and chunk vectors.
  5. Temporal boost: chunks near user's current playback time get a small bonus.
  6. Context formatting: top-K chunks formatted as [mm:ss-mm:ss] text blocks.
"""
from __future__ import annotations
import math
import re
from collections import Counter
from typing import List, Tuple

from models import TranscriptSegment

_STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "to", "of", "in", "on", "for", "with", "and", "or", "but", "if", "then",
    "so", "this", "that", "these", "those", "it", "its", "as", "at", "by",
    "from", "about", "into", "we", "you", "i", "he", "she", "they", "them",
    "do", "does", "did", "have", "has", "had", "will", "would", "can", "could",
    "should", "may", "might", "what", "which", "who", "how", "why", "when",
    "where", "there", "here", "your", "our", "my", "his", "her", "their",
    "up", "out", "not", "no", "just", "also", "more", "very", "all", "one",
    "each", "some", "any", "now", "then", "than", "too", "such", "even",
}


def _tokenize(text: str) -> List[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z\-']+", text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 2]


def _cosine(a: Counter, b: Counter) -> float:
    if not a or not b:
        return 0.0
    common = set(a) & set(b)
    if not common:
        return 0.0
    dot = sum(a[t] * b[t] for t in common)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def chunk_segments(
    segments: List[TranscriptSegment],
    window_seconds: float = 30.0
) -> List[TranscriptSegment]:
    """Merge fine-grained transcript segments into ~window-sized retrieval chunks."""
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
            if cur_text:
                chunks.append(TranscriptSegment(
                    start=cur_start, end=cur_end, text=" ".join(cur_text)
                ))
            cur_text = [seg.text]
            cur_start = seg.start
            cur_end = seg.end

    if cur_text:
        chunks.append(TranscriptSegment(
            start=cur_start, end=cur_end, text=" ".join(cur_text)
        ))
    return chunks


def retrieve(
    query: str,
    segments: List[TranscriptSegment],
    current_time: float = 0.0,
    top_k: int = 5,
) -> List[Tuple[TranscriptSegment, float]]:
    """Return top-K (chunk, score) tuples ranked by TF-cosine similarity + temporal boost."""
    chunks = chunk_segments(segments, window_seconds=30.0)
    if not chunks:
        return []

    q_vec = Counter(_tokenize(query))
    if not q_vec:
        # Fallback: return chunks nearest to current time
        scored = [(ch, 0.1) for ch in chunks]
        if current_time > 0:
            scored.sort(key=lambda x: abs((x[0].start + x[0].end) / 2 - current_time))
        return scored[:top_k]

    scored: List[Tuple[TranscriptSegment, float]] = []
    for ch in chunks:
        c_vec = Counter(_tokenize(ch.text))
        sim = _cosine(q_vec, c_vec)
        # Temporal boost: chunks near current playback time get up to +0.15
        if current_time > 0:
            mid = (ch.start + ch.end) / 2
            dist = abs(mid - current_time)
            boost = max(0.0, 0.15 * (1 - min(dist, 60.0) / 60.0))
            sim += boost
        scored.append((ch, sim))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [s for s in scored[:top_k] if s[1] > 0.01]


def format_context(top_chunks: List[Tuple[TranscriptSegment, float]]) -> str:
    """Format retrieved chunks into a prompt-friendly context block with timestamps."""
    if not top_chunks:
        return "(no relevant transcript context found)"
    lines = []
    for ch, score in top_chunks:
        start_m, start_s = divmod(int(ch.start), 60)
        end_m, end_s = divmod(int(ch.end), 60)
        ts = f"[{start_m:02d}:{start_s:02d} - {end_m:02d}:{end_s:02d}]"
        lines.append(f"{ts} {ch.text}")
    return "\n".join(lines)
