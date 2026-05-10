Action: file_editor create /app/frontend/src/pages/VideoLearning.jsx --file-text "import { useEffect, useRef, useState } from \"react\";
import { useParams, Link } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import { ArrowLeft, ListMusic } from \"lucide-react\";

import Aurora from \"@/components/Aurora\";
import Navbar from \"@/components/Navbar\";
import VideoPlayer from \"@/components/VideoPlayer\";
import TranscriptPanel from \"@/components/TranscriptPanel\";
import ChatPanel from \"@/components/ChatPanel\";
import NotesPanel from \"@/components/NotesPanel\";
import SummaryPanel from \"@/components/SummaryPanel\";
import FlashcardsPanel from \"@/components/FlashcardsPanel\";
import QuizPanel from \"@/components/QuizPanel\";
import { Tabs, TabsList, TabsTrigger, TabsContent } from \"@/components/ui/tabs\";
import api from \"@/lib/api\";
import { formatTime } from \"@/lib/utils\";

export default function VideoLearning() {
  const { lectureId } = useParams();
  const [lecture, setLecture] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const seekHandle = useRef(null);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/lectures/${lectureId}`);
      setLecture(data);
      setDuration(data.duration);
      const { data: bms } = await api.get(`/bookmarks/${lectureId}`);
      setBookmarks(bms);
    })();
  }, [lectureId]);

  // Save progress every 10s
  useEffect(() => {
    if (!lecture || !duration) return;
    const t = setInterval(() => {
      if (Math.abs(currentTime - lastSavedRef.current) > 5) {
        lastSavedRef.current = currentTime;
        api.post(\"/progress\", {
          lecture_id: lectureId, position: currentTime, duration: duration,
        }).catch(() => {});
      }
    }, 5000);
    return () => clearInterval(t);
  }, [currentTime, duration, lecture, lectureId]);

  const handleSeek = (t) => seekHandle.current?.(t);

  if (!lecture) {
    return (
      <div className=\"min-h-screen grid place-items-center bg-background text-foreground\">
        <div className=\"size-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin\" />
      </div>
    );
  }

  const currentChapter = (lecture.chapters || []).find((c) => currentTime >= c.start && currentTime < c.end);

  return (
    <div className=\"relative min-h-screen pb-12\">
      <Aurora />
      <Navbar />

      <div className=\"relative mx-auto max-w-[1500px] px-4 md:px-6 pt-6\">
        <Link to=\"/dashboard\" className=\"inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors\" data-testid=\"back-to-dashboard\">
          <ArrowLeft className=\"size-4\" /> Dashboard
        </Link>

        <div className=\"mt-4 flex flex-wrap items-end justify-between gap-3\">
          <div>
            <h1 className=\"font-display text-2xl md:text-4xl font-black tracking-tight\" data-testid=\"lecture-title\">{lecture.title}</h1>
            <div className=\"mt-1 text-sm text-zinc-400\">{lecture.instructor} · {formatTime(lecture.duration)}</div>
          </div>
          {currentChapter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=\"flex items-center gap-2 text-xs font-mono text-zinc-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5\" data-testid=\"current-chapter\">
              <ListMusic className=\"size-3.5 text-amber-400\" />
              {currentChapter.title}
            </motion.div>
          )}
        </div>

        <div className=\"mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5\">
          {/* Player + transcript stack */}
          <div className=\"lg:col-span-8 space-y-5\">
            <VideoPlayer
              src={lecture.video_url}
              chapters={lecture.chapters}
              bookmarks={bookmarks}
              duration={lecture.duration}
              onTimeUpdate={(t, d) => { setCurrentTime(t); if (d) setDuration(d); }}
              onSeek={(t) => setCurrentTime(t)}
              registerSeekHandle={(fn) => { seekHandle.current = fn; }}
            />

            <div className=\"rounded-2xl border border-white/10 bg-zinc-950/70 p-4 md:p-5\">
              <div className=\"flex items-center justify-between mb-3\">
                <h3 className=\"font-display text-lg font-bold\">Transcript</h3>
                <span className=\"text-[11px] font-mono text-zinc-500\">click any line to jump</span>
              </div>
              <div className=\"h-[320px]\">
                <TranscriptPanel
                  segments={lecture.segments}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              </div>
            </div>
          </div>

          {/* Right side panel */}
          <div className=\"lg:col-span-4\">
            <div className=\"rounded-2xl border border-white/10 bg-zinc-950/70 p-4 md:p-5 h-full min-h-[640px] flex flex-col\">
              <Tabs defaultValue=\"chat\" className=\"flex-1 flex flex-col\">
                <TabsList className=\"bg-white/5 border border-white/10 p-1 rounded-full justify-start overflow-x-auto\" data-testid=\"panel-tabs\">
                  <TabsTrigger value=\"chat\" className=\"rounded-full data-[state=active]:bg-white data-[state=active]:text-black\" data-testid=\"tab-chat\">Chat</TabsTrigger>
                  <TabsTrigger value=\"summary\" className=\"rounded-full data-[state=active]:bg-white data-[state=active]:text-black\" data-testid=\"tab-summary\">Summary</TabsTrigger>
                  <TabsTrigger value=\"notes\" className=\"rounded-full data-[state=active]:bg-white data-[state=active]:text-black\" data-testid=\"tab-notes\">Notes</TabsTrigger>
                  <TabsTrigger value=\"cards\" className=\"rounded-full data-[state=active]:bg-white data-[state=active]:text-black\" data-testid=\"tab-cards\">Cards</TabsTrigger>
                  <TabsTrigger value=\"quiz\" className=\"rounded-full data-[state=active]:bg-white data-[state=active]:text-black\" data-testid=\"tab-quiz\">Quiz</TabsTrigger>
                </TabsList>
                <div className=\"mt-4 flex-1 min-h-0\">
                  <TabsContent value=\"chat\" className=\"h-full m-0\">
                    <ChatPanel lectureId={lectureId} currentTime={currentTime} onSeek={handleSeek} />
                  </TabsContent>
                  <TabsContent value=\"summary\" className=\"h-full m-0\">
                    <SummaryPanel lectureId={lectureId} lecture={lecture} currentTime={currentTime} />
                  </TabsContent>
                  <TabsContent value=\"notes\" className=\"h-full m-0\">
                    <NotesPanel lectureId={lectureId} currentTime={currentTime} onSeek={handleSeek} lectureTitle={lecture.title} />
                  </TabsContent>
                  <TabsContent value=\"cards\" className=\"h-full m-0\">
                    <FlashcardsPanel lectureId={lectureId} />
                  </TabsContent>
                  <TabsContent value=\"quiz\" className=\"h-full m-0\">
                    <QuizPanel lectureId={lectureId} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/VideoLearning.jsx