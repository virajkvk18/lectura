Action: file_editor create /app/frontend/src/lib/api.js --file-text "import axios from \"axios\";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(\"lms_token\");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

/** Stream chat tokens via fetch (SSE). Calls onEvent(event, data) for each parsed event. */
export async function streamChat({ lectureId, sessionId, message, currentTime, onEvent, signal }) {
  const token = localStorage.getItem(\"lms_token\");
  const res = await fetch(`${API}/chat/stream`, {
    method: \"POST\",
    headers: {
      \"Content-Type\": \"application/json\",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      lecture_id: lectureId,
      session_id: sessionId || null,
      message,
      current_time: currentTime || 0,
    }),
    signal,
  });
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => \"\");
    throw new Error(`Chat stream failed: ${res.status} ${txt}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = \"\";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(\"\n\n\");
    buffer = parts.pop() || \"\";
    for (const block of parts) {
      const lines = block.split(\"\n\");
      let event = \"message\";
      let data = \"\";
      for (const ln of lines) {
        if (ln.startsWith(\"event:\")) event = ln.slice(6).trim();
        else if (ln.startsWith(\"data:\")) data += ln.slice(5).trim();
      }
      if (data) {
        try {
          onEvent(event, JSON.parse(data));
        } catch {
          onEvent(event, data);
        }
      }
    }
  }
}
"
Observation: Create successful: /app/frontend/src/lib/api.js