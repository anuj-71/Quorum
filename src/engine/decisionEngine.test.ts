import { describe, it, expect } from 'vitest';
import { computeNonAveragingDecision } from './decisionEngine';
import { PRELOADED_SCENARIOS } from '../data/preloadedCandidates';
import type { AgentOpinion, AgentRole } from '../types';

describe('DecisionEngine (Non-Averaging Bayesian Synthesis)', () => {
  it('correctly processes Candidate A with veto / concession adjustments', () => {
    const candidateA = PRELOADED_SCENARIOS.candidate_a;
    const dossier = computeNonAveragingDecision(
      candidateA.profile.id,
      candidateA.profile.name,
      candidateA.isolatedOpinions as Record<AgentRole, AgentOpinion>,
      candidateA.debateTurns
    );

    expect(dossier).toBeDefined();
    expect(dossier.candidateId).toBe('rohan-malhotra');
    expect(dossier.evidenceWeights.length).toBeGreaterThan(0);
    expect(dossier.scoringBreakdown.length).toBe(4);
    expect(dossier.nonAveragingRationale).toContain('Quorum');
  });

  it('correctly processes Candidate B with positive hiring consensus', () => {
    const candidateB = PRELOADED_SCENARIOS.candidate_b;
    const dossier = computeNonAveragingDecision(
      candidateB.profile.id,
      candidateB.profile.name,
      candidateB.isolatedOpinions as Record<AgentRole, AgentOpinion>,
      candidateB.debateTurns
    );

    expect(dossier).toBeDefined();
    expect(dossier.candidateId).toBe('ananya-iyer');
    expect(['STRONG_HIRE', 'HIRE', 'LEAN_HIRE']).toContain(dossier.recommendation);
    expect(dossier.confidencePercentage).toBeGreaterThanOrEqual(70);
  });

  it('triggers dealbreaker veto overrides when an agent raises CRITICAL_VETO', () => {
    const candidateA = PRELOADED_SCENARIOS.candidate_a;
    const opinionsWithVeto: Record<AgentRole, AgentOpinion> = {
      ...(candidateA.isolatedOpinions as Record<AgentRole, AgentOpinion>),
      skeptic: {
        ...(candidateA.isolatedOpinions.skeptic as AgentOpinion),
        verdict: 'CRITICAL_VETO' as const,
        score: 2.0,
        redFlags: [{ 
          lineNumber: 14, 
          quoteText: 'Uncorroborated production claim', 
          citationValid: true,
          source: 'transcript',
          relevanceScore: 1.0,
          verifiability: 'VERIFIED',
          commentary: 'Audit flag',
          evidenceStatus: 'sufficient'
        }]
      }
    };

    const dossier = computeNonAveragingDecision(
      'test-veto',
      'Test Candidate',
      opinionsWithVeto,
      candidateA.debateTurns
    );

    expect(dossier.isVetoTriggered).toBe(true);
    expect(['IMMEDIATE_VETO', 'CRITICAL_VETO', 'NO_HIRE', 'LEAN_NO_HIRE']).toContain(dossier.recommendation);
  });
});
