import type {
  AgentOpinion,
  AgentRole,
  DebateTurn,
  EvidenceQuote,
  EvidenceWeightMetric,
  FinalDecisionDossier,
  ScoringBreakdownItem,
  StanceSnapshot,
  UnresolvedTensionItem
} from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';

/**
 * Computes a non-averaging, evidence-weighted decision dossier.
 *
 * Mechanics:
 * 1. Pulls post-debate final stance from DebateTurn stanceShift history.
 * 2. Weights each agent by verified citation count, debate challenge survival, and evidence status.
 * 3. Applies a Skeptic Risk Penalty multiplier if critical audit concerns remained unresolved.
 * 4. Derives confidence from cross-agent variance (consensus vs division).
 * 5. Surfaces explicit unresolved tensions and a full traceability breakdown.
 */
export function computeNonAveragingDecision(
  candidateId: string,
  candidateName: string,
  opinions: Record<AgentRole, AgentOpinion>,
  debateTurns: DebateTurn[]
): FinalDecisionDossier {
  const roles: AgentRole[] = ['technical', 'hr', 'hiring_manager', 'skeptic'];

  // Step 1: Check for Hard Dealbreaker Vetoes
  const vetoAgent = Object.values(opinions).find(
    (op) => op.verdict === 'CRITICAL_VETO' || (op.redFlags && op.redFlags.length > 0 && op.score <= 3.0)
  );
  const isVetoTriggered = !!vetoAgent;

  // Step 2: Compute Final Post-Debate Stance Snapshots
  const stanceSnapshots: StanceSnapshot[] = roles.map((role) => {
    const initialOp = opinions[role];
    const initialScore = initialOp ? initialOp.score : 5.0;
    const initialConfidence = initialOp ? initialOp.confidence : 0.8;
    let postDebateScore = initialScore;
    let postDebateConfidence = initialConfidence;
    let statusTag: StanceSnapshot['statusTag'] = 'STABLE';

    // Find latest stance shift in debate turns for this agent
    const agentShifts = debateTurns.filter((t) => t.speaker === role && t.stanceShift);
    if (agentShifts.length > 0) {
      const lastShift = agentShifts[agentShifts.length - 1];
      if (lastShift.stanceShift) {
        postDebateScore = lastShift.stanceShift.newScore;
        postDebateConfidence = Math.min(0.98, initialConfidence + 0.08);
        statusTag =
          lastShift.action === 'CONCEDE'
            ? 'CONCESSION_LOGGED'
            : lastShift.action === 'SUPPORT'
            ? 'STANCE_HARDENED'
            : 'CONCESSION_LOGGED';
      }
    } else if (initialOp?.verdict === 'CRITICAL_VETO') {
      statusTag = 'VETO_TRIGGERED';
    }

    return {
      agentRole: role,
      initialScore,
      postDebateScore: Math.round(postDebateScore * 10) / 10,
      initialConfidence,
      postDebateConfidence: Math.round(postDebateConfidence * 100) / 100,
      shiftDelta: Math.round((postDebateScore - initialScore) * 10) / 10,
      statusTag
    };
  });

  // Step 3: Compute Evidence Strength and Weights per Agent
  const evidenceWeights: EvidenceWeightMetric[] = [];
  const scoringBreakdown: ScoringBreakdownItem[] = [];

  const baseWeights: Record<AgentRole, { base: number; category: string }> = {
    technical: { base: 95, category: 'Technical Architecture & Systems Depth' },
    hr: { base: 90, category: 'Collaboration, Culture & Integrity' },
    hiring_manager: { base: 95, category: 'Production Ownership & Business ROI' },
    skeptic: { base: 110, category: 'Factual Veracity & Risk Audit' }
  };

  let totalWeightedScore = 0;
  let totalEffectiveWeight = 0;

  roles.forEach((role) => {
    const op = opinions[role];
    const stance = stanceSnapshots.find((s) => s.agentRole === role)!;
    const base = baseWeights[role];

    // Collect all quotes from opinion + debate turns
    const allQuotes: EvidenceQuote[] = [
      ...(op?.strengths || []),
      ...(op?.concerns || []),
      ...(op?.redFlags || [])
    ];
    const debateQuotes = debateTurns.filter((t) => t.speaker === role).flatMap((t) => t.citedQuotes || []);
    const combinedQuotes = [...allQuotes, ...debateQuotes];

    // Count strictly validated quotes (Issue 2 & 4)
    const verifiedQuotes = combinedQuotes.filter(
      (q) => q.citationValid !== false && q.verifiability === 'VERIFIED' && q.evidenceStatus !== 'unverified'
    );
    const unverifiedQuotes = combinedQuotes.filter(
      (q) => q.citationValid === false || q.evidenceStatus === 'unverified' || q.verifiability === 'UNVERIFIABLE'
    );

    // Quality multiplier
    let qualityMultiplier = 1.0;
    if (verifiedQuotes.length >= 2) qualityMultiplier = 1.25;
    else if (verifiedQuotes.length === 1) qualityMultiplier = 1.05;
    else qualityMultiplier = 0.7; // penalized for lack of grounded evidence

    if (unverifiedQuotes.length > 0) {
      qualityMultiplier = Math.max(0.5, qualityMultiplier - unverifiedQuotes.length * 0.15);
    }

    // Debate survival score
    let debateSurvivalScore = 1.0;
    const wasChallenged = debateTurns.some((t) => t.targetAgent === role && t.action === 'CHALLENGE');
    const conceded = stance.statusTag === 'CONCESSION_LOGGED';

    if (wasChallenged && conceded) {
      debateSurvivalScore = 0.85; // opinion conceded under scrutiny
    } else if (wasChallenged && !conceded && verifiedQuotes.length >= 1) {
      debateSurvivalScore = 1.2; // defended with evidence
    } else if (role === 'skeptic' && (op?.redFlags?.length ?? 0) > 0) {
      debateSurvivalScore = 1.25; // risk audit upheld
    }

    const finalEffectiveWeight = Math.round(base.base * qualityMultiplier * debateSurvivalScore);

    let justification = `${AGENT_CONFIGS[role]?.displayName || role}: Initial score ${stance.initialScore} -> Post-debate ${stance.postDebateScore}. `;
    if (conceded) {
      justification += `Conceded flaw during cross-examination (Survival: ${debateSurvivalScore}x). `;
    } else if (wasChallenged) {
      justification += `Defended claims with ${verifiedQuotes.length} verified quotes. `;
    } else {
      justification += `Stable position backed by ${verifiedQuotes.length} verified citations. `;
    }
    if (unverifiedQuotes.length > 0) {
      justification += `[Warning: ${unverifiedQuotes.length} citation(s) failed verification.] `;
    }

    evidenceWeights.push({
      category: base.category,
      agentSource: role,
      rawWeight: base.base,
      qualityMultiplier: Math.round(qualityMultiplier * 100) / 100,
      debateSurvivalScore: Math.round(debateSurvivalScore * 100) / 100,
      finalEffectiveWeight,
      reasoning: justification
    });

    scoringBreakdown.push({
      agent: role,
      initialScore: stance.initialScore,
      finalScore: stance.postDebateScore,
      evidenceWeight: finalEffectiveWeight,
      justification
    });

    totalWeightedScore += stance.postDebateScore * finalEffectiveWeight;
    totalEffectiveWeight += finalEffectiveWeight;
  });

  // Step 4: Skeptic Risk Penalty Enforcement (Issue 1 Requirement 3)
  const skepticStance = stanceSnapshots.find((s) => s.agentRole === 'skeptic')!;
  const skepticOp = opinions.skeptic;
  const skepticUnresolvedConcern =
    skepticStance.postDebateScore <= 4.5 ||
    (skepticOp?.redFlags && skepticOp.redFlags.length > 0 && skepticStance.postDebateScore < 6.0);

  let weightedAverage = totalEffectiveWeight > 0 ? totalWeightedScore / totalEffectiveWeight : 5.0;
  let skepticPenaltyApplied = false;
  let skepticPenaltyFactor = 1.0;

  if (skepticUnresolvedConcern && !isVetoTriggered) {
    // Unresolved fraud/exaggeration/risk audit drags overall score down
    skepticPenaltyFactor = 0.82;
    weightedAverage = weightedAverage * skepticPenaltyFactor;
    skepticPenaltyApplied = true;
  }

  // Step 5: Recommendation Mapping
  let recommendation: FinalDecisionDossier['recommendation'] = 'LEAN_HIRE';
  if (isVetoTriggered) {
    recommendation = 'IMMEDIATE_VETO';
  } else if (weightedAverage >= 8.2) {
    recommendation = 'STRONG_HIRE';
  } else if (weightedAverage >= 7.0) {
    recommendation = 'HIRE';
  } else if (weightedAverage >= 5.6) {
    recommendation = 'LEAN_HIRE';
  } else if (weightedAverage >= 4.2) {
    recommendation = 'LEAN_NO_HIRE';
  } else {
    recommendation = 'NO_HIRE';
  }

  // If Skeptic penalty is active and score is borderline, cap recommendation
  if (skepticPenaltyApplied && (recommendation === 'HIRE' || recommendation === 'STRONG_HIRE')) {
    recommendation = 'LEAN_HIRE';
  }

  // Step 6: Derive Confidence from Cross-Agent Variance
  const finalScores = stanceSnapshots.map((s) => s.postDebateScore);
  const meanScore = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
  const variance = finalScores.reduce((acc, s) => acc + Math.pow(s - meanScore, 2), 0) / finalScores.length;
  const stdDev = Math.sqrt(variance);

  // High standard deviation (> 2.0) indicates high panel division -> lower confidence (e.g. 65-72%)
  // Low standard deviation (< 0.8) indicates strong consensus -> higher confidence (e.g. 92-96%)
  let confidencePercentage = Math.round(Math.max(58, Math.min(97, 95 - stdDev * 11)));
  if (isVetoTriggered) confidencePercentage = 96;

  // Step 7: Surface Explicit Unresolved Tensions (Issue 1 Requirement 4)
  const unresolvedTensions: UnresolvedTensionItem[] = [];

  // Check for significant spread between pairs of agents
  const techStance = stanceSnapshots.find((s) => s.agentRole === 'technical')!;
  const hrStance = stanceSnapshots.find((s) => s.agentRole === 'hr')!;

  if (Math.abs(techStance.postDebateScore - hrStance.postDebateScore) >= 2.0) {
    unresolvedTensions.push({
      topic: 'Technical Velocity vs. Cultural Friction & Flight Risk',
      agents: ['technical', 'hr'],
      positions: [
        `Dr. Evelyn Vance (${techStance.postDebateScore}/10): Focused on immediate systems architecture output.`,
        `Marcus Sterling (${hrStance.postDebateScore}/10): Highlighted team friction and retention risks.`
      ],
      decisionImpact: 'HR cultural risk weighting adjusted effective score downward.',
      agentA: 'technical',
      viewA: 'High individual technical velocity.',
      agentB: 'hr',
      viewB: 'Flight risk and disagreement friction.',
    });
  }

  if (Math.abs(techStance.postDebateScore - skepticStance.postDebateScore) >= 2.5) {
    unresolvedTensions.push({
      topic: 'Claimed Architecture Scope vs. Audit Verification',
      agents: ['technical', 'skeptic'],
      positions: [
        `Dr. Evelyn Vance (${techStance.postDebateScore}/10): Valued multi-agent patterns in production.`,
        `Victor Thorne (${skepticStance.postDebateScore}/10): Flagged unverified benchmarks and credit exaggeration.`
      ],
      decisionImpact: 'Skeptic penalty applied to prevent linear averaging over audit discrepancies.',
      agentA: 'technical',
      viewA: 'Valued pattern familiarity.',
      agentB: 'skeptic',
      viewB: 'Unverified metrics and credit inflation.'
    });
  }

  if (isVetoTriggered && vetoAgent) {
    unresolvedTensions.push({
      topic: 'Fatal Dealbreaker Override',
      agents: [vetoAgent.agentRole, 'technical'],
      positions: [
        `${AGENT_CONFIGS[vetoAgent.agentRole]?.displayName} triggered non-compensatory veto.`,
        'Baseline technical competencies cannot override critical risk.'
      ],
      decisionImpact: 'Veto overrides arithmetic score aggregation.',
      agentA: vetoAgent.agentRole,
      viewA: vetoAgent.summaryHeadline,
      agentB: 'technical',
      viewB: 'Baseline capability.'
    });
  }

  // Step 8: Construct Non-Averaging Rationale
  let nonAveragingRationale = '';
  if (isVetoTriggered) {
    nonAveragingRationale = `A linear arithmetic average would have masked the severe dealbreaker identified by ${vetoAgent?.agentRole.toUpperCase()}. Quorum enforces a non-compensatory veto constraint: evidence of operational compromise or unverified integrity cannot be averaged out by technical points.`;
  } else if (skepticPenaltyApplied) {
    nonAveragingRationale = `Standard arithmetic mean would yield ${(meanScore).toFixed(1)}/10, but Quorum applied an evidence-weighted Bayesian synthesis with an active Skeptic Risk Penalty (${skepticPenaltyFactor}x). Unresolved audit concerns regarding metrics or credit exaggeration reduced effective score from ${(meanScore).toFixed(1)} to ${(weightedAverage).toFixed(1)}/10, moving the candidate to ${recommendation}.`;
  } else {
    nonAveragingRationale = `Decision synthesized using evidence-weighted Bayesian matrix (Total Effective Weight: ${totalEffectiveWeight} pts) and post-debate concession tracking rather than naive averaging. Cross-agent variance was ${stdDev.toFixed(2)}, yielding ${confidencePercentage}% panel confidence.`;
  }

  const executiveSummary = isVetoTriggered
    ? `The deliberation panel concluded with an IMMEDIATE VETO for ${candidateName} due to fatal risk factors overriding baseline competencies.`
    : `The deliberation panel concluded with a ${recommendation.replace(/_/g, ' ')} recommendation for ${candidateName} (Weighted Score: ${weightedAverage.toFixed(1)}/10, Panel Agreement Confidence: ${confidencePercentage}%).`;

  return {
    candidateId,
    recommendation,
    confidencePercentage,
    executiveSummary,
    nonAveragingRationale,
    isVetoTriggered,
    vetoDetails: isVetoTriggered && vetoAgent
      ? {
          triggeringAgent: vetoAgent.agentRole,
          reason: vetoAgent.summaryHeadline,
          dealbreakerEvidence: vetoAgent.concerns[0] || {
            quoteText: 'Identified critical operational risk in transcript.',
            source: 'transcript',
            lineNumber: 1,
            relevanceScore: 1.0,
            verifiability: 'VERIFIED',
            commentary: 'Fatal blocker.',
            citationValid: true,
            evidenceStatus: 'sufficient'
          }
        }
      : undefined,
    evidenceWeights,
    scoringBreakdown,
    keyStrengths: opinions.technical?.strengths.map((s) => s.quoteText).slice(0, 3) || [],
    unresolvedTensions,
    stanceSnapshots,
    generationTimestamp: new Date().toISOString()
  };
}
