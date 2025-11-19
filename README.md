# Aru.ai

This workspace contains the full-stack chat experience powered by Gemini. The backend exposes REST APIs for auth/chat and proxies every AI request through Google AI Studio. The frontend is a Vite + React SPA that talks to the backend only (no API keys in the browser).

## Prerequisites

- Node.js 20+
- npm 10+
- A Google AI Studio API key with access to the Gemini model you plan to use

## Backend setup

```bash
cd backend
cp .env.example .env   # fill in GEMINI_API_KEY, JWT secret, etc.
npm install
npm run check:gemini "Say hello"  # optional sanity check (requires valid API key)
npm start
```

Notes:
- If `MONGODB_URI` is omitted the server falls back to an in-memory MongoDB instance for local testing.
- `GEMINI_MODEL` defaults to `gemini-2.5-flash`. Override it in `.env` if you need a different model.
- `npm run check:gemini` loads `backend/.env` and executes a one-off prompt through `generateGeminiResponse`, making it easy to verify connectivity outside of the chat UI.

## Frontend setup

```bash
cd frontend
cp .env.example .env  # optional; set VITE_API_BASE_URL if backend not on localhost:5000
npm install
npm run dev
```

The frontend expects `API_BASE_URL` (defaults to `http://localhost:5000`) and includes the JWT obtained via the auth API when calling `/api/chats`. After each user message it renders the Gemini answer returned by the backend.

## Verifying Gemini integration end-to-end

1. Run `npm run check:gemini` in `backend/` to confirm Gemini credentials & model selection.
2. Start the backend (`npm start`) and frontend (`npm run dev`).
3. Sign up/log in via the UI, send a chat message, and confirm that the assistant bubble contains the Gemini output.

If the Gemini request fails at runtime the backend logs the underlying error and returns a friendly fallback message so the chat UI keeps working.
