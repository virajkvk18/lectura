/**
 * Format seconds to mm:ss string
 */
export function formatTime(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Truncate text to maxLen characters
 */
export function truncate(text, maxLen = 100) {
  if (!text) return "";
  return text.length <= maxLen ? text : text.slice(0, maxLen) + "…";
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
