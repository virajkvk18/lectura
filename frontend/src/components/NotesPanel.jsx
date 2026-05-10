Action: file_editor create /app/frontend/src/components/NotesPanel.jsx --file-text "import { useEffect, useState } from \"react\";
import { motion, AnimatePresence } from \"framer-motion\";
import { Plus, Trash2, BookmarkPlus, FileDown } from \"lucide-react\";
import { toast } from \"sonner\";
import jsPDF from \"jspdf\";

import { Button } from \"@/components/ui/button\";
import { Textarea } from \"@/components/ui/textarea\";
import api from \"@/lib/api\";
import { formatTime } from \"@/lib/utils\";

export default function NotesPanel({ lectureId, currentTime, onSeek, lectureTitle }) {
  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [draft, setDraft] = useState(\"\");

  const refresh = async () => {
    const [{ data: n }, { data: b }] = await Promise.all([
      api.get(`/notes/${lectureId}`),
      api.get(`/bookmarks/${lectureId}`),
    ]);
    setNotes(n);
    setBookmarks(b);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [lectureId]);

  const addNote = async () => {
    if (!draft.trim()) return;
    await api.post(\"/notes\", { lecture_id: lectureId, content: draft.trim(), timestamp: currentTime });
    setDraft(\"\");
    refresh();
    toast.success(\"Note saved\");
  };

  const delNote = async (id) => { await api.delete(`/notes/${id}`); refresh(); };

  const addBookmark = async () => {
    const label = prompt(\"Bookmark label\", `Important moment at ${formatTime(currentTime)}`);
    if (!label) return;
    await api.post(\"/bookmarks\", { lecture_id: lectureId, label, timestamp: currentTime });
    refresh();
    toast.success(\"Bookmarked\");
  };
  const delBookmark = async (id) => { await api.delete(`/bookmarks/${id}`); refresh(); };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Notes - ${lectureTitle || \"Lecture\"}`, 14, 18);
    doc.setFontSize(10);
    let y = 30;
    notes.forEach((n) => {
      const t = `[${formatTime(n.timestamp)}] ${n.content}`;
      const lines = doc.splitTextToSize(t, 180);
      if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
      doc.text(lines, 14, y);
      y += lines.length * 5 + 4;
    });
    doc.save(\"lumen-notes.pdf\");
  };

  return (
    <div className=\"flex flex-col h-full\" data-testid=\"notes-panel\">
      <div className=\"flex items-center gap-2\">
        <Button size=\"sm\" onClick={addBookmark} className=\"rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10\" data-testid=\"add-bookmark-btn\">
          <BookmarkPlus className=\"size-4 mr-1.5\" /> Bookmark @ {formatTime(currentTime)}
        </Button>
        <Button size=\"sm\" variant=\"ghost\" onClick={exportPdf} disabled={notes.length === 0} className=\"ml-auto\" data-testid=\"export-pdf-btn\">
          <FileDown className=\"size-4 mr-1.5\" /> PDF
        </Button>
      </div>

      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === \"Enter\" && (e.metaKey || e.ctrlKey)) addNote(); }}
        placeholder={`Take a note at ${formatTime(currentTime)}... (⌘/Ctrl+Enter to save)`}
        rows={3}
        className=\"mt-3 bg-zinc-950 border-zinc-800 focus-visible:ring-amber-500 resize-none\"
        data-testid=\"note-input\"
      />
      <Button onClick={addNote} className=\"mt-2 self-end rounded-full bg-white text-black hover:bg-zinc-200\" size=\"sm\" disabled={!draft.trim()} data-testid=\"add-note-btn\">
        <Plus className=\"size-4 mr-1\" /> Save note
      </Button>

      <div className=\"mt-4 flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1\">
        {bookmarks.length > 0 && (
          <div>
            <div className=\"text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2\">Bookmarks</div>
            <div className=\"space-y-1.5\">
              {bookmarks.map((b) => (
                <div key={b.id} className=\"flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2\">
                  <button onClick={() => onSeek?.(b.timestamp)} className=\"text-amber-300 font-mono text-xs hover:underline\" data-testid=\"bookmark-seek-btn\">{formatTime(b.timestamp)}</button>
                  <span className=\"text-sm text-zinc-300 truncate flex-1\">{b.label}</span>
                  <button onClick={() => delBookmark(b.id)} className=\"text-zinc-500 hover:text-rose-400\" data-testid=\"bookmark-del-btn\"><Trash2 className=\"size-3.5\" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className=\"text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2\">Notes</div>
          {notes.length === 0 && <div className=\"text-sm text-zinc-500\">No notes yet.</div>}
          <AnimatePresence>
            {notes.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className=\"rounded-xl border border-white/10 bg-zinc-950 p-3 mb-2\"
              >
                <div className=\"flex items-center gap-2\">
                  <button onClick={() => onSeek?.(n.timestamp)} className=\"text-amber-300 font-mono text-xs hover:underline\" data-testid=\"note-seek-btn\">{formatTime(n.timestamp)}</button>
                  <button onClick={() => delNote(n.id)} className=\"ml-auto text-zinc-500 hover:text-rose-400\" data-testid=\"note-del-btn\"><Trash2 className=\"size-3.5\" /></button>
                </div>
                <p className=\"mt-1 text-sm text-zinc-200 whitespace-pre-wrap\">{n.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/NotesPanel.jsx