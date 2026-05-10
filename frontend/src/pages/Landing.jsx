Action: file_editor create /app/frontend/src/pages/Landing.jsx --file-text "import { motion } from \"framer-motion\";
import { Link } from \"react-router-dom\";
import {
  Sparkles, MessageSquare, Clock, FileText, BookmarkPlus,
  Brain, Zap, ShieldCheck, GraduationCap, ArrowRight, PlayCircle,
} from \"lucide-react\";
import Aurora from \"@/components/Aurora\";
import Navbar from \"@/components/Navbar\";
import { Button } from \"@/components/ui/button\";

const FEATURES = [
  { icon: MessageSquare, title: \"Contextual Q&A\", body: \"Ask anything mid-lecture. Answers ground in the transcript at your current timestamp.\" },
  { icon: Clock, title: \"Jump-to-Moment\", body: \"AI returns clickable timestamps. One click and you are watching the exact moment.\" },
  { icon: FileText, title: \"Smart Summaries\", body: \"Topic, chapter, last 5 minutes, or the whole lecture - on demand, in seconds.\" },
  { icon: Brain, title: \"Flashcards & Quizzes\", body: \"Auto-generated study material from any lecture. Spaced repetition built in.\" },
  { icon: BookmarkPlus, title: \"Notes & Bookmarks\", body: \"Take notes pinned to timestamps. Bookmark key moments. Export as PDF.\" },
  { icon: Zap, title: \"Streaming AI\", body: \"Responses stream token-by-token with live citations to the lecture transcript.\" },
];

export default function Landing() {
  return (
    <div className=\"relative min-h-screen overflow-hidden\">
      <Aurora />
      <Navbar />

      {/* Hero */}
      <section className=\"relative\">
        <div className=\"mx-auto max-w-7xl px-4 md:px-8 pt-16 md:pt-28 pb-20 md:pb-32\">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: \"easeOut\" }}
            className=\"max-w-3xl\"
          >
            <div className=\"inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-zinc-300\">
              <span className=\"size-1.5 rounded-full bg-emerald-400 animate-pulse\" />
              RAG-powered learning, live now
            </div>
            <h1 className=\"mt-6 font-display text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95]\">
              Learn faster with<br />
              an AI that actually<br />
              <span className=\"aurora-text\">watched the lecture.</span>
            </h1>
            <p className=\"mt-6 max-w-xl text-base md:text-lg text-zinc-400 leading-relaxed\">
              Lumen.ai is a learning companion that understands every second of your lectures.
              Ask questions, jump to moments, generate flashcards, and turn passive watching into active mastery.
            </p>
            <div className=\"mt-8 flex flex-wrap items-center gap-3\">
              <Link to=\"/signup\">
                <Button size=\"lg\" className=\"rounded-full bg-white text-black hover:bg-zinc-200 px-7 h-12 text-base\" data-testid=\"hero-cta-signup\">
                  <GraduationCap className=\"size-4 mr-2\" /> Start learning free
                </Button>
              </Link>
              <Link to=\"/login\">
                <Button size=\"lg\" variant=\"outline\" className=\"rounded-full border-white/15 bg-white/5 hover:bg-white/10 h-12 px-6 text-base\" data-testid=\"hero-cta-login\">
                  <PlayCircle className=\"size-4 mr-2\" /> Watch demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Mock product card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className=\"mt-16 glass rounded-3xl p-3 md:p-4 relative\"
          >
            <div className=\"rounded-2xl overflow-hidden border border-white/10 bg-zinc-950\">
              <div className=\"flex items-center gap-1.5 px-4 py-3 border-b border-white/5\">
                <span className=\"size-2.5 rounded-full bg-rose-500/70\" />
                <span className=\"size-2.5 rounded-full bg-amber-500/70\" />
                <span className=\"size-2.5 rounded-full bg-emerald-500/70\" />
                <span className=\"ml-3 text-xs font-mono text-zinc-500\">lumen.ai/learn/neural-nets</span>
              </div>
              <div className=\"grid md:grid-cols-12 gap-0\">
                <div className=\"md:col-span-8 p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/5\">
                  <div className=\"aspect-video rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 grid place-items-center relative overflow-hidden\">
                    <img alt=\"lecture\" src=\"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80\" className=\"absolute inset-0 w-full h-full object-cover opacity-50\" />
                    <div className=\"relative size-16 rounded-full bg-white/90 grid place-items-center shadow-xl\">
                      <PlayCircle className=\"size-8 text-black\" />
                    </div>
                  </div>
                  <div className=\"mt-4 text-sm text-zinc-400\">
                    Neural Networks: From Perceptrons to Transformers · Dr. Maya Chen
                  </div>
                </div>
                <div className=\"md:col-span-4 p-4 md:p-6\">
                  <div className=\"text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500\">AI companion</div>
                  <div className=\"mt-3 space-y-3 text-sm\">
                    <div className=\"rounded-xl bg-white/5 px-3 py-2 border border-white/5\">What is multi-head attention?</div>
                    <div className=\"rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2\">
                      Multi-head attention runs several attention ops in parallel
                      <span className=\"inline-block ml-1 align-middle size-1.5 bg-amber-400 rounded-full animate-pulse\" />
                    </div>
                    <div className=\"flex flex-wrap gap-1.5 pt-1\">
                      <span className=\"text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full\">[08:00]</span>
                      <span className=\"text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full\">[09:20]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features bento */}
      <section id=\"features\" className=\"relative\">
        <div className=\"mx-auto max-w-7xl px-4 md:px-8 pb-24\">
          <div className=\"flex items-end justify-between flex-wrap gap-4\">
            <div>
              <div className=\"text-xs font-mono uppercase tracking-[0.2em] text-zinc-500\">Capabilities</div>
              <h2 className=\"mt-2 font-display text-3xl md:text-5xl font-black tracking-tight\">
                Built for the way<br />humans actually learn.
              </h2>
            </div>
            <p className=\"max-w-md text-zinc-400\">
              Every feature is grounded in the transcript - no hallucinations, only the lecture you are watching.
            </p>
          </div>

          <div className=\"mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6\">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className=\"group relative rounded-2xl border border-white/10 bg-zinc-950/60 p-6 md:p-7 overflow-hidden hover:border-white/20 transition-colors\"
                data-testid={`feature-${f.title.toLowerCase().replace(/[^a-z]+/g,'-')}`}
              >
                <div className=\"absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none\">
                  <div className=\"absolute inset-0 rounded-2xl shimmer\" />
                </div>
                <f.icon className=\"size-6 text-amber-400\" />
                <h3 className=\"mt-5 font-display text-xl font-bold\">{f.title}</h3>
                <p className=\"mt-2 text-sm text-zinc-400 leading-relaxed\">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id=\"how\" className=\"relative border-t border-white/5\">
        <div className=\"mx-auto max-w-7xl px-4 md:px-8 py-24\">
          <div className=\"max-w-2xl\">
            <div className=\"text-xs font-mono uppercase tracking-[0.2em] text-zinc-500\">Pipeline</div>
            <h2 className=\"mt-2 font-display text-3xl md:text-5xl font-black tracking-tight\">RAG, end-to-end.</h2>
            <p className=\"mt-4 text-zinc-400\">
              Transcripts are chunked and embedded. Your question is matched against the most relevant moments,
              then injected into Gemini 3 Flash with citations. The response streams back, token by token.
            </p>
          </div>
          <div className=\"mt-12 grid grid-cols-1 md:grid-cols-4 gap-4\">
            {[
              { n: \"01\", t: \"Ingest\", d: \"Lecture transcripts arrive with timestamps.\" },
              { n: \"02\", t: \"Chunk\", d: \"30-second windows become retrieval units.\" },
              { n: \"03\", t: \"Retrieve\", d: \"Top-k chunks ranked by semantic similarity.\" },
              { n: \"04\", t: \"Generate\", d: \"Gemini 3 Flash answers, streaming with citations.\" },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className=\"rounded-2xl border border-white/10 bg-zinc-950/60 p-6\"
              >
                <div className=\"font-mono text-xs text-amber-400\">{s.n}</div>
                <div className=\"mt-3 font-display text-lg font-bold\">{s.t}</div>
                <div className=\"mt-2 text-sm text-zinc-400\">{s.d}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id=\"pricing\" className=\"relative\">
        <div className=\"mx-auto max-w-7xl px-4 md:px-8 py-24\">
          <div className=\"relative rounded-3xl overflow-hidden border border-white/10 p-10 md:p-16 text-center\">
            <div className=\"absolute inset-0 aurora-bg opacity-70\" />
            <div className=\"relative\">
              <ShieldCheck className=\"mx-auto size-7 text-amber-400\" />
              <h2 className=\"mt-4 font-display text-3xl md:text-5xl font-black tracking-tight\">
                Turn every lecture into mastery.
              </h2>
              <p className=\"mt-4 max-w-xl mx-auto text-zinc-300\">
                Free to get started. No credit card. Three sample lectures pre-loaded so you can try the AI right now.
              </p>
              <div className=\"mt-8 flex justify-center gap-3 flex-wrap\">
                <Link to=\"/signup\">
                  <Button size=\"lg\" className=\"rounded-full bg-white text-black hover:bg-zinc-200 px-7 h-12\" data-testid=\"cta-signup-bottom\">
                    Create free account <ArrowRight className=\"size-4 ml-2\" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className=\"border-t border-white/5\">
        <div className=\"mx-auto max-w-7xl px-4 md:px-8 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-500\">
          <div className=\"flex items-center gap-2\">
            <Sparkles className=\"size-4 text-amber-400\" />
            <span>Lumen.ai · 2026</span>
          </div>
          <div className=\"font-mono text-xs\">Built with Gemini 3 Flash · React · FastAPI</div>
        </div>
      </footer>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Landing.jsx