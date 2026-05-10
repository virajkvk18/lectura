Now let me create the VideoLearning page with all panels:
Action: file_editor create /app/frontend/src/components/VideoPlayer.jsx --file-text "import { useEffect, useRef, useState } from \"react\";
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge } from \"lucide-react\";
import { motion } from \"framer-motion\";
import { formatTime } from \"@/lib/utils\";

/** Custom HTML5 video player with chapter markers and bookmark dots. */
export default function VideoPlayer({
  src, chapters = [], bookmarks = [], duration = 0,
  onTimeUpdate, onSeek, registerSeekHandle,
}) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (registerSeekHandle) registerSeekHandle((t) => seek(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerSeekHandle]);

  const toggle = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };
  const seek = (t) => {
    const v = ref.current; if (!v) return;
    v.currentTime = t;
    setTime(t);
    onSeek?.(t);
  };
  const onTime = () => {
    const v = ref.current; if (!v) return;
    setTime(v.currentTime);
    onTimeUpdate?.(v.currentTime, v.duration || duration);
  };
  const setSpeed = (r) => {
    const v = ref.current; if (!v) return;
    v.playbackRate = r; setRate(r);
  };
  const fs = () => {
    const v = ref.current; if (!v) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else v.requestFullscreen?.();
  };

  const dur = duration || ref.current?.duration || 1;
  const pct = (time / dur) * 100;

  return (
    <div className=\"relative rounded-2xl overflow-hidden border border-white/10 bg-black group\" data-testid=\"video-player\">
      <video
        ref={ref}
        src={src}
        className=\"w-full aspect-video\"
        onClick={toggle}
        onTimeUpdate={onTime}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        playsInline
      />
      {/* Controls overlay */}
      <div className=\"absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/70 to-transparent\">
        {/* Timeline */}
        <div
          className=\"relative h-2 rounded-full bg-white/10 cursor-pointer\"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHover((x / rect.width) * dur);
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            seek((x / rect.width) * dur);
          }}
          data-testid=\"video-timeline\"
        >
          <div className=\"absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500\" style={{ width: `${pct}%` }} />
          {chapters.map((c, i) => (
            <div key={i} className=\"absolute top-0 -translate-x-1/2 w-px h-2 bg-white/40\" style={{ left: `${(c.start / dur) * 100}%` }} title={c.title} />
          ))}
          {bookmarks.map((b) => (
            <motion.div
              key={b.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className=\"absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 rounded-full bg-amber-400 ring-2 ring-black\"
              style={{ left: `${(b.timestamp / dur) * 100}%` }}
              title={b.label}
            />
          ))}
          {hover !== null && (
            <div className=\"absolute -top-7 -translate-x-1/2 text-[10px] font-mono px-1.5 py-0.5 bg-black/80 border border-white/10 rounded\" style={{ left: `${(hover / dur) * 100}%` }}>
              {formatTime(hover)}
            </div>
          )}
        </div>

        <div className=\"mt-2 flex items-center gap-3 text-zinc-200\">
          <button onClick={toggle} className=\"size-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors\" data-testid=\"video-play-btn\">
            {playing ? <Pause className=\"size-4\" /> : <Play className=\"size-4\" />}
          </button>
          <button onClick={() => { const v = ref.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } }} className=\"size-9 rounded-full hover:bg-white/10 grid place-items-center\" data-testid=\"video-mute-btn\">
            {muted ? <VolumeX className=\"size-4\" /> : <Volume2 className=\"size-4\" />}
          </button>
          <span className=\"font-mono text-xs text-zinc-300\">{formatTime(time)} / {formatTime(dur)}</span>
          <div className=\"ml-auto flex items-center gap-2\">
            <div className=\"flex items-center gap-1 text-xs\">
              <Gauge className=\"size-3.5\" />
              <select
                value={rate}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className=\"bg-transparent border border-white/10 rounded px-1.5 py-0.5 text-xs hover:border-white/20\"
                data-testid=\"video-speed\"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => <option key={r} value={r} className=\"bg-zinc-900\">{r}x</option>)}
              </select>
            </div>
            <button onClick={fs} className=\"size-9 rounded-full hover:bg-white/10 grid place-items-center\" data-testid=\"video-fs-btn\">
              <Maximize className=\"size-4\" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/VideoPlayer.jsx