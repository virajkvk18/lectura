Action: file_editor create /app/frontend/src/components/SummaryPanel.jsx --file-text "import { useState } from \"react\";
import { motion } from \"framer-motion\";
import ReactMarkdown from \"react-markdown\";
import { FileText, Sparkles, Loader2 } from \"lucide-react\";
import { toast } from \"sonner\";

import { Button } from \"@/components/ui/button\";
import api from \"@/lib/api\";

const KINDS = [
  { key: \"full\", label: \"Full lecture\" },
  { key: \"last_5\", label: \"Last 5 minutes\" },
  { key: \"chapter\", label: \"Current chapter\" },
];

export default function SummaryPanel({ lectureId, lecture, currentTime }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async (kind) => {
    setLoading(true); setSummary(null);
    try {
      const body = { lecture_id: lectureId, kind };
      if (kind === \"last_5\") body.current_time = currentTime;
      if (kind === \"chapter\") {
        const idx = (lecture?.chapters || []).findIndex((c) => currentTime >= c.start && currentTime < c.end);
        body.chapter_index = idx >= 0 ? idx : 0;
      }
      const { data } = await api.post(\"/summary\", body);
      setSummary(data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || \"Summary failed\");
    } finally { setLoading(false); }
  };

  return (
    <div className=\"flex flex-col h-full\" data-testid=\"summary-panel\">
      <div className=\"flex flex-wrap gap-2\">
        {KINDS.map((k) => (
          <Button
            key={k.key}
            size=\"sm\"
            variant=\"outline\"
            onClick={() => generate(k.key)}
            disabled={loading}
            className=\"rounded-full border-white/10 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/40 text-white\"
            data-testid={`summary-${k.key}-btn`}
          >
            <Sparkles className=\"size-3.5 mr-1.5 text-amber-400\" />
            {k.label}
          </Button>
        ))}
      </div>

      <div className=\"mt-4 flex-1 overflow-y-auto scrollbar-thin pr-1\">
        {loading && (
          <div className=\"rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-2\">
            <div className=\"flex items-center gap-2 text-amber-400 text-sm\"><Loader2 className=\"size-4 animate-spin\" /> Generating with Gemini 3 Flash...</div>
            <div className=\"space-y-2 mt-3\">
              {[80, 65, 90, 50].map((w, i) => (
                <div key={i} className=\"h-3 rounded bg-white/5 shimmer\" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}

        {summary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className=\"rounded-2xl border border-white/10 bg-zinc-950 p-5\" data-testid=\"summary-result\">
            <div className=\"flex items-center gap-2\">
              <FileText className=\"size-4 text-amber-400\" />
              <h4 className=\"font-display text-lg font-bold\">{summary.title}</h4>
            </div>
            {summary.bullets?.length > 0 && (
              <ul className=\"mt-3 space-y-1.5 text-sm text-zinc-300\">
                {summary.bullets.map((b, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className=\"flex gap-2\">
                    <span className=\"text-amber-400 mt-0.5\">•</span><span>{b}</span>
                  </motion.li>
                ))}
              </ul>
            )}
            {summary.text && (
              <div className=\"mt-4 prose prose-invert prose-sm max-w-none\">
                <ReactMarkdown>{summary.text}</ReactMarkdown>
              </div>
            )}
          </motion.div>
        )}

        {!summary && !loading && (
          <div className=\"text-center mt-12 text-zinc-500 text-sm\">
            Pick a summary type above to generate.
          </div>
        )}
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/SummaryPanel.jsx