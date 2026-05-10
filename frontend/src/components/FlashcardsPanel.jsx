Action: file_editor create /app/frontend/src/components/FlashcardsPanel.jsx --file-text "import { useState } from \"react\";
import { motion, AnimatePresence } from \"framer-motion\";
import { Loader2, RotateCw, ChevronLeft, ChevronRight, Sparkles } from \"lucide-react\";
import { toast } from \"sonner\";
import { Button } from \"@/components/ui/button\";
import api from \"@/lib/api\";

export default function FlashcardsPanel({ lectureId }) {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/flashcards/${lectureId}`);
      setCards(data.cards);
      setIdx(0); setFlipped(false);
    } catch (e) { toast.error(\"Flashcard generation failed\"); }
    finally { setLoading(false); }
  };

  const next = () => { setFlipped(false); setIdx((i) => (i + 1) % cards.length); };
  const prev = () => { setFlipped(false); setIdx((i) => (i - 1 + cards.length) % cards.length); };

  return (
    <div className=\"flex flex-col h-full\" data-testid=\"flashcards-panel\">
      <div className=\"flex items-center gap-2\">
        <Button size=\"sm\" onClick={generate} disabled={loading} className=\"rounded-full bg-white text-black hover:bg-zinc-200\" data-testid=\"generate-flashcards-btn\">
          {loading ? <><Loader2 className=\"size-3.5 mr-1.5 animate-spin\" /> Generating</> : <><Sparkles className=\"size-3.5 mr-1.5\" /> {cards.length ? \"Regenerate\" : \"Generate flashcards\"}</>}
        </Button>
        {cards.length > 0 && <span className=\"text-xs font-mono text-zinc-500 ml-auto\">{idx + 1} / {cards.length}</span>}
      </div>

      <div className=\"mt-6 flex-1 grid place-items-center\">
        {cards.length === 0 && !loading && (
          <div className=\"text-center text-zinc-500 text-sm\">No flashcards yet. Click generate.</div>
        )}
        {cards.length > 0 && (
          <div className=\"w-full max-w-md\">
            <div className=\"relative aspect-[3/2] [perspective:1200px]\" onClick={() => setFlipped((f) => !f)} data-testid=\"flashcard\">
              <AnimatePresence mode=\"wait\">
                <motion.div
                  key={`${idx}-${flipped}`}
                  initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className=\"absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 to-zinc-900 p-7 grid place-items-center cursor-pointer\"
                  style={{ transformStyle: \"preserve-3d\" }}
                >
                  <div className=\"text-center\">
                    <div className=\"text-[11px] font-mono uppercase tracking-[0.2em] text-amber-400 mb-3\">{flipped ? \"Answer\" : \"Question\"}</div>
                    <p className=\"font-display text-lg md:text-xl font-bold tracking-tight leading-snug\">{flipped ? cards[idx].back : cards[idx].front}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className=\"mt-4 flex items-center justify-center gap-2\">
              <Button size=\"icon\" variant=\"outline\" onClick={prev} className=\"rounded-full border-white/10 bg-white/5\" data-testid=\"flashcard-prev\"><ChevronLeft className=\"size-4\" /></Button>
              <Button size=\"sm\" variant=\"ghost\" onClick={() => setFlipped((f) => !f)} className=\"rounded-full\" data-testid=\"flashcard-flip\"><RotateCw className=\"size-4 mr-1.5\" /> Flip</Button>
              <Button size=\"icon\" variant=\"outline\" onClick={next} className=\"rounded-full border-white/10 bg-white/5\" data-testid=\"flashcard-next\"><ChevronRight className=\"size-4\" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/FlashcardsPanel.jsx