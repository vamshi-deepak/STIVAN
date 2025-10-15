Backend Chatbot (Gemini) Integration

What I added
- POST /api/chat route (backend)
  - File: `backend/routes/chatRoutes.js`
  - Controller: `backend/controllers/chatController.js`
  - Service: `backend/services/chatService.js` (uses existing `backend/config/gemini.js` genAI)
- Direct test script: `backend/scripts/testChatDirect.js`

Environment
- Ensure `backend/.env` contains `GEMINI_API_KEY` (the project already had this key in `.env`).
- Backend port: default `5050`.

Run locally
1. Start backend:

```powershell
cd backend; node Server.js
```

2. Start frontend (in another terminal):

```powershell
cd frontend; npm start
```

Test the chat endpoint (PowerShell):

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5050/api/chat" -Body (ConvertTo-Json @{ message = 'Hello, give me 3 growth ideas for a seed SaaS' }) -ContentType 'application/json'
```

Or run the direct test script (bypasses server):

```powershell
cd backend; node scripts/testChatDirect.js "Give me 3 growth experiments for a SaaS"
```

Notes & Next steps
- The frontend Chat page is at `/chat` (protected route). It calls `API_ENDPOINTS.chat` defined in `frontend/src/config/api.js`.
- The current implementation returns the raw Gemini response text. For production, consider:
  - Sanitizing and trimming responses.
  - Streaming responses for lower latency.
  - Adding rate-limiting and auth checks to prevent abuse.
  - Saving chat history per user in the database (`models/Idea.js` or a new model).
- I left a simple fallback when Gemini fails. You can improve the fallback behavior.

Content restrictions and filtering
- The chatbot is restricted to startup-related content only: ideas, suggestions, product enhancements, growth/traction experiments, fundraising, team advice, pricing, go-to-market strategy, and related doubts.
- Incoming messages are run through a basic keyword-based filter (`backend/middleware/chatFilter.js`). Messages that contain disallowed content (adult/sexual, illegal instructions, violent/hateful language, explicit political campaigning, etc.) are rejected with HTTP 403.
- Messages that do not contain startup-related keywords are rejected with HTTP 422 with a message asking the user to focus on startup topics.
- The assistant prompt in `backend/services/chatService.js` is also strict: the model is instructed to refuse any off-topic request with a canned refusal message.

Chat history & metrics
- Chat messages are saved for authenticated users in `backend/models/ChatMessage.js` (fields: user, role, text, metadata, createdAt).
- Users can retrieve their messages via GET `/api/chat/history` (requires Authorization header with Bearer token).
- Simple in-memory metrics are tracked in `backend/services/chatMetrics.js` (blockedAttempts, acceptedQueries). For dev inspection, GET `/api/dev/chat-metrics` returns current counts.
- For production, replace metrics with a persistent counter (Prometheus, Datadog, etc.) and consider storing messages in a separate analytics DB or S3 for long-term retention.

Authentication & account lock settings
- The app supports locking accounts after repeated failed login attempts. Configure the behavior via `.env`:
  - `MAX_LOGIN_ATTEMPTS` (default 5) — number of failed attempts before lock.
  - `ACCOUNT_LOCK_TIME` (ms, default 7200000) — lock duration in milliseconds.
  - `ACCOUNT_LOCK_TIME_MINUTES` (optional, default 120) — human-friendly alias in minutes.
  
Example: `MAX_LOGIN_ATTEMPTS=3` and `ACCOUNT_LOCK_TIME_MINUTES=30` will lock an account for 30 minutes after 3 failed attempts.

If you want, I can now:
- Save chat history per user.
- Add streaming responses for better UX.
- Add tests for the chat controller/service.
