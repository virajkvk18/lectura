import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlayCircle, Clock, Bookmark, MessageSquare, GraduationCap,
  TrendingUp, BookOpen, ArrowRight, LogOut, BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../lib/auth.jsx";
import { formatTime } from "../lib/utils";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function LectureCard({ lecture, progress }) {
  const pct = progress?.percent || 0;
  const mins = Math.floor((lecture.duration || 0) / 60);

  return (
    <Link
      to={`/learn/${lecture.id}`}
      className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:scale-[1.01]"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={lecture.thumbnail}
          alt={lecture.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80"; }}
        />
        {/* Progress bar */}
        {pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-white" />
        </div>
        {/* Status badge */}
        {pct >= 95 && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            Complete
          </div>
        )}
        {pct > 5 && pct < 95 && (
          <div className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            {Math.round(pct)}%
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(lecture.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] font-medium text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-sm text-white leading-snug mb-1.5 line-clamp-2">
          {lecture.title}
        </h3>
        <p className="text-xs text-white/40 mb-3 line-clamp-2">{lecture.description}</p>
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>{lecture.instructor}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {mins}m
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: lecs }, { data: prog }, { data: st }] = await Promise.all([
          api.get("/lectures"),
          api.get("/progress"),
          api.get("/dashboard/stats"),
        ]);
        setLectures(lecs);
        const map = {};
        prog.forEach((p) => (map[p.lecture_id] = p));
        setProgress(map);
        setStats(st);
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold text-sm">Lectura</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40 hidden sm:block">{user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-1">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              {user?.name?.split(" ")[0]}
            </span>
          </h1>
          <p className="text-white/40 text-sm">Here's your learning overview</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <StatCard icon={GraduationCap} label="Total lectures" value={stats.lectures_total} color="bg-rose-500/10 text-rose-400" />
            <StatCard icon={TrendingUp} label="In progress" value={stats.lectures_in_progress} color="bg-amber-500/10 text-amber-400" />
            <StatCard icon={BarChart2} label="Completed" value={stats.lectures_completed} color="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={Clock} label="Minutes watched" value={stats.minutes_watched} color="bg-sky-500/10 text-sky-400" />
          </div>
        )}

        {/* Lectures */}
        <div>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Available Lectures
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse">
                  <div className="aspect-video bg-white/5 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lectures.map((lec) => (
                <LectureCard key={lec.id} lecture={lec} progress={progress[lec.id]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
