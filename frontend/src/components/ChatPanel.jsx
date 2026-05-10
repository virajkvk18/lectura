import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Mic, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import api, { streamChat } from "../lib/api";
import { formatTime } from "../lib/utils";

const SUGGESTIONS = [
  "Summarize what was just explained",
  "Explain this concept simply",
  "Give me a real-world example",
  "What should I understand from this?",
];

function TimestampText({ text, onSeek }) {
  const parts = text.split(/(\[\d{1,2}:\d{2}\])/g);
  return (
    <span>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d{1,2}):(\d{2})\]$/);
        if (m) {
          const t = parseInt(m[1]) * 60 + parseInt(m[2]);
          return (
            <button
              key={i}
              onClick={() => onSeek?.(t)}
              className="inline-flex items-center font-mono text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-1.5 py-0.5 rounded-full mx-0.5 align-middle transition-colors"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function Message({ msg, onSeek }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      {/* Citations */}
      {!isUser && msg.citations?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1 max-w-[85%]">
          {msg.citations.map((c, i) => (
            <button
              key={i}
              onClick={() => onSeek?.(c.start)}
              className="text-[10px] font-mono text-amber-300/70 bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/15 px-2 py-0.5 rounded-full transition-colors"
            >
              {formatTime(c.start)}
            </button>
          ))}
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-amber-500 to-rose-500 text-black font-medium rounded-br-md"
            : "bg-white/[0.05] border border-white/8 text-white/90 rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p>
                    {typeof children === "string"
                      ? <TimestampText text={children} onSeek={onSeek} />
                      : children}
                  </p>
                ),
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ lectureId, currentTime, onSeek }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [streamText, setStreamText] = useState("");
  const [pendingCitations, setPendingCitations] = useState([]);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/chat/history/${lectureId}`);
        setMessages(data);
      } catch {}
    })();
  }, [lectureId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const send = async (text) => {
    const msg = text?.trim() || input.trim();
    if (!msg || streaming) return;
    setInput("");

    const userMsg = { role: "user", content: msg, id: Date.now().toString(), citations: [] };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setStreamText("");
    setPendingCitations([]);

    abortRef.current = new AbortController();
    let accumulated = "";
    let citations = [];
    let sid = sessionId;

    try {
      await streamChat({
        lectureId,
        sessionId: sid,
        message: msg,
        currentTime,
        signal: abortRef.current.signal,
        onEvent: (event, data) => {
          if (event === "citations") {
            citations = data;
            setPendingCitations(data);
          } else if (event === "session") {
            sid = data.session_id;
            setSessionId(data.session_id);
          } else if (event === "token") {
            accumulated += data.t;
            setStreamText(accumulated);
          } else if (event === "done") {
            const assistantMsg = {
              id: data.message_id,
              role: "assistant",
              content: accumulated,
              citations,
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamText("");
            setPendingCitations([]);
          }
        },
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Chat error — please try again");
      }
      // If we have accumulated text, save it anyway
      if (accumulated) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: accumulated, citations },
        ]);
        setStreamText("");
      }
    } finally {
      setStreaming(false);
    }
  };

  const clearHistory = async () => {
    try {
      await api.delete(`/chat/history/${lectureId}`);
      setMessages([]);
      setSessionId(null);
      toast.success("Chat cleared");
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold">AI Companion</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-white/30 hover:text-white/60 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-1">Ask anything about this lecture</p>
            <p className="text-white/25 text-xs">AI answers are grounded in the transcript</p>
          </div>
        )}

        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} onSeek={onSeek} />
        ))}

        {/* Streaming message */}
        {streaming && streamText && (
          <div className="flex flex-col items-start gap-1">
            {pendingCitations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {pendingCitations.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => onSeek?.(c.start)}
                    className="text-[10px] font-mono text-amber-300/70 bg-amber-500/5 border border-amber-500/15 px-2 py-0.5 rounded-full"
                  >
                    {formatTime(c.start)}
                  </button>
                ))}
              </div>
            )}
            <div className="max-w-[85%] bg-white/[0.05] border border-white/8 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm text-white/90">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{streamText}</ReactMarkdown>
              </div>
              <span className="inline-block w-1 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" />
            </div>
          </div>
        )}

        {streaming && !streamText && (
          <div className="flex items-start gap-2">
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Thinking…
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white/70 px-3 py-1.5 rounded-full transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/5">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the lecture…"
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-500/30 resize-none transition-all"
            style={{ maxHeight: "120px" }}
            disabled={streaming}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || streaming}
            className="p-2.5 bg-gradient-to-br from-amber-500 to-rose-500 text-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
