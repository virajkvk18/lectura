import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatTime } from "../lib/utils";
import VideoPlayer from "../components/VideoPlayer";
import TranscriptPanel from "../components/TranscriptPanel";
import ChatPanel from "../components/ChatPanel";
import NotesPanel from "../components/NotesPanel";
import SummaryPanel from "../components/SummaryPanel";
import FlashcardsPanel from "../components/FlashcardsPanel";
import QuizPanel from "../components/QuizPanel";

const TABS = [
  { id: "chat", label: "Chat" },
  { id: "transcript", label: "Transcript" },
  { id: "notes", label: "Notes" },
  { id: "summary", label: "Summary" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz", label: "Quiz" },
];

export default function VideoLearning() {
  const { lectureId } = useParams();
  const [lecture, setLecture] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState("chat");
  const [loading, setLoading] = useState(true);
  const seekRef = useRef(null);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: lec }, { data: bms }] = await Promise.all([
          api.get(`/lectures/${lectureId}`),
          api.get(`/bookmarks/${lectureId}`),
        ]);
        setLecture(lec);
        setBookmarks(bms);
      } catch (err) {
        toast.error("Failed to load lecture");
      } finally {
        setLoading(false);
      }
    })();
  }, [lectureId]);

  // Save progress every 10s of watched time
  const handleTimeUpdate = useCallback(
    (time, dur) => {
      setCurrentTime(time);
      if (dur > 0) setDuration(dur);
      if (time - lastSavedRef.current >= 10 && dur > 0) {
        lastSavedRef.current = time;
        api.post("/progress", {
          lecture_id: lectureId,
          position: time,
          duration: dur,
        }).catch(() => {});
      }
    },
    [lectureId]
  );

  const seekTo = useCallback((t) => {
    seekRef.current?.(t);
  }, []);

  const addBookmark = useCallback(
    async (label, timestamp) => {
      try {
        const { data } = await api.post("/bookmarks", {
          lecture_id: lectureId,
          label,
          timestamp,
        });
        setBookmarks((prev) => [...prev, data]);
        toast.success("Bookmark saved");
      } catch {
        toast.error("Failed to save bookmark");
      }
    },
    [lectureId]
  );

  const removeBookmark = useCallback(async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Failed to remove bookmark");
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/60 gap-4">
        <p>Lecture not found</p>
        <Link to="/dashboard" className="text-amber-400 hover:text-amber-300 text-sm">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-black/60 backdrop-blur sticky top-0 z-20">
        <Link
          to="/dashboard"
          className="text-white/40 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">{lecture.title}</h1>
          <p className="text-xs text-white/40 truncate">{lecture.instructor}</p>
        </div>
        <div className="text-xs text-white/30 font-mono hidden sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Video + tabs */}
        <div className="w-full lg:w-[58%] flex flex-col border-r border-white/5">
          <VideoPlayer
            videoUrl={lecture.video_url}
            chapters={lecture.chapters || []}
            bookmarks={bookmarks}
            onTimeUpdate={handleTimeUpdate}
            onSeekReady={(fn) => { seekRef.current = fn; }}
            currentTime={currentTime}
            onAddBookmark={addBookmark}
          />

          {/* Tab bar */}
          <div className="flex border-b border-white/5 bg-black/40 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-amber-400 border-b-2 border-amber-400 -mb-px"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content (below video on desktop; scrollable) */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "transcript" && (
              <TranscriptPanel
                segments={lecture.segments}
                currentTime={currentTime}
                onSeek={seekTo}
              />
            )}
            {activeTab === "notes" && (
              <NotesPanel lectureId={lectureId} currentTime={currentTime} onSeek={seekTo} />
            )}
            {activeTab === "summary" && (
              <SummaryPanel
                lectureId={lectureId}
                chapters={lecture.chapters}
                currentTime={currentTime}
              />
            )}
            {activeTab === "flashcards" && <FlashcardsPanel lectureId={lectureId} />}
            {activeTab === "quiz" && <QuizPanel lectureId={lectureId} />}
            {activeTab === "chat" && (
              <div className="h-full lg:hidden">
                <ChatPanel
                  lectureId={lectureId}
                  currentTime={currentTime}
                  onSeek={seekTo}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat panel (always visible on desktop) */}
        <div className="hidden lg:flex w-[42%] flex-col">
          <ChatPanel
            lectureId={lectureId}
            currentTime={currentTime}
            onSeek={seekTo}
          />
        </div>
      </div>
    </div>
  );
}
