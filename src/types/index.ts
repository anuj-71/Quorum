// Core TypeScript Definitions for Synapse Panel

export type AgentRole = 'technical' | 'hr' | 'hiring_manager' | 'skeptic';

export interface SkillItem {
  name: string;
  category: 'core' | 'framework' | 'infra' | 'soft';
  proficiency?: string;
  verified: boolean;
}

export interface CandidateClaim {
  id: string;
  claim: string;
  source: 'resume' | 'transcript';
  lineNumber: number;
  rawQuote: string;
  category: 'metric' | 'leadership' | 'technical' | 'timeline';
}

export interface MissingInfoItem {
  field: string;
  status: 'MISSING' | 'AMBIGUOUS' | 'UNVERIFIABLE' | 'INSUFFICIENT_DATA';
  description: string;
  impactOnScore: string;
}

export interface JobDescription {
  id: string;
  roleTitle: string;
  company: string;
  experienceRequired: string;
  coreResponsibilities: string[];
  mandatorySkills: string[];
  culturalValues: string[];
  dealbreakers: string[];
  rawText: string;
}

export interface CandidateProfile {
  id: string;
  officialArtifactId?: string; // e.g. "03_Resume_A.pdf & 05_Transcript_A.pdf"
  name: string;
  targetRole: string;
  archetypeTitle: string; // e.g. "The Brilliant Jerk", "The Resume Inflator"
  archetypeDescription: string;
  avatarUrl?: string;
  experienceYears: number;
  resumeRawText: string;
  transcriptRawText: string;
  skills: SkillItem[];
  claims: CandidateClaim[];
  education: string;
  currentCompany: string;
  missingInfoAudit?: MissingInfoItem[];
}

export interface EvidenceQuote {
  quoteText: string;
  source: 'resume' | 'transcript' | 'job_description';
  lineNumber: number;
  relevanceScore: number; // 0.0 - 1.0
  verifiability: 'VERIFIED' | 'DISPUTED' | 'UNVERIFIABLE' | 'INSUFFICIENT_DATA';
  commentary: string;
  citationValid: boolean; // Issue 2: Code-enforced substring/fuzzy match against source text
  evidenceStatus: 'sufficient' | 'insufficient' | 'unverified'; // Issue 4: Explicit evidence sufficiency
}

export interface AgentPersonaConfig {
  id: AgentRole;
  displayName: string;
  title: string;
  avatarIcon: string;
  neonColor: string; // e.g. "#00f0ff"
  neonBg: string;    // e.g. "rgba(0, 240, 255, 0.12)"
  neonBorder: string;
  voicePitch: number;
  voiceRate: number;
  voiceNameHint?: string;
  focusArea: string;
  motto: string;
}

export interface AgentOpinion {
  agentRole: AgentRole;
  score: number; // 1-10
  confidence: number; // 0.0 - 1.0
  verdict: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'LEAN_NO_HIRE' | 'NO_HIRE' | 'CRITICAL_VETO';
  summaryHeadline: string;
  detailedAnalysis: string;
  strengths: EvidenceQuote[];
  concerns: EvidenceQuote[];
  redFlags?: EvidenceQuote[];
  unclearOrMissingInfo?: MissingInfoItem[];
  executionTimestamp: string;
  isolationHash: string; // Proves zero-knowledge isolation
}

export type DebateAction = 'CHALLENGE' | 'CONCEDE' | 'SUPPORT' | 'DEFEND' | 'RAISE_VETO' | 'COUNTER_EVIDENCE' | 'CLARIFY';

export interface DebateTurn {
  id: string;
  roundNumber: number;
  speaker: AgentRole;
  targetAgent?: AgentRole;
  action: DebateAction;
  statement: string;
  citedQuotes: EvidenceQuote[];
  stanceShift?: {
    previousScore: number;
    newScore: number;
    reasonForShift: string;
  };
  audioDurationSec?: number;
}

export interface StanceSnapshot {
  agentRole: AgentRole;
  initialScore: number;
  postDebateScore: number;
  initialConfidence: number;
  postDebateConfidence: number;
  shiftDelta: number;
  statusTag: 'STABLE' | 'CONCESSION_LOGGED' | 'STANCE_HARDENED' | 'VETO_TRIGGERED';
}

export interface EvidenceWeightMetric {
  category: string;
  agentSource: AgentRole;
  rawWeight: number; // 0-100
  qualityMultiplier: number; // 0.5 - 1.5
  debateSurvivalScore: number; // 0.5 (conceded) to 1.3 (upheld)
  finalEffectiveWeight: number;
  reasoning: string;
}

export interface ScoringBreakdownItem {
  agent: AgentRole;
  initialScore: number;
  finalScore: number;
  evidenceWeight: number;
  justification: string;
}

export interface UnresolvedTensionItem {
  topic: string;
  agents: AgentRole[];
  positions: string[];
  decisionImpact?: string;
  agentA?: AgentRole;
  viewA?: string;
  agentB?: AgentRole;
  viewB?: string;
}

export interface FinalDecisionDossier {
  candidateId: string;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'LEAN_NO_HIRE' | 'NO_HIRE' | 'IMMEDIATE_VETO';
  confidencePercentage: number; // calculated from cross-agent agreement & variance
  executiveSummary: string;
  nonAveragingRationale: string;
  isVetoTriggered: boolean;
  vetoDetails?: {
    triggeringAgent: AgentRole;
    reason: string;
    dealbreakerEvidence: EvidenceQuote;
  };
  evidenceWeights: EvidenceWeightMetric[];
  scoringBreakdown: ScoringBreakdownItem[]; // Issue 1: Traceable breakdown
  keyStrengths: string[];
  unresolvedTensions: UnresolvedTensionItem[]; // Issue 1: Unresolved multi-agent tensions
  stanceSnapshots: StanceSnapshot[];
  generationTimestamp: string;
}

export interface CandidateComparisonEntry {
  candidateId: string;
  name: string;
  archetypeTitle: string;
  officialArtifactId: string;
  technicalScore: number;
  hrScore: number;
  hiringManagerScore: number;
  skepticScore: number;
  naiveAverage: number;
  bayesianRecommendation: string;
  isVetoTriggered: boolean;
  keyDifferentiator: string;
  rank: number;
}

export interface AuditLogEntry {
  id: string;
  callType: 'PROFILE_EXTRACTION' | 'AGENT_ISOLATION_EVAL' | 'DEBATE_TURN' | 'FINAL_SYNTHESIS' | 'RECRUITER_INTERJECTION';
  agentRole?: AgentRole;
  dispatchedAt: string;
  completedAt: string;
  durationMs: number;
  inputTokenCount: number;
  outputTokenCount: number;
  isolationGuaranteed: boolean;
  modelUsed: string;
}

