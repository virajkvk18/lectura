import { Link } from "react-router-dom";
import { BookOpen, Zap, Brain, MessageSquare, Star, ArrowRight, Play } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "RAG-Powered Q&A",
    desc: "Ask anything about the lecture. Get answers grounded in the actual transcript with timestamp citations.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: Zap,
    title: "Instant Summaries",
    desc: "Full lecture, chapter-by-chapter, last 5 minutes, or any topic — generated in seconds.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: BookOpen,
    title: "Flashcards & Quizzes",
    desc: "Auto-generated study materials from any lecture. Test your knowledge immediately.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: MessageSquare,
    title: "Synced Transcript",
    desc: "Follow along with auto-highlighting. Click any segment to jump instantly to that moment.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">Lectura</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 mb-8">
          <Star className="w-3 h-3" />
          AI-powered learning companion
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
          Learn faster with{" "}
          <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
            AI that listens
          </span>
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Ask questions mid-lecture, jump to any moment, get instant summaries, flashcards
          and quizzes — all powered by AI that actually understands your content.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 text-black font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Start learning free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 border border-white/10 text-white/70 hover:text-white hover:border-white/20 px-8 py-3.5 rounded-xl transition-all text-sm"
          >
            <Play className="w-4 h-4" /> Watch demo
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border p-6 ${f.bg} hover:scale-[1.01] transition-transform cursor-default`}
            >
              <f.icon className={`w-6 h-6 ${f.color} mb-4`} />
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA strip */}
      <div className="border-t border-white/5 py-16 text-center">
        <p className="text-white/40 text-sm mb-4">Ready to learn smarter?</p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
        >
          Create free account <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
