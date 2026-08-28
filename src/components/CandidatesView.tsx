import React from 'react';
import { Upload, ArrowRight, Trophy, Briefcase, AlertCircle } from 'lucide-react';
import { PRELOADED_SCENARIOS } from '../data/preloadedCandidates';
import type { CandidateProfile } from '../types';
import type { ActiveNavView } from './Sidebar';

interface CandidatesViewProps {
  currentCandidate: CandidateProfile | null;
  onSelectScenario: (key: string) => void;
  onOpenUpload: () => void;
  onNavigate: (view: ActiveNavView) => void;
  onOpenCompare?: () => void;
  onOpenJobDescription?: () => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  currentCandidate,
  onSelectScenario,
  onOpenUpload,
  onNavigate,
  onOpenCompare,
  onOpenJobDescription
}) => {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto w-full font-sans text-[#151c27]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#e2e8f8]">
        <div>
          <div className="text-[10px] font-mono font-bold text-[#1a146b] uppercase tracking-wider mb-1">
            Official Benchmark Candidates & Scenarios
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151c27]">
            Candidate Profiles & Multi-Agent Deliberation
          </h1>
          <p className="text-xs text-[#474651] mt-0.5">
            Select a candidate scenario to evaluate or upload a custom resume & transcript dossier.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenJobDescription && (
            <button
              type="button"
              onClick={onOpenJobDescription}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#f0f3ff] text-[#151c27] border border-[#e2e8f8] rounded-md text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Briefcase size={14} className="text-[#1a146b]" />
              <span>Job Spec (02_JD)</span>
            </button>
          )}

          {onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#312e81] hover:bg-[#1a146b] text-white rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Trophy size={14} className="text-amber-300" />
              <span>Compare Candidates A vs B</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1a146b] hover:bg-[#312e81] text-white rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload Custom Dossier</span>
          </button>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(PRELOADED_SCENARIOS).map(([key, scenario]) => {
          const profile = scenario.profile;
          const isSelected = currentCandidate?.id === profile.id;
          const isCandidateA = key === 'candidate_a';

          return (
            <div
              key={key}
              className={`p-6 rounded-lg border flex flex-col justify-between transition-all duration-200 shadow-2xs ${
                isSelected 
                  ? 'bg-white border-[#1a146b] ring-2 ring-[#1a146b]/20 shadow-md' 
                  : 'bg-white border-[#e2e8f8] hover:border-[#1a146b]/40'
              }`}
            >
              <div>
                {/* Official Problem Statement Tag */}
                {profile.officialArtifactId && (
                  <div className="mb-2.5">
                    <span className="text-[9px] font-mono font-bold bg-[#e7eefe] text-[#1a146b] px-2 py-0.5 rounded border border-[#1a146b]/15 uppercase">
                      {profile.officialArtifactId}
                    </span>
                  </div>
                )}

                {/* Archetype Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    isCandidateA 
                      ? 'bg-amber-50 text-amber-900 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}>
                    {profile.archetypeTitle}
                  </span>

                  <span className="text-xs text-[#474651] font-mono">
                    {profile.experienceYears} YoE
                  </span>
                </div>

                {/* Candidate Name & Role */}
                <h3 className="text-base font-bold text-[#151c27] mb-0.5">{profile.name}</h3>
                <div className="text-xs text-[#474651] mb-3">{profile.targetRole} • {profile.currentCompany}</div>

                <p className="text-xs text-[#474651] leading-relaxed font-light mb-4">
                  {profile.archetypeDescription}
                </p>

                {/* Skills Cloud */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {profile.skills.slice(0, 4).map((s, i) => (
                    <span 
                      key={i} 
                      className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                        s.verified 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-[#f0f3ff] text-[#474651] border-[#e2e8f8]'
                      }`}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>

                {/* Missing / Unclear Info Audit Section (Problem Statement Rubric Compliance) */}
                {profile.missingInfoAudit && profile.missingInfoAudit.length > 0 && (
                  <div className="p-2.5 rounded-md bg-[#f9f9ff] border border-[#e2e8f8] mb-4 space-y-1">
                    <div className="text-[10px] font-mono font-bold text-[#474651] uppercase flex items-center gap-1">
                      <AlertCircle size={11} className="text-amber-600" />
                      <span>Missing / Unclear Info Handled:</span>
                    </div>
                    {profile.missingInfoAudit.slice(0, 1).map((m, idx) => (
                      <p key={idx} className="text-[10px] text-[#575e70] leading-snug">
                        • <strong>{m.field}</strong>: {m.impactOnScore}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#e2e8f8]">
                <button
                  type="button"
                  onClick={() => {
                    onSelectScenario(key);
                    onNavigate('aipanel');
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#1a146b] text-white shadow-xs' 
                      : 'bg-[#f9f9ff] hover:bg-[#f0f3ff] text-[#151c27] border border-[#e2e8f8]'
                  }`}
                >
                  <span>{isSelected ? 'Deliberate Candidate' : 'Select & Deliberate'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

