Action: file_editor create /app/frontend/src/lib/utils.js --file-text "import { clsx } from \"clsx\";
import { twMerge } from \"tailwind-merge\";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTime(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, \"0\")}:${String(sec).padStart(2, \"0\")}`;
}
"
Observation: Failed to create file: File already exists at: /app/frontend/src/lib/utils.js. Use overwrite=True to replace