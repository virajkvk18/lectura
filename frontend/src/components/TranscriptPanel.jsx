Action: file_editor create /app/frontend/src/components/TranscriptPanel.jsx --file-text "import { useEffect, useRef } from \"react\";
import { motion } from \"framer-motion\";
import { formatTime } from \"@/lib/utils\";

/** Synced transcript with auto-highlight + click-to-seek. */
export default function TranscriptPanel({ segments = [], currentTime = 0, onSeek }) {
  const activeIdx = segments.findIndex((s) => currentTime >= s.start && currentTime < s.end);
  const ref = useRef(null);

  useEffect(() => {
    if (activeIdx < 0 || !ref.current) return;
    const el = ref.current.querySelector(`[data-idx='${activeIdx}']`);
    if (el) el.scrollIntoView({ block: \"center\", behavior: \"smooth\" });
  }, [activeIdx]);

  return (
    <div ref={ref} className=\"h-full overflow-y-auto scrollbar-thin pr-2 space-y-1.5\" data-testid=\"transcript-panel\">
      {segments.map((s, i) => {
        const active = i === activeIdx;
        return (
          <motion.button
            key={i}
            data-idx={i}
            onClick={() => onSeek?.(s.start)}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors flex gap-3 ${
              active ? \"bg-amber-500/10 border border-amber-500/40\" : \"border border-transparent hover:bg-white/5\"
            }`}
            data-testid={`transcript-seg-${i}`}
          >
            <span className={`shrink-0 font-mono text-[11px] mt-0.5 ${active ? \"text-amber-300\" : \"text-zinc-500\"}`}>
              {formatTime(s.start)}
            </span>
            <span className={`text-sm leading-relaxed ${active ? \"text-white\" : \"text-zinc-400\"}`}>{s.text}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/TranscriptPanel.jsx