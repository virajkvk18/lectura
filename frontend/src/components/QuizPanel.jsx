Action: file_editor create /app/frontend/src/components/QuizPanel.jsx --file-text "import { useState } from \"react\";
import { motion } from \"framer-motion\";
import { Loader2, Sparkles, Check, X } from \"lucide-react\";
import { toast } from \"sonner\";
import { Button } from \"@/components/ui/button\";
import api from \"@/lib/api\";

export default function QuizPanel({ lectureId }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const generate = async () => {
    setLoading(true); setSubmitted(false); setAnswers({});
    try {
      const { data } = await api.post(`/quiz/${lectureId}`);
      setQuestions(data.questions);
    } catch (e) { toast.error(\"Quiz generation failed\"); }
    finally { setLoading(false); }
  };

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_index ? 1 : 0), 0);

  return (
    <div className=\"flex flex-col h-full\" data-testid=\"quiz-panel\">
      <div className=\"flex items-center gap-2\">
        <Button size=\"sm\" onClick={generate} disabled={loading} className=\"rounded-full bg-white text-black hover:bg-zinc-200\" data-testid=\"generate-quiz-btn\">
          {loading ? <><Loader2 className=\"size-3.5 mr-1.5 animate-spin\" /> Generating</> : <><Sparkles className=\"size-3.5 mr-1.5\" /> {questions.length ? \"New quiz\" : \"Generate quiz\"}</>}
        </Button>
        {submitted && <span className=\"ml-auto font-mono text-sm text-amber-300\">Score: {score} / {questions.length}</span>}
      </div>

      <div className=\"mt-4 flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-4\">
        {questions.length === 0 && !loading && (
          <div className=\"text-center text-zinc-500 text-sm mt-12\">No quiz yet. Click generate.</div>
        )}
        {questions.map((q, qi) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}
            className=\"rounded-2xl border border-white/10 bg-zinc-950 p-5\" data-testid={`quiz-q-${qi}`}>
            <div className=\"text-[11px] font-mono uppercase tracking-[0.2em] text-amber-400\">Question {qi + 1}</div>
            <h4 className=\"mt-1 font-display text-base md:text-lg font-bold tracking-tight\">{q.question}</h4>
            <div className=\"mt-3 space-y-2\">
              {q.options.map((opt, oi) => {
                const sel = answers[q.id] === oi;
                const correct = submitted && q.correct_index === oi;
                const wrong = submitted && sel && q.correct_index !== oi;
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    data-testid={`quiz-opt-${qi}-${oi}`}
                    className={`w-full text-left text-sm rounded-xl border px-3 py-2.5 transition-colors flex items-center gap-2 ${
                      correct ? \"border-emerald-500/60 bg-emerald-500/10\" :
                      wrong ? \"border-rose-500/60 bg-rose-500/10\" :
                      sel ? \"border-amber-500/60 bg-amber-500/10\" :
                      \"border-white/10 bg-white/5 hover:border-white/20\"
                    }`}
                  >
                    <span className=\"font-mono text-[11px] text-zinc-500 w-4\">{String.fromCharCode(65 + oi)}.</span>
                    <span className=\"flex-1\">{opt}</span>
                    {correct && <Check className=\"size-4 text-emerald-400\" />}
                    {wrong && <X className=\"size-4 text-rose-400\" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <div className=\"mt-3 text-xs text-zinc-400 border-t border-white/5 pt-3\">
                <span className=\"text-amber-400 font-mono uppercase tracking-[0.18em] text-[10px] mr-1\">Why</span>
                {q.explanation}
              </div>
            )}
          </motion.div>
        ))}
        {questions.length > 0 && !submitted && (
          <Button onClick={() => setSubmitted(true)} className=\"w-full rounded-full bg-white text-black hover:bg-zinc-200\" data-testid=\"quiz-submit-btn\">
            Submit answers
          </Button>
        )}
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/QuizPanel.jsx