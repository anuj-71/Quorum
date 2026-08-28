import React from 'react';
import { Award, ShieldAlert, CheckCircle2, Download, Scale, AlertOctagon, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EvidenceQuote, FinalDecisionDossier } from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';

interface FinalDossierProps {
  dossier: FinalDecisionDossier;
  candidateName: string;
  onSelectCitation: (quote: EvidenceQuote) => void;
}

export const FinalDossier: React.FC<FinalDossierProps> = ({
  dossier,
  candidateName,
  onSelectCitation
}) => {
  const isPositiveHire = dossier.recommendation === 'STRONG_HIRE' || dossier.recommendation === 'HIRE';

  const handleTriggerConfetti = () => {
    if (isPositiveHire) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dossier, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `quorum_dossier_${dossier.candidateId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans">
      {/* Executive Decision Banner */}
      <div className={`p-6 rounded-lg border shadow-xs relative overflow-hidden ${
        dossier.isVetoTriggered 
          ? 'bg-rose-50 border-rose-200' 
          : isPositiveHire 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shadow-xs ${
              dossier.isVetoTriggered 
                ? 'bg-white text-rose-700 border-rose-200' 
                : isPositiveHire 
                ? 'bg-white text-emerald-700 border-emerald-200' 
                : 'bg-white text-amber-700 border-amber-200'
            }`}>
              {dossier.isVetoTriggered ? (
                <ShieldAlert size={26} />
              ) : isPositiveHire ? (
                <Award size={26} />
              ) : (
                <AlertOctagon size={26} />
              )}
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#474651]">
                EXECUTIVE DECISION SYNTHESIS
              </div>
              <h2 className={`text-2xl font-extrabold tracking-tight mt-0.5 ${
                dossier.isVetoTriggered ? 'text-rose-900' : isPositiveHire ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                {dossier.recommendation.replace(/_/g, ' ')}
              </h2>
              <div className="text-xs text-[#474651] mt-0.5">
                Candidate Subject: <span className="font-semibold text-[#151c27]">{candidateName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end bg-white px-4 py-2 rounded-md border border-[#e2e8f8]">
            <div className="text-[9px] font-mono text-[#474651] tracking-wider">BAYESIAN CONFIDENCE</div>
            <div className="text-2xl font-bold font-mono text-[#1a146b] flex items-baseline gap-1">
              <span>{dossier.confidencePercentage}</span>
              <span className="text-sm">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dealbreaker Veto Alert (If Applicable) */}
      {dossier.isVetoTriggered && dossier.vetoDetails && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
            <ShieldAlert size={16} />
            <span>CRITICAL VETO TRIGGERED BY {AGENT_CONFIGS[dossier.vetoDetails.triggeringAgent]?.displayName.toUpperCase()}</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            {dossier.vetoDetails.reason}
          </p>
          {dossier.vetoDetails.dealbreakerEvidence && (
            <button
              type="button"
              className="text-left p-2 rounded bg-white border border-rose-200 text-xs text-rose-900 hover:border-rose-400 flex items-center justify-between gap-2 cursor-pointer"
              onClick={() => onSelectCitation(dossier.vetoDetails!.dealbreakerEvidence)}
            >
              <span>Line {dossier.vetoDetails.dealbreakerEvidence.lineNumber}: "{dossier.vetoDetails.dealbreakerEvidence.quoteText.slice(0, 80)}..."</span>
              <span className="text-[#1a146b] text-[10px] font-mono underline shrink-0 font-bold">Inspect Source ↗</span>
            </button>
          )}
        </div>
      )}

      {/* Non-Averaging Logic Explanation */}
      <div className="p-4 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1a146b]">
          <Scale size={15} />
          <span>Non-Averaging Evidence Synthesis Architecture</span>
        </div>
        <p className="text-xs text-[#474651] leading-relaxed">
          {dossier.nonAveragingRationale}
        </p>
      </div>

      {/* Evidence Hierarchy Table */}
      <div className="p-4 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs flex flex-col gap-3">
        <h4 className="text-xs font-bold text-[#151c27] tracking-wide">
          Bayesian Evidence Weight & Debate Survival Matrix
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f8] bg-[#f0f3ff] text-[#474651] font-mono text-[10px] uppercase">
                <th className="py-2 px-3">Evaluation Dimension</th>
                <th className="py-2 px-3">Source Agent</th>
                <th className="py-2 px-3">Base Weight</th>
                <th className="py-2 px-3">Quality Multiplier</th>
                <th className="py-2 px-3">Debate Survival</th>
                <th className="py-2 px-3 text-right">Effective Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] font-mono">
              {dossier.evidenceWeights.map((w, i) => {
                const config = AGENT_CONFIGS[w.agentSource];
                return (
                  <tr key={i} className="hover:bg-[#f9f9ff]">
                    <td className="py-2 px-3 font-medium text-[#151c27] font-sans">{w.category}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0f3ff] text-[#1a146b] border border-[#e2e8f8]">
                        {config?.displayName}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#474651]">{w.rawWeight}</td>
                    <td className="py-2 px-3 text-[#474651]">{w.qualityMultiplier.toFixed(1)}x</td>
                    <td className="py-2 px-3 text-[#474651]">{w.debateSurvivalScore.toFixed(1)}x</td>
                    <td className="py-2 px-3 text-right font-bold text-[#1a146b]">{w.finalEffectiveWeight} pts</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traceable Agent Scoring & Evidence Breakdown Table */}
      {dossier.scoringBreakdown && dossier.scoringBreakdown.length > 0 && (
        <div className="p-4 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#151c27] tracking-wide">
              Agent Stance Evolution & Traceability Breakdown
            </h4>
            <span className="text-[10px] font-mono text-[#474651] bg-[#f0f3ff] px-2 py-0.5 rounded border border-[#e2e8f8]">
              Non-Averaging Bayesian Synthesis
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f8] bg-[#f0f3ff] text-[#474651] font-mono text-[10px] uppercase">
                  <th className="py-2 px-3">Agent Persona</th>
                  <th className="py-2 px-3">Initial Score</th>
                  <th className="py-2 px-3">Post-Debate Stance</th>
                  <th className="py-2 px-3">Evidence Weight</th>
                  <th className="py-2 px-3">Traceable Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f8]">
                {dossier.scoringBreakdown.map((item, i) => {
                  const config = AGENT_CONFIGS[item.agent];
                  const initialScore = dossier.stanceSnapshots.find(s => s.agentRole === item.agent)?.initialScore ?? item.finalScore;
                  return (
                    <tr key={i} className="hover:bg-[#f9f9ff]">
                      <td className="py-2 px-3 font-semibold text-[#151c27] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config?.neonColor || '#1a146b' }} />
                        <span>{config?.displayName || item.agent}</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[#474651]">{initialScore.toFixed(1)}/10</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#1a146b]">{item.finalScore.toFixed(1)}/10</td>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-700">{item.evidenceWeight} pts</td>
                      <td className="py-2 px-3 text-[#474651] text-[11px] leading-relaxed">{item.justification}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strengths & Unresolved Tensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Validated Strengths */}
        <div className="p-4 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs flex flex-col gap-2">
          <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 size={15} /> Validated Candidate Strengths
          </h4>
          <ul className="flex flex-col gap-1.5">
            {dossier.keyStrengths.map((str, idx) => (
              <li key={idx} className="text-xs text-[#474651] flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unresolved Tensions */}
        <div className="p-4 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs flex flex-col gap-2">
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <HelpCircle size={15} /> Unresolved Multi-Agent Tensions
          </h4>
          {dossier.unresolvedTensions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {dossier.unresolvedTensions.map((t, idx) => (
                <div key={idx} className="p-2.5 rounded-md bg-[#f9f9ff] border border-[#e2e8f8] flex flex-col gap-1 text-xs">
                  <div className="font-semibold text-[#151c27]">{t.topic}</div>
                  <div className="text-[11px] text-[#474651] space-y-0.5">
                    {t.positions && t.positions.length > 0 ? (
                      t.positions.map((pos, pIdx) => (
                        <div key={pIdx}>• {pos}</div>
                      ))
                    ) : (
                      <>
                        {t.agentA && <div><strong>{AGENT_CONFIGS[t.agentA]?.displayName}:</strong> {t.viewA}</div>}
                        {t.agentB && <div><strong>{AGENT_CONFIGS[t.agentB]?.displayName}:</strong> {t.viewB}</div>}
                      </>
                    )}
                  </div>
                  {t.decisionImpact && (
                    <div className="text-[10px] text-[#1a146b] font-mono mt-1 pt-1 border-t border-[#e2e8f8]">
                      Decision Impact: {t.decisionImpact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 text-xs italic py-2">
              Unanimous consensus achieved across all evaluation dimensions during deliberation.
            </div>
          )}
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#1a146b] hover:bg-[#312e81] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          onClick={handleExportJson}
        >
          <Download size={14} />
          <span>Export Executive Dossier (JSON)</span>
        </button>

        {isPositiveHire && (
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold transition-all cursor-pointer"
            onClick={handleTriggerConfetti}
          >
            <Award size={14} />
            <span>Celebrate Hiring Alignment</span>
          </button>
        )}
      </div>
    </div>
  );
};
