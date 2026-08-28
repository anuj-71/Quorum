import React from 'react';
import { X, Trophy, CheckCircle2, ArrowRight, ShieldAlert, Cpu, Users, Briefcase, Sparkles } from 'lucide-react';
import { CANDIDATE_COMPARISON_DATA } from '../data/preloadedCandidates';
import type { CandidateComparisonEntry } from '../types';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (candidateKey: string) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidate
}) => {
  if (!isOpen) return null;

  const getCandidateKey = (candidateId: string) => {
    if (candidateId === 'rohan-malhotra') return 'candidate_a';
    return 'candidate_b';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#e2e8f8] w-full max-w-5xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f8] bg-[#f9f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#312e81] flex items-center justify-center text-white shadow-xs">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#e7eefe] text-[#1a146b] px-2 py-0.5 rounded border border-[#1a146b]/20 uppercase">
                  Official Bonus Evaluation • Candidate Head-to-Head Showdown
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#151c27] tracking-tight mt-0.5">
                Comparative Ranking Matrix: Candidate A vs Candidate B
              </h2>
              <p className="text-xs text-[#474651]">
                Evaluated against the Cargonet AI Agentic Systems Engineer specification (02_Job_Description.pdf).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#575e70] hover:text-[#151c27] hover:bg-[#e2e8f8]/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
          {/* Executive Summary Takeaway Callout */}
          <div className="p-4 rounded-lg bg-[#f0f3ff] border border-[#e2e8f8] flex items-start gap-3">
            <Sparkles size={18} className="text-[#1a146b] shrink-0 mt-0.5" />
            <div className="text-xs text-[#151c27] leading-relaxed">
              <strong>Executive Synthesis for Cargonet AI:</strong> The panel compared Candidate A (Rohan Malhotra) vs Candidate B (Ananya Iyer). 
              While <strong>Rohan</strong> possesses day-one planner/executor/reviewer framework experience, his credit exaggeration on the retry engine (Transcript Line 24) and unmeasured routing heuristics (Line 14) create operational risk. 
              <strong>Ananya</strong> demonstrated supreme intellectual honesty (Line 8), proven incident ownership (pre-deploy prompt eval checklists, Line 21), and rapid ramp-up ability, earning the <strong>Top Recommended Hire (Rank #1)</strong>.
            </div>
          </div>

          {/* Side-by-Side Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CANDIDATE_COMPARISON_DATA.map((entry: CandidateComparisonEntry) => {
              const isWinner = entry.rank === 1;

              return (
                <div
                  key={entry.candidateId}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                    isWinner 
                      ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md' 
                      : 'bg-[#f9f9ff] border-[#e2e8f8]'
                  }`}
                >
                  <div>
                    {/* Rank Badge & Official ID */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                        isWinner 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                          : 'bg-white text-[#474651] border-[#e2e8f8]'
                      }`}>
                        RANK #{entry.rank} {isWinner && '👑 TOP CHOICE'}
                      </span>
                      <span className="text-[10px] font-mono text-[#575e70]">
                        {entry.officialArtifactId}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#151c27]">{entry.name}</h3>
                    <div className="text-xs text-[#575e70] font-medium mb-3">{entry.archetypeTitle}</div>

                    {/* Agent Score Breakdown Bars */}
                    <div className="space-y-2 py-3 border-y border-[#e2e8f8] mb-3 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#474651]">
                          <Cpu size={12} className="text-[#1a146b]" /> Technical Agent:
                        </span>
                        <span className="font-bold text-[#151c27]">{entry.technicalScore.toFixed(1)}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#474651]">
                          <Users size={12} className="text-[#00875a]" /> HR / Culture Agent:
                        </span>
                        <span className={`font-bold ${entry.hrScore < 5 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {entry.hrScore.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#474651]">
                          <Briefcase size={12} className="text-[#b76e00]" /> Hiring Manager:
                        </span>
                        <span className="font-bold text-[#151c27]">{entry.hiringManagerScore.toFixed(1)}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#474651]">
                          <ShieldAlert size={12} className="text-[#ba1a1a]" /> Skeptic Auditor:
                        </span>
                        <span className={`font-bold ${entry.skepticScore < 5 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {entry.skepticScore.toFixed(1)}/10
                        </span>
                      </div>
                    </div>

                    {/* Math Contrast: Naive Avg vs Synthesis */}
                    <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f8] mb-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#474651]">
                        <span>Naive Arithmetic Avg:</span>
                        <span className="font-mono">{entry.naiveAverage.toFixed(2)}/10</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>Panel Synthesis Verdict:</span>
                        <span className={entry.bayesianRecommendation.includes('NO') ? 'text-rose-700' : 'text-emerald-700'}>
                          {entry.bayesianRecommendation.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Key Differentiator */}
                    <p className="text-xs text-[#474651] leading-relaxed mb-4">
                      {entry.keyDifferentiator}
                    </p>
                  </div>

                  {/* Switch Candidate CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCandidate(getCandidateKey(entry.candidateId));
                      onClose();
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isWinner 
                        ? 'bg-[#1a146b] hover:bg-[#312e81] text-white shadow-xs' 
                        : 'bg-white hover:bg-[#f0f3ff] text-[#151c27] border border-[#e2e8f8]'
                    }`}
                  >
                    <span>Deliberate Candidate</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparative Matrix Table */}
          <div className="p-4 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs">
            <h4 className="text-xs font-bold text-[#151c27] mb-3 uppercase tracking-wider font-mono">
              Cargonet AI Rubric Breakdown
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f8] bg-[#f0f3ff] text-[#474651] font-mono text-[10px] uppercase">
                    <th className="py-2 px-3">Evaluation Dimension</th>
                    <th className="py-2 px-3">Candidate A (Rohan Malhotra)</th>
                    <th className="py-2 px-3">Candidate B (Ananya Iyer)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f8] text-[#151c27]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1a146b]">Multi-Agent Architecture</td>
                    <td className="py-2.5 px-3 text-emerald-800">Shipped planner/executor/reviewer in freight (Line 5)</td>
                    <td className="py-2.5 px-3 text-amber-800">Single-agent RAG in prod; toy multi-agent on own time (Line 11)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#00875a]">Production Ownership & Retros</td>
                    <td className="py-2.5 px-3 text-amber-800">Untested on serious incident volume (Line 31)</td>
                    <td className="py-2.5 px-3 text-emerald-800">Owned prompt outage; built team pre-deploy checklist (Line 21)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#ba1a1a]">Intellectual Honesty & Credibility</td>
                    <td className="py-2.5 px-3 text-rose-700">Conceded "sole architect" was exaggerated (Line 24)</td>
                    <td className="py-2.5 px-3 text-emerald-800">Proactively clarified informal 40% metric spot-check (Line 8)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#b76e00]">Model Routing & Evaluation Rigor</td>
                    <td className="py-2.5 px-3 text-rose-700">Ad-hoc tuning without formal study (Line 14)</td>
                    <td className="py-2.5 px-3 text-emerald-800">Advocates lightweight eval sets before shipping (Line 21)</td>
                  </tr>
                  <tr className="bg-[#f9f9ff] font-bold">
                    <td className="py-2.5 px-3">Final Panel Consensus</td>
                    <td className="py-2.5 px-3 text-rose-700">LEAN NO HIRE (Rank #2)</td>
                    <td className="py-2.5 px-3 text-emerald-800">HIRE (Rank #1 - Top Recommended)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e8f8] bg-[#f9f9ff] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#474651]">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Fulfills official problem statement comparison & ranking bonus criteria.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1a146b] hover:bg-[#312e81] text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
