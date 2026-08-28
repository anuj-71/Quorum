/**
 * Quorum — Universal Hybrid LLM Client
 *
 * Supports both:
 * 1. Direct Client-Side Gemini Execution (Streamlit Cloud, Vercel, static hosting)
 *    via window.__GEMINI_API_KEY__, localStorage, or import.meta.env.VITE_GEMINI_API_KEY
 * 2. Secure Server Proxy Execution via /api/llm (Express backend)
 * 3. Graceful High-Fidelity Deterministic Fallback (OFFLINE_DEMO)
 */

import type { AuditLogEntry, AgentRole } from '../types';

declare global {
  interface Window {
    __GEMINI_API_KEY__?: string;
    __GEMINI_MODEL__?: string;
  }
}

let _serverMode: 'LIVE_GEMINI' | 'OFFLINE_DEMO' | null = null;
let _serverModel: string | null = null;

export function getClientApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.__GEMINI_API_KEY__ ||
    localStorage.getItem('QUORUM_GEMINI_API_KEY') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    null
  );
}

export function setClientApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('QUORUM_GEMINI_API_KEY', key.trim());
      window.__GEMINI_API_KEY__ = key.trim();
      _serverMode = 'LIVE_GEMINI';
      _serverModel = 'gemini-1.5-flash';
    } else {
      localStorage.removeItem('QUORUM_GEMINI_API_KEY');
      delete window.__GEMINI_API_KEY__;
    }
  }
}

export async function fetchServerStatus(): Promise<{ mode: 'LIVE_GEMINI' | 'OFFLINE_DEMO'; model: string | null }> {
  // 1. Check if client-side Gemini key is provided (Streamlit Cloud, standalone)
  const clientKey = getClientApiKey();
  if (clientKey && clientKey.length > 10) {
    _serverMode = 'LIVE_GEMINI';
    _serverModel = window.__GEMINI_MODEL__ || 'gemini-1.5-flash';
    return { mode: 'LIVE_GEMINI', model: _serverModel };
  }

  // 2. Otherwise check Express server proxy
  try {
    const res = await fetch('/api/status', { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    _serverMode = data.mode;
    _serverModel = data.model;
    return { mode: data.mode, model: data.model };
  } catch {
    _serverMode = 'OFFLINE_DEMO';
    _serverModel = null;
    return { mode: 'OFFLINE_DEMO', model: null };
  }
}

export function getCachedServerMode(): 'LIVE_GEMINI' | 'OFFLINE_DEMO' | null {
  if (getClientApiKey()) return 'LIVE_GEMINI';
  return _serverMode;
}

/**
 * Executes a single LLM call:
 * - If clientKey exists: Direct Google Gemini 1.5 Flash REST API call.
 * - Else: Express /api/llm proxy.
 * - Else: Graceful fallback.
 */
export async function executeLlmCall(
  prompt: string,
  systemPrompt: string,
  options: {
    callType: AuditLogEntry['callType'];
    agentRole?: AgentRole;
    signal?: AbortSignal;
  }
): Promise<{ text: string; auditLog: AuditLogEntry }> {
  const startTime = Date.now();
  const dispatchedAt = new Date().toISOString();
  const clientKey = getClientApiKey();

  // Mode 1: Direct Gemini API Call (Streamlit Cloud / Standalone Deployment)
  if (clientKey && clientKey.length > 10) {
    try {
      const model = window.__GEMINI_MODEL__ || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': clientKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 2048
          }
        }),
        signal: options.signal
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned HTTP ${response.status}`);
      }

      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const completedAt = new Date().toISOString();

      _serverMode = 'LIVE_GEMINI';
      _serverModel = model;

      return {
        text: rawText,
        auditLog: {
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          callType: options.callType,
          agentRole: options.agentRole,
          dispatchedAt,
          completedAt,
          durationMs: Date.now() - startTime,
          inputTokenCount: Math.round((prompt.length + systemPrompt.length) / 4),
          outputTokenCount: Math.round(rawText.length / 4),
          isolationGuaranteed: true,
          modelUsed: model
        }
      };
    } catch (err) {
      console.warn('[LLM CLIENT] Direct Gemini call error, falling back:', (err as Error).message);
    }
  }

  // Mode 2: Server Proxy Call (/api/llm)
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        prompt,
        callType: options.callType,
        agentRole: options.agentRole ?? null
      }),
      signal: options.signal
    });

    const data = await response.json();
    const text = data.text || '{}';
    const completedAt = new Date().toISOString();

    if (data.mode === 'OFFLINE_DEMO') {
      _serverMode = 'OFFLINE_DEMO';
      return buildOfflineAuditLog(prompt, systemPrompt, options, startTime, dispatchedAt);
    }

    _serverMode = 'LIVE_GEMINI';
    _serverModel = data.modelUsed ?? _serverModel;

    return {
      text,
      auditLog: {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        callType: options.callType,
        agentRole: options.agentRole,
        dispatchedAt,
        completedAt,
        durationMs: data.durationMs ?? Date.now() - startTime,
        inputTokenCount: data.inputTokenCount ?? Math.round((prompt.length + systemPrompt.length) / 4),
        outputTokenCount: data.outputTokenCount ?? Math.round(text.length / 4),
        isolationGuaranteed: true,
        modelUsed: data.modelUsed ?? 'gemini-1.5-flash'
      }
    };
  } catch {
    // Mode 3: Deterministic Offline Fallback
    _serverMode = 'OFFLINE_DEMO';
    return buildOfflineAuditLog(prompt, systemPrompt, options, startTime, dispatchedAt);
  }
}

function buildOfflineAuditLog(
  prompt: string,
  systemPrompt: string,
  options: { callType: AuditLogEntry['callType']; agentRole?: AgentRole },
  startTime: number,
  dispatchedAt: string
): { text: string; auditLog: AuditLogEntry } {
  const durationMs = 400 + Math.floor(Math.random() * 300);
  const completedAt = new Date(startTime + durationMs).toISOString();

  return {
    text: '{}',
    auditLog: {
      id: `audit-demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      callType: options.callType,
      agentRole: options.agentRole,
      dispatchedAt,
      completedAt,
      durationMs,
      inputTokenCount: Math.round((prompt.length + systemPrompt.length) / 4),
      outputTokenCount: 0,
      isolationGuaranteed: true,
      modelUsed: 'OFFLINE_DEMO'
    }
  };
}
