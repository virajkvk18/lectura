Action: file_editor create /app/frontend/src/pages/Dashboard.jsx --file-text "import { useEffect, useState } from \"react\";
import { Link } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import {
  PlayCircle, Clock, BookmarkPlus, MessageSquare, Sparkles,
  TrendingUp, GraduationCap, ArrowUpRight,
} from \"lucide-react\";
import Aurora from \"@/components/Aurora\";
import Navbar from \"@/components/Navbar\";
import api from \"@/lib/api\";
import { useAuth } from \"@/lib/auth.jsx\";
import { formatTime } from \"@/lib/utils\";

export default function Dashboard() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [{ data: lecs }, { data: prog }, { data: st }] = await Promise.all([
        api.get(\"/lectures\"),
        api.get(\"/progress\"),
        api.get(\"/dashboard/stats\"),
      ]);
      setLectures(lecs);
      const map = {};
      prog.forEach((p) => (map[p.lecture_id] = p));
      setProgress(map);
      setStats(st);
    })();
  }, []);

  const STATS = stats ? [
    { label: \"Lectures available\", value: stats.lectures_total, icon: GraduationCap },
    { label: \"In progress\", value: stats.lectures_in_progress, icon: PlayCircle },
    { label: \"Minutes watched\", value: stats.minutes_watched, icon: Clock },
    { label: \"Notes\", value: stats.notes_count, icon: BookmarkPlus },
  ] : [];

  return (
    <div className=\"relative min-h-screen pb-20\">
      <Aurora />
      <Navbar />

      <div className=\"relative mx-auto max-w-7xl px-4 md:px-8 pt-10\">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className=\"flex flex-wrap items-end justify-between gap-4\">
          <div>
            <div className=\"text-xs font-mono uppercase tracking-[0.2em] text-zinc-500\">Welcome</div>
            <h1 className=\"mt-1 font-display text-3xl md:text-5xl font-black tracking-tight\" data-testid=\"dashboard-greeting\">
              Hello, <span className=\"aurora-text\">{user?.name?.split(\" \")[0] || \"learner\"}</span>.
            </h1>
            <p className=\"mt-2 text-zinc-400\">Pick up where you left off, or dive into something new.</p>
          </div>
          <div className=\"hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500\">
            <span className=\"size-1.5 rounded-full bg-amber-400 animate-pulse\" />
            AI companion online
          </div>
        </motion.div>

        {/* Stats */}
        <div className=\"mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5\" data-testid=\"dashboard-stats\">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className=\"rounded-2xl border border-white/10 bg-zinc-950/60 p-5\"
            >
              <div className=\"flex items-center justify-between\">
                <s.icon className=\"size-5 text-amber-400\" />
                <TrendingUp className=\"size-4 text-zinc-600\" />
              </div>
              <div className=\"mt-4 font-display text-3xl font-black tracking-tight\">{s.value}</div>
              <div className=\"mt-1 text-xs font-mono uppercase tracking-[0.18em] text-zinc-500\">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Lectures */}
        <div className=\"mt-14 flex items-center justify-between\">
          <h2 className=\"font-display text-2xl md:text-3xl font-extrabold tracking-tight\">Your library</h2>
          <span className=\"text-xs font-mono text-zinc-500\">{lectures.length} lectures</span>
        </div>

        <div className=\"mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5\" data-testid=\"lecture-grid\">
          {lectures.map((l, i) => {
            const p = progress[l.id];
            const pct = p ? Math.min(100, Math.round(p.percent)) : 0;
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/learn/${l.id}`} className=\"group block rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/70 hover:border-amber-500/40 transition-colors\" data-testid={`lecture-card-${l.id}`}>
                  <div className=\"aspect-video relative overflow-hidden\">
                    <img src={l.thumbnail} alt={l.title} className=\"absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105\" />
                    <div className=\"absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent\" />
                    <div className=\"absolute inset-0 grid place-items-center\">
                      <div className=\"size-14 rounded-full bg-white/95 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity\">
                        <PlayCircle className=\"size-7 text-black\" />
                      </div>
                    </div>
                    <div className=\"absolute top-3 left-3 flex flex-wrap gap-1.5\">
                      {l.tags.slice(0, 2).map((t) => (
                        <span key={t} className=\"text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-200 bg-black/60 border border-white/10 px-2 py-0.5 rounded-full\">{t}</span>
                      ))}
                    </div>
                    <div className=\"absolute bottom-3 right-3 text-[11px] font-mono text-zinc-200 bg-black/60 border border-white/10 px-2 py-0.5 rounded-full\">{formatTime(l.duration)}</div>
                  </div>
                  <div className=\"p-5\">
                    <div className=\"flex items-start justify-between gap-2\">
                      <h3 className=\"font-display text-lg font-bold tracking-tight leading-tight\">{l.title}</h3>
                      <ArrowUpRight className=\"size-4 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0 mt-1\" />
                    </div>
                    <p className=\"mt-1 text-xs text-zinc-500\">by {l.instructor}</p>
                    <p className=\"mt-3 text-sm text-zinc-400 line-clamp-2\">{l.description}</p>
                    {pct > 0 && (
                      <div className=\"mt-4\">
                        <div className=\"h-1.5 rounded-full bg-white/5 overflow-hidden\">
                          <div className=\"h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500\" style={{ width: `${pct}%` }} />
                        </div>
                        <div className=\"mt-1 text-[11px] font-mono text-zinc-500\">{pct}% watched</div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* AI insight */}
        <div className=\"mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 to-zinc-900/50 p-6 md:p-8 relative overflow-hidden\">
          <div className=\"absolute -top-20 -right-20 size-72 rounded-full bg-amber-500/15 blur-3xl\" />
          <div className=\"relative flex items-start gap-4\">
            <div className=\"size-10 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 grid place-items-center shrink-0\">
              <Sparkles className=\"size-5 text-black\" />
            </div>
            <div>
              <div className=\"text-xs font-mono uppercase tracking-[0.2em] text-amber-400\">AI insight</div>
              <h3 className=\"mt-1 font-display text-xl md:text-2xl font-bold\">You learn best in 25-minute bursts.</h3>
              <p className=\"mt-2 text-sm text-zinc-400 max-w-xl\">
                Based on your last sessions, ask the AI for a quick summary every chapter break - it doubles retention.
                Try the &ldquo;Last 5 minutes&rdquo; summary on any lecture.
              </p>
              <div className=\"mt-3 inline-flex items-center gap-2 text-xs text-zinc-300\">
                <MessageSquare className=\"size-4 text-amber-400\" />
                Confidence: 86%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Dashboard.jsx