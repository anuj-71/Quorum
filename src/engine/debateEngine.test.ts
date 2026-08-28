import { describe, it, expect } from 'vitest';
import { generateDebateTurns, handleRecruiterInterjection } from './debateEngine';
import { PRELOADED_SCENARIOS } from '../data/preloadedCandidates';
import type { AgentOpinion, AgentRole } from '../types';

describe('DebateEngine (Sequential Cross-Examination)', () => {
  it('generates multi-turn debate sequence for preloaded candidate', async () => {
    const candidate = PRELOADED_SCENARIOS.candidate_a.profile;
    const opinions = PRELOADED_SCENARIOS.candidate_a.isolatedOpinions as Record<AgentRole, AgentOpinion>;

    const turns = await generateDebateTurns(candidate, opinions);
    expect(turns.length).toBeGreaterThanOrEqual(4);
    
    const firstTurn = turns[0];
    expect(firstTurn).toHaveProperty('roundNumber');
    expect(firstTurn).toHaveProperty('speaker');
    expect(firstTurn).toHaveProperty('statement');
    expect(firstTurn.statement.length).toBeGreaterThan(10);
  });

  it('processes recruiter 5th-chair interjection correctly', async () => {
    const candidate = PRELOADED_SCENARIOS.candidate_a.profile;
    const opinions = PRELOADED_SCENARIOS.candidate_a.isolatedOpinions as Record<AgentRole, AgentOpinion>;
    const existingTurns = PRELOADED_SCENARIOS.candidate_a.debateTurns;

    const interjectionTurns = await handleRecruiterInterjection(
      'What if candidate is placed on 3-month probation with mentor?',
      candidate,
      opinions,
      existingTurns
    );

    expect(interjectionTurns.length).toBe(2);
    expect(interjectionTurns[0].statement).toContain('probation');
  });
});
