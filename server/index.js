/**
 * Synapse Panel — Secure Backend API Server
 *
 * This server is the ONLY place that touches the GEMINI_API_KEY.
 * The key is loaded from .env (gitignored) and never sent to the browser.
 * The frontend calls /api/llm — the key is injected here server-side.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// GEMINI_API_KEY loaded from .env — never logged, never sent to client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!GEMINI_API_KEY) {
  console.warn('[QUORUM SERVER] WARNING: GEMINI_API_KEY not set in .env — all requests will return OFFLINE_DEMO mode.');
} else {
  // Log only first 8 chars for confirmation, never the full key
  console.log(`[QUORUM SERVER] GEMINI_API_KEY loaded (${GEMINI_API_KEY.slice(0, 8)}...) | Model: ${GEMINI_MODEL}`);
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

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
 * Proxies a structured LLM call to Gemini API.
 * The API key is injected here — browser never sees it.
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

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error(`[SYNAPSE SERVER] Gemini API error ${geminiResponse.status}: ${errText.slice(0, 200)}`);
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
    console.error('[QUORUM SERVER] Fetch to Gemini failed:', err.message);
    return res.status(500).json({ error: 'Internal proxy error', text: '{}', mode: 'LIVE_GEMINI_ERROR' });
  }
});

app.listen(PORT, () => {
  console.log(`[QUORUM SERVER] Running on http://localhost:${PORT}`);
  console.log(`[QUORUM SERVER] Mode: ${GEMINI_API_KEY ? 'LIVE_GEMINI' : 'OFFLINE_DEMO'}`);
});
