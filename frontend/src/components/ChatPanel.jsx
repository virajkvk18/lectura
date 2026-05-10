Action: file_editor create /app/frontend/src/components/ChatPanel.jsx --file-text "import { useEffect, useRef, useState } from \"react\";
import ReactMarkdown from \"react-markdown\";
import { motion, AnimatePresence } from \"framer-motion\";
import { Send, Sparkles, Mic, Square } from \"lucide-react\";
import { toast } from \"sonner\";

import { Button } from \"@/components/ui/button\";
import { Textarea } from \"@/components/ui/textarea\";
import api, { streamChat } from \"@/lib/api\";
import { formatTime } from \"@/lib/utils\";

const SUGGESTIONS = [
  \"Summarize what was just said\",
  \"Explain this concept simply\",
  \"Give me an example\",
  \"What should I learn next?\",
];

/** Click [mm:ss] in markdown to seek the player. */
function renderInlineTimestamps(text, onSeek) {
  const parts = text.split(/(\[\d{1,2}:\d{2}\])/g);
  return parts.map((p, i) => {
    const m = p.match(/^\[(\d{1,2}):(\d{2})\]$/);
    if (m) {
      const t = parseInt(m[1]) * 60 + parseInt(m[2]);
      return (
        <button
          key={i}
          onClick={() => onSeek?.(t)}
          className=\"inline-flex items-center font-mono text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-1.5 py-0.5 rounded-full mx-0.5 align-middle\"
          data-testid=\"chat-timestamp-pill\"
        >
          {p}
        </button>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export default function ChatPanel({ lectureId, currentTime, onSeek }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(\"\");
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/chat/history/${lectureId}`);
        setMessages(data);
        if (data.length) setSessionId(data[data.length - 1].session_id);
      } catch (_) {}
    })();
  }, [lectureId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: \"smooth\" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput(\"\");
    const userMsg = { id: `u-${Date.now()}`, role: \"user\", content: msg, citations: [] };
    const aiMsg = { id: `a-${Date.now()}`, role: \"assistant\", content: \"\", citations: [] };
    setMessages((m) => [...m, userMsg, aiMsg]);
    setStreaming(true);
    try {
      await streamChat({
        lectureId,
        sessionId,
        message: msg,
        currentTime,
        onEvent: (event, data) => {
          if (event === \"session\") setSessionId(data.session_id);
          else if (event === \"citations\") {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { ...copy[copy.length - 1], citations: data };
              return copy;
            });
          } else if (event === \"token\") {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + (data.t || \"\") };
              return copy;
            });
          }
        },
      });
    } catch (e) {
      toast.error(\"Chat failed: \" + (e.message || \"unknown\"));
    } finally {
      setStreaming(false);
    }
  };

  // Voice input via Web Speech API
  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.info(\"Voice input not supported in this browser\"); return; }
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = \"en-US\";
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(\"\");
      setInput(t);
    };
    rec.onend = () => setRecording(false);
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };

  return (
    <div className=\"flex flex-col h-full\" data-testid=\"chat-panel\">
      <div ref={scrollRef} className=\"flex-1 overflow-y-auto scrollbar-thin px-1 pb-2 space-y-3\">
        {messages.length === 0 && (
          <div className=\"text-center mt-8 px-4\">
            <div className=\"mx-auto size-12 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 grid place-items-center\">
              <Sparkles className=\"size-5 text-black\" />
            </div>
            <h4 className=\"mt-4 font-display text-lg font-bold\">Ask anything</h4>
            <p className=\"mt-1 text-sm text-zinc-400\">The AI knows this exact lecture, second by second.</p>
            <div className=\"mt-5 grid grid-cols-1 gap-2\">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className=\"text-left text-sm text-zinc-300 rounded-xl border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 px-3 py-2 transition-colors\"
                  data-testid=\"chat-suggestion-btn\"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl px-4 py-3 ${
                m.role === \"user\"
                  ? \"bg-white/5 border border-white/10 ml-6\"
                  : \"bg-amber-500/5 border border-amber-500/20 mr-6\"
              }`}
              data-testid={`chat-msg-${m.role}`}
            >
              {m.role === \"assistant\" && (
                <div className=\"flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 mb-1\">
                  <Sparkles className=\"size-3\" /> Lumen AI
                </div>
              )}
              <div className=\"prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0\">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p>{Array.isArray(children) ? children.map((c, i) => typeof c === \"string\" ? <span key={i}>{renderInlineTimestamps(c, onSeek)}</span> : c) : children}</p>,
                    li: ({ children }) => <li>{Array.isArray(children) ? children.map((c, i) => typeof c === \"string\" ? <span key={i}>{renderInlineTimestamps(c, onSeek)}</span> : c) : children}</li>,
                  }}
                >
                  {m.content || (streaming && m.role === \"assistant\" ? \"▍\" : \"\")}
                </ReactMarkdown>
              </div>
              {m.role === \"assistant\" && m.citations?.length > 0 && (
                <div className=\"mt-2 flex flex-wrap gap-1.5\">
                  {m.citations.slice(0, 5).map((c, i) => (
                    <button
                      key={i}
                      onClick={() => onSeek?.(c.start)}
                      className=\"text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-2 py-0.5 rounded-full transition-colors\"
                      data-testid=\"chat-citation-btn\"
                      title={c.text}
                    >
                      [{formatTime(c.start)}]
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className=\"border-t border-white/10 pt-3 mt-2\">
        <div className=\"relative\">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === \"Enter\" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder=\"Ask about this lecture...\"
            rows={2}
            className=\"bg-zinc-950 border-zinc-800 focus-visible:ring-amber-500 pr-24 resize-none\"
            data-testid=\"chat-input\"
          />
          <div className=\"absolute right-2 bottom-2 flex items-center gap-1\">
            <Button size=\"icon\" variant=\"ghost\" onClick={toggleVoice} className=\"size-8\" data-testid=\"chat-voice-btn\" title=\"Voice input\">
              {recording ? <Square className=\"size-4 text-rose-400\" /> : <Mic className=\"size-4\" />}
            </Button>
            <Button size=\"icon\" onClick={() => send()} disabled={streaming || !input.trim()} className=\"size-8 bg-white text-black hover:bg-zinc-200 rounded-full\" data-testid=\"chat-send-btn\">
              <Send className=\"size-4\" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/ChatPanel.jsx