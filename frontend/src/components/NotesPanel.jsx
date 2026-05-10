import { useEffect, useState } from "react";
import { Plus, Trash2, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatTime } from "../lib/utils";

export default function NotesPanel({ lectureId, currentTime, onSeek }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/notes/${lectureId}`)
      .then(({ data }) => setNotes(data))
      .catch(() => {});
  }, [lectureId]);

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post("/notes", {
        lecture_id: lectureId,
        content: content.trim(),
        timestamp: currentTime,
      });
      setNotes((prev) => [...prev, data]);
      setContent("");
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add note */}
      <div className="p-4 border-b border-white/5">
        <div className="text-xs text-white/30 mb-2 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Note at {formatTime(currentTime)}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save();
          }}
          placeholder="Type a note… (Ctrl+Enter to save)"
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-amber-500/30 resize-none transition-all"
        />
        <button
          onClick={save}
          disabled={!content.trim() || saving}
          className="mt-2 flex items-center gap-1.5 text-xs bg-amber-500/80 hover:bg-amber-500 text-black font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {notes.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-7 h-7 text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-xs">No notes yet. Add your first note above.</p>
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white/[0.03] border border-white/8 rounded-xl p-3 group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <button
                onClick={() => onSeek?.(note.timestamp)}
                className="text-[10px] font-mono text-amber-400/70 hover:text-amber-400 transition-colors bg-amber-500/5 border border-amber-500/15 px-1.5 py-0.5 rounded-full"
              >
                {formatTime(note.timestamp)}
              </button>
              <button
                onClick={() => remove(note.id)}
                className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
