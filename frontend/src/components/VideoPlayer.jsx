import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Bookmark, BookmarkCheck, ChevronRight, Settings,
} from "lucide-react";
import { formatTime } from "../lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({
  videoUrl,
  chapters = [],
  bookmarks = [],
  currentTime,
  onTimeUpdate,
  onSeekReady,
  onAddBookmark,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [showBmInput, setShowBmInput] = useState(false);
  const hideTimer = useRef(null);

  // Expose seek function to parent
  useEffect(() => {
    if (onSeekReady) {
      onSeekReady((t) => {
        if (videoRef.current) {
          videoRef.current.currentTime = t;
          videoRef.current.play().catch(() => {});
          setPlaying(true);
        }
      });
    }
  }, [onSeekReady]);

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setProgress(v.currentTime);
    setDuration(v.duration || 0);
    onTimeUpdate?.(v.currentTime, v.duration || 0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const t = ratio * (videoRef.current?.duration || 0);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setMuted(v === 0);
    }
  };

  const changeSpeed = (s) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const currentChapter = chapters.find(
    (ch) => progress >= ch.start && progress < ch.end
  );

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const bmPositions = bookmarks.map((b) => (duration > 0 ? (b.timestamp / duration) * 100 : 0));

  return (
    <div
      ref={containerRef}
      className="relative bg-black aspect-video group"
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* Chapter label */}
      {currentChapter && (
        <div className="absolute top-3 left-3 text-xs font-medium text-white/70 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
          {currentChapter.title}
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="px-3 mb-1">
          <div
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/bar hover:h-2.5 transition-all"
            onClick={handleSeek}
          >
            {/* Buffered */}
            <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full" style={{ width: "100%" }} />
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
              style={{ width: `${pct}%` }}
            />
            {/* Bookmark dots */}
            {bmPositions.map((p, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full -mt-0.5 pointer-events-none"
                style={{ left: `${p}%` }}
              />
            ))}
            {/* Chapter markers */}
            {chapters.map((ch, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none"
                style={{ left: `${(ch.start / (duration || 1)) * 100}%` }}
              />
            ))}
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `calc(${pct}% - 6px)` }}
            />
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-2 px-3 pb-3">
          <button onClick={togglePlay} className="text-white hover:text-amber-400 transition-colors">
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {/* Volume */}
          <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
            onChange={handleVolume}
            className="w-16 accent-amber-400 cursor-pointer"
          />

          <span className="text-xs text-white/50 font-mono ml-1">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Bookmark button */}
          <div className="relative">
            <button
              onClick={() => setShowBmInput(!showBmInput)}
              className="text-white/70 hover:text-amber-400 transition-colors"
              title="Add bookmark"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            {showBmInput && (
              <div
                className="absolute bottom-8 right-0 bg-zinc-900 border border-white/10 rounded-xl p-3 flex gap-2 w-52 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  autoFocus
                  value={bookmarkLabel}
                  onChange={(e) => setBookmarkLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onAddBookmark?.(bookmarkLabel || formatTime(progress), progress);
                      setBookmarkLabel("");
                      setShowBmInput(false);
                    }
                    if (e.key === "Escape") setShowBmInput(false);
                  }}
                  placeholder="Bookmark label…"
                  className="flex-1 bg-white/5 text-xs text-white px-2 py-1.5 rounded-lg focus:outline-none border border-white/10"
                />
                <button
                  onClick={() => {
                    onAddBookmark?.(bookmarkLabel || formatTime(progress), progress);
                    setBookmarkLabel("");
                    setShowBmInput(false);
                  }}
                  className="text-xs bg-amber-500 text-black font-bold px-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="text-xs text-white/60 hover:text-white transition-colors font-mono bg-white/5 px-2 py-1 rounded"
            >
              {speed}×
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-8 right-0 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors ${
                      speed === s ? "text-amber-400 font-bold" : "text-white/70"
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
