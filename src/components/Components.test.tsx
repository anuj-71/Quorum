import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { AgentCards } from './AgentCards';
import { FinalDossier } from './FinalDossier';
import { StanceRadar } from './StanceRadar';
import { PRELOADED_SCENARIOS } from '../data/preloadedCandidates';
import type { AgentOpinion, AgentRole } from '../types';

describe('UI Components (Stages 1, 2, and 3)', () => {
  const candidateA = PRELOADED_SCENARIOS.candidate_a;
  const mockSelectCitation = vi.fn();

  it('renders Stage 1 AgentCards with elevated verdict badges and isolation hashes', () => {
    const html = renderToString(
      React.createElement(AgentCards, {
        opinions: candidateA.isolatedOpinions as Record<AgentRole, AgentOpinion>,
        onSelectCitation: mockSelectCitation,
        activeCitation: null
      })
    );

    expect(html).toContain('Dr. Evelyn Vance');
    expect(html).toContain('Victor &quot;The Inquisitor&quot; Thorne');
    expect(html).toContain('Zero-Knowledge Token Isolation');
  });

  it('renders Stage 2 StanceRadar with agent score drifts', () => {
    const html = renderToString(
      React.createElement(StanceRadar, {
        snapshots: candidateA.finalDossier.stanceSnapshots
      })
    );

    expect(html).toContain('Opinion Shifts &amp; Stance Drift');
    expect(html).toContain('Dr. Evelyn Vance');
  });

  it('renders Stage 3 FinalDossier with executive recommendation and non-averaging rationale', () => {
    const html = renderToString(
      React.createElement(FinalDossier, {
        dossier: candidateA.finalDossier,
        candidateName: candidateA.profile.name,
        onSelectCitation: mockSelectCitation
      })
    );

    expect(html).toContain('EXECUTIVE DECISION SYNTHESIS');
    expect(html).toContain('Non-Averaging Evidence Synthesis Architecture');
    expect(html).toContain(candidateA.finalDossier.nonAveragingRationale);
  });
});
