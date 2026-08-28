import { useState, useCallback, useEffect } from 'react';
import { Sidebar, type ActiveNavView } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { CandidatesView } from './components/CandidatesView';
import { AgentCards } from './components/AgentCards';
import { StanceRadar } from './components/StanceRadar';
import { DebateArena } from './components/DebateArena';
import { VoiceStudio } from './components/VoiceStudio';
import { RecruiterInterjection } from './components/RecruiterInterjection';
import { FinalDossier } from './components/FinalDossier';
import { DossierViewer } from './components/DossierViewer';
import { UploadModal } from './components/UploadModal';
import { AuditModal } from './components/AuditModal';
import { JobDescriptionModal } from './components/JobDescriptionModal';
import { CandidateComparisonModal } from './components/CandidateComparisonModal';

import { PRELOADED_SCENARIOS } from './data/preloadedCandidates';
import type { CandidateProfile, EvidenceQuote, AuditLogEntry, DebateTurn } from './types';
import { runIsolatedAgentEvaluations } from './engine/agentRunner';
import { generateDebateTurns, handleRecruiterInterjection } from './engine/debateEngine';
import { computeNonAveragingDecision } from './engine/decisionEngine';
import { fetchServerStatus } from './engine/llmClient';

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-init-1',
    callType: 'PROFILE_EXTRACTION',
    dispatchedAt: '2026-08-28T02:00:00.000Z',
    completedAt: '2026-08-28T02:00:00.500Z',
    durationMs: 500,
    inputTokenCount: 1840,
    outputTokenCount: 380,
    isolationGuaranteed: true,
    modelUsed: 'quorum-deterministic-engine-v2'
  }
];

export function App() {
  // Navigation View State (Stitch Desktop Shell)
  const [activeView, setActiveView] = useState<ActiveNavView>('dashboard');

  // Scenario & Candidate State (Defaults to Candidate A: Rohan Malhotra)
  const defaultScenario = PRELOADED_SCENARIOS['candidate_a'];
  const [candidate, setCandidate] = useState<CandidateProfile | null>(defaultScenario.profile);
  const [opinions, setOpinions] = useState(defaultScenario.isolatedOpinions);
  const [debateTurns, setDebateTurns] = useState<DebateTurn[]>(defaultScenario.debateTurns);
  const [finalDossier, setFinalDossier] = useState(defaultScenario.finalDossier);

  // Server mode: LIVE_GEMINI or OFFLINE_DEMO
  const [serverMode, setServerMode] = useState<'LIVE_GEMINI' | 'OFFLINE_DEMO' | null>(null);

  // Fetch server status once on mount to determine mode
  useEffect(() => {
    fetchServerStatus().then(({ mode }) => setServerMode(mode));
  }, []);

  // Interaction State
  const [activeCitation, setActiveCitation] = useState<EvidenceQuote | null>(null);
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(-1);
  const [isDeliberating, setIsDeliberating] = useState<boolean>(false);
  const [isInterjecting, setIsInterjecting] = useState<boolean>(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isJobDescriptionOpen, setIsJobDescriptionOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Handle Switching Preset Archetypes
  const handleSelectScenario = useCallback((key: string) => {
    const scenario = PRELOADED_SCENARIOS[key];
    if (scenario) {
      setCandidate(scenario.profile);
      setOpinions(scenario.isolatedOpinions);
      setDebateTurns(scenario.debateTurns);
      setFinalDossier(scenario.finalDossier);
      setActiveCitation(null);
      setActiveTurnIndex(-1);
    }
  }, []);

  // Handle Citation Selection
  const handleSelectCitation = useCallback((quote: EvidenceQuote) => {
    setActiveCitation(quote);
    setActiveView('evidence');
  }, []);

  // Handle Custom Candidate Upload
  const handleUploadCandidate = async (newCandidate: CandidateProfile) => {
    setCandidate(newCandidate);
    setActiveCitation(null);
    setActiveTurnIndex(-1);
    setIsDeliberating(true);
    setActiveView('aipanel');

    try {
      // Step 1: Run 4 Isolated Agent Evaluations
      const { opinions: newOpinions, auditLogs: evalLogs } = await runIsolatedAgentEvaluations(newCandidate);
      setOpinions(newOpinions);
      setAuditLogs((prev) => [...prev, ...evalLogs]);
      
      // Move to Debate View
      setActiveView('debates');

      // Step 2: Generate Multi-Turn Debate
      const turns = await generateDebateTurns(newCandidate, newOpinions);
      setDebateTurns(turns);

      // Move to Decisions View
      setActiveView('decisions');

      // Step 3: Compute Non-Averaging Bayesian Decision
      const dossier = computeNonAveragingDecision(newCandidate.id, newCandidate.name, newOpinions, turns);
      setFinalDossier(dossier);
    } catch (err) {
      console.error('Error during deliberation pipeline', err);
    } finally {
      setIsDeliberating(false);
    }
  };

  // Handle Recruiter "5th Chair" Interjection
  const handleRecruiterSubmit = async (question: string) => {
    if (!candidate || !opinions) return;
    setIsInterjecting(true);
    try {
      const reactiveTurns = await handleRecruiterInterjection(question, candidate, opinions, debateTurns);
      const updatedTurns = [...debateTurns, ...reactiveTurns];
      setDebateTurns(updatedTurns);

      // Recompute decision dossier with new turns
      const updatedDossier = computeNonAveragingDecision(candidate.id, candidate.name, opinions, updatedTurns);
      setFinalDossier(updatedDossier);

      // Focus on new turn
      setActiveTurnIndex(updatedTurns.length - 2);
    } catch (e) {
      console.error('Failed to submit interjection', e);
    } finally {
      setIsInterjecting(false);
    }
  };

  // Reset current session
  const handleResetSession = () => {
    handleSelectScenario('candidate_a');
    setActiveView('dashboard');
  };

  return (
    <div className="flex h-screen w-full bg-[#f9f9ff] text-[#151c27] overflow-hidden font-sans selection:bg-[#312e81]/20 selection:text-[#1a146b]">
      {/* Stitch Left Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        candidate={candidate}
        serverMode={serverMode}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenJobDescription={() => setIsJobDescriptionOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f9f9ff]">
        {/* Stitch Top App Bar */}
        <TopHeader
          activeView={activeView}
          onOpenUpload={() => setIsUploadOpen(true)}
          onReset={handleResetSession}
          isDeliberating={isDeliberating}
          onOpenCompare={() => setIsCompareOpen(true)}
          onOpenJobDescription={() => setIsJobDescriptionOpen(true)}
        />

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f9f9ff]">
          
          {/* VIEW 1: Dashboard */}
          {activeView === 'dashboard' && (
            <DashboardView
              candidate={candidate}
              opinions={opinions}
              finalDossier={finalDossier}
              onSelectScenario={handleSelectScenario}
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigate={setActiveView}
              onOpenCompare={() => setIsCompareOpen(true)}
              onOpenJobDescription={() => setIsJobDescriptionOpen(true)}
            />
          )}

          {/* VIEW 2: Candidates */}
          {activeView === 'candidates' && (
            <CandidatesView
              currentCandidate={candidate}
              onSelectScenario={handleSelectScenario}
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigate={setActiveView}
              onOpenCompare={() => setIsCompareOpen(true)}
              onOpenJobDescription={() => setIsJobDescriptionOpen(true)}
            />
          )}

          {/* VIEW 3: AI Panel (Stage 1: Isolated Evals) */}
          {activeView === 'aipanel' && opinions && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <div className="mb-6 pb-3 border-b border-[#e2e8f8]">
                <div className="text-[10px] font-mono font-bold text-[#1a146b] tracking-wider uppercase mb-1">
                  Stage 1: Zero-Knowledge Token Isolation
                </div>
                <h2 className="text-2xl font-bold text-[#151c27] tracking-tight">Independent Evaluator Panels</h2>
                <p className="text-xs text-[#474651] mt-0.5">
                  4 isolated agent perspectives scrutinizing source evidence with zero cross-talk.
                </p>
              </div>

              <AgentCards
                opinions={opinions}
                onSelectCitation={handleSelectCitation}
                activeCitation={activeCitation}
              />
            </div>
          )}

          {/* VIEW 4: Panel Debates (Stage 2: Live Arena, Radar, Voice) */}
          {activeView === 'debates' && debateTurns.length > 0 && (
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
              <div className="pb-3 border-b border-[#e2e8f8]">
                <div className="text-[10px] font-mono font-bold text-[#ba1a1a] tracking-wider uppercase mb-1">
                  Stage 2: Multi-Agent Cross-Examination
                </div>
                <h2 className="text-2xl font-bold text-[#151c27] tracking-tight">Live Debate Arena & Voice Studio</h2>
                <p className="text-xs text-[#474651] mt-0.5">
                  Agents challenge claims, concede flawed premises, and reconcile contradictory evidence.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
                {/* Main Debate Feed (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="h-[480px]">
                    <DebateArena
                      turns={debateTurns}
                      activeTurnIndex={activeTurnIndex}
                      onSelectCitation={handleSelectCitation}
                      activeCitation={activeCitation}
                    />
                  </div>
                  <RecruiterInterjection
                    onSubmitInterjection={handleRecruiterSubmit}
                    isLoading={isInterjecting}
                  />
                </div>

                {/* Companion Panel (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {finalDossier?.stanceSnapshots && (
                    <StanceRadar snapshots={finalDossier.stanceSnapshots} />
                  )}
                  <VoiceStudio
                    turns={debateTurns}
                    activeTurnIndex={activeTurnIndex}
                    onTurnChange={(idx) => setActiveTurnIndex(idx)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: Decisions (Stage 3: Executive Verdict) */}
          {activeView === 'decisions' && finalDossier && candidate && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <div className="mb-6 pb-3 border-b border-[#e2e8f8]">
                <div className="text-[10px] font-mono font-bold text-[#00875a] tracking-wider uppercase mb-1">
                  Stage 3: Bayesian Evidence Synthesis
                </div>
                <h2 className="text-2xl font-bold text-[#151c27] tracking-tight">Executive Final Decision Dossier</h2>
                <p className="text-xs text-[#474651] mt-0.5">
                  Non-averaging verdict weighing dealbreaker vetoes, evidence quality multipliers, and debate survival.
                </p>
              </div>

              <FinalDossier
                dossier={finalDossier}
                candidateName={candidate.name}
                onSelectCitation={handleSelectCitation}
              />
            </div>
          )}

          {/* VIEW 6: Evidence Room (Document Inspector) */}
          {activeView === 'evidence' && candidate && (
            <div className="p-8 max-w-6xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col">
              <div className="mb-4 pb-2 border-b border-[#e2e8f8] shrink-0">
                <h2 className="text-2xl font-bold text-[#151c27] tracking-tight">Evidence Room & Ground Truth</h2>
                <p className="text-xs text-[#474651] mt-0.5">
                  Line-exact transcript & parsed resume ground truth. Every agent claim is grounded in source lines.
                </p>
              </div>

              <div className="flex-1 min-h-0">
                <DossierViewer
                  candidate={candidate}
                  activeCitation={activeCitation}
                  onClearCitation={() => setActiveCitation(null)}
                />
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Global Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadCandidate={handleUploadCandidate}
      />

      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        logs={auditLogs}
      />
      <JobDescriptionModal
        isOpen={isJobDescriptionOpen}
        onClose={() => setIsJobDescriptionOpen(false)}
      />
      <CandidateComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectCandidate={handleSelectScenario}
      />
    </div>
  );
}

export default App;
