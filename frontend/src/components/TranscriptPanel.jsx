import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { formatTime } from "../lib/utils";

export default function TranscriptPanel({ segments = [], currentTime, onSeek }) {
  const [search, setSearch] = useState("");
  const activeRef = useRef(null);
  const containerRef = useRef(null);

  const filtered = search.trim()
    ? segments.filter((s) => s.text.toLowerCase().includes(search.toLowerCase()))
    : segments;

  const activeIdx = segments.findIndex(
    (s) => currentTime >= s.start && currentTime < s.end
  );

  useEffect(() => {
    if (activeRef.current && !search) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIdx, search]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcript…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
      </div>

      {/* Segments */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {filtered.length === 0 && (
          <p className="text-center text-white/30 text-xs py-8">No matches found</p>
        )}
        {filtered.map((seg, i) => {
          const isActive = !search && seg === segments[activeIdx];
          return (
            <button
              key={i}
              ref={isActive ? activeRef : null}
              onClick={() => onSeek?.(seg.start)}
              className={`w-full text-left flex gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <span
                className={`text-[10px] font-mono flex-shrink-0 mt-0.5 ${
                  isActive ? "text-amber-400" : "text-white/30 group-hover:text-white/50"
                }`}
              >
                {formatTime(seg.start)}
              </span>
              <span
                className={`text-xs leading-relaxed ${
                  isActive ? "text-white" : "text-white/60"
                }`}
              >
                {search ? (
                  <HighlightedText text={seg.text} query={search} />
                ) : (
                  seg.text
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HighlightedText({ text, query }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-500/30 text-amber-200 rounded px-0.5">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
