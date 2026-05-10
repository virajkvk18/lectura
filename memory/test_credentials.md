Action: file_editor create /app/memory/test_credentials.md --file-text "# Test Credentials

Use these for end-to-end tests. The signup endpoint creates JWT-protected accounts; bcrypt password hashing.

| Role | Email | Password |
|------|-------|----------|
| Demo learner | demo@lumen.ai | demopass123 |
| Test user | test1@lumen.ai | testpass123 |

Notes for the testing agent:
- Backend health: `GET /api/` → `{ ok: true }`
- Login: `POST /api/auth/login` with `{ email, password }` → `{ access_token, user }`
- Auth header: `Authorization: Bearer <token>`
- Three sample lectures are seeded automatically on backend startup (ids: `lec-neural-nets`, `lec-rag`, `lec-prompt-eng`).
- Chat is SSE streaming at `POST /api/chat/stream`. Events: `citations`, `session`, `token`, `done`.
- All UI interactive elements have `data-testid` attributes.

If demo account does not exist, signup with the values above (idempotent: signup returns 400 if email taken — login then).
"
Observation: Failed to create file: File already exists at: /app/memory/test_credentials.md. Use overwrite=True to replace