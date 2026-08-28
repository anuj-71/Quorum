/**
 * Quorum — Secure Backend API Server
 *
 * This server is the ONLY place that touches the GEMINI_API_KEY.
 * The key is loaded from .env (gitignored) and never sent to the browser.
 * Key transport uses the secure 'x-goog-api-key' request header.
 * The frontend calls /api/llm — the key is injected here server-side.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// 1. Startup Validation: Port
const rawPort = process.env.PORT || '3001';
const parsedPort = parseInt(rawPort, 10);
if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  console.error(`[QUORUM SERVER] FATAL: Invalid PORT specified in environment: "${rawPort}". Must be 1-65535.`);
  process.exit(1);
}
const PORT = parsedPort;

// 2. Startup Validation: Gemini Model & Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const VALID_MODEL_PATTERN = /^gemini-[a-zA-Z0-9.-]+$/;
if (!VALID_MODEL_PATTERN.test(GEMINI_MODEL)) {
  console.warn(`[QUORUM SERVER] WARNING: GEMINI_MODEL "${GEMINI_MODEL}" may not be a standard Gemini identifier.`);
}

if (!GEMINI_API_KEY) {
  console.warn('[QUORUM SERVER] WARNING: GEMINI_API_KEY not set in .env — all requests will return OFFLINE_DEMO mode.');
} else {
  // Log only masked prefix for confirmation, never the full key
  console.log(`[QUORUM SERVER] GEMINI_API_KEY loaded (${GEMINI_API_KEY.slice(0, 8)}...) | Model: ${GEMINI_MODEL}`);
}

const app = express();

// 3. CORS Configuration
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. same-origin proxy, curl, mobile)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'OPTIONS']
  })
);

app.use(express.json({ limit: '2mb' }));

// 4. Rate Limiting: 60 requests/minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this client. Rate limit exceeded (60 req/min).',
    mode: 'RATE_LIMITED',
    text: '{}'
  }
});

app.use('/api/', apiLimiter);

/**
 * GET /api/status
 * Returns whether the server has a valid API key configured.
 * The key itself is NEVER included in the response.
 */
app.get('/api/status', (_req, res) => {
  res.json({
    mode: GEMINI_API_KEY ? 'LIVE_GEMINI' : 'OFFLINE_DEMO',
    model: GEMINI_API_KEY ? GEMINI_MODEL : null,
    keyConfigured: !!GEMINI_API_KEY
  });
});

/**
 * POST /api/llm
 * Proxies a structured LLM call to Gemini API using x-goog-api-key header.
 *
 * Request body: { systemPrompt: string, prompt: string, callType: string, agentRole?: string }
 * Response:     { text: string, modelUsed: string, durationMs: number, inputTokenCount: number, outputTokenCount: number }
 */
app.post('/api/llm', async (req, res) => {
  const { systemPrompt, prompt, callType, agentRole } = req.body;

  if (!systemPrompt || !prompt) {
    return res.status(400).json({ error: 'Missing systemPrompt or prompt in request body.' });
  }

  // If no key is configured, return a clear offline signal
  if (!GEMINI_API_KEY) {
    return res.status(200).json({
      text: '{}',
      modelUsed: 'OFFLINE_DEMO',
      mode: 'OFFLINE_DEMO',
      durationMs: 0,
      inputTokenCount: 0,
      outputTokenCount: 0
    });
  }

  const startTime = Date.now();

  // 5. 25-Second Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    // Key passed securely via x-goog-api-key header — NO key in URL query parameter!
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error(`[QUORUM SERVER] Gemini API error ${geminiResponse.status}: ${errText.slice(0, 200)}`);
      return res.status(502).json({
        error: `Gemini API returned ${geminiResponse.status}`,
        text: '{}',
        mode: 'LIVE_GEMINI_ERROR'
      });
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const durationMs = Date.now() - startTime;

    console.log(`[QUORUM SERVER] LLM call OK | callType=${callType} agentRole=${agentRole || 'n/a'} | ${durationMs}ms`);

    return res.json({
      text,
      modelUsed: GEMINI_MODEL,
      mode: 'LIVE_GEMINI',
      durationMs,
      inputTokenCount: Math.round((systemPrompt.length + prompt.length) / 4),
      outputTokenCount: Math.round(text.length / 4)
    });
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      console.error('[QUORUM SERVER] Gemini API request timed out after 25s');
      return res.status(504).json({
        error: 'Gemini API request timed out after 25s',
        text: '{}',
        mode: 'LIVE_GEMINI_ERROR'
      });
    }

    console.error('[QUORUM SERVER] Fetch to Gemini failed:', err.message);
    return res.status(500).json({ error: 'Internal proxy error', text: '{}', mode: 'LIVE_GEMINI_ERROR' });
  }
});

app.listen(PORT, () => {
  console.log(`[QUORUM SERVER] Running on http://localhost:${PORT}`);
  console.log(`[QUORUM SERVER] Mode: ${GEMINI_API_KEY ? 'LIVE_GEMINI' : 'OFFLINE_DEMO'}`);
});
