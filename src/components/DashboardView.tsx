import React from 'react';
import { 
  Plus, Video, MessageSquare, ThumbsUp, AlertTriangle, 
  ArrowRight, CheckCircle2, Trophy, Briefcase 
} from 'lucide-react';
import type { CandidateProfile, FinalDecisionDossier } from '../types';
import { PRELOADED_SCENARIOS } from '../data/preloadedCandidates';
import type { ActiveNavView } from './Sidebar';

interface DashboardViewProps {
  candidate: CandidateProfile | null;
  opinions?: any;
  finalDossier: FinalDecisionDossier | null;
  onSelectScenario: (key: string) => void;
  onOpenUpload: () => void;
  onNavigate: (view: ActiveNavView) => void;
  onOpenCompare?: () => void;
  onOpenJobDescription?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  candidate,
  onSelectScenario,
  onOpenUpload,
  onNavigate,
  onOpenCompare,
  onOpenJobDescription
}) => {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto w-full font-sans text-[#151c27]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold text-[#1a146b] uppercase tracking-wider mb-1">
            Multi-Agent AI Interview Panel Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#151c27] mb-1">
            Interview Intelligence
          </h2>
          <p className="text-sm text-[#474651]">
            Review 4-agent isolated evaluations, live cross-examination debates, and non-averaging decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {onOpenJobDescription && (
            <button
              type="button"
              onClick={onOpenJobDescription}
              className="bg-white text-[#151c27] border border-[#e2e8f8] text-xs font-semibold py-2.5 px-3 rounded-md hover:bg-[#f0f3ff] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Briefcase size={14} className="text-[#1a146b]" />
              <span>Job Spec (02_JD)</span>
            </button>
          )}

          {onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="bg-[#312e81] text-white text-xs font-semibold py-2.5 px-3.5 rounded-md hover:bg-[#1a146b] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Trophy size={14} className="text-amber-300" />
              <span>Compare Candidates</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenUpload}
            className="bg-[#1a146b] text-white text-xs font-semibold py-2.5 px-4 rounded-md hover:bg-[#312e81] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>New Interview</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid (Exact Stitch Design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-[#e2e8f8] rounded-lg p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-medium text-[#474651] uppercase tracking-wider">Active Interviews</span>
            <Video size={18} className="text-[#1a146b]" />
          </div>
          <div className="text-2xl font-bold text-[#151c27]">12</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#e2e8f8] rounded-lg p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-medium text-[#474651] uppercase tracking-wider">Awaiting Panel</span>
            <MessageSquare size={18} className="text-[#575e70]" />
          </div>
          <div className="text-2xl font-bold text-[#151c27]">4</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#e2e8f8] rounded-lg p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-medium text-[#474651] uppercase tracking-wider">Strong Hire</span>
            <ThumbsUp size={18} className="text-[#5654a8]" />
          </div>
          <div className="text-2xl font-bold text-[#151c27]">8</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[#e2e8f8] rounded-lg p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-medium text-[#474651] uppercase tracking-wider">Needs Review</span>
            <AlertTriangle size={18} className="text-[#ba1a1a]" />
          </div>
          <div className="text-2xl font-bold text-[#151c27]">2</div>
        </div>
      </div>

      {/* Active Candidate Deliberation Stepper */}
      <div className="bg-white border border-[#e2e8f8] rounded-lg p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1a146b]" />
            <h3 className="text-xs font-semibold text-[#151c27] uppercase tracking-wider font-mono">
              Active Deliberation Pipeline: {candidate?.name || 'Taylor Swift'}
            </h3>
          </div>
          <span className="text-xs text-[#474651]">{candidate?.targetRole}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate('aipanel')}
            className="p-4 rounded-lg bg-[#f9f9ff] border border-[#e2e8f8] hover:border-[#1a146b] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-[#312e81] font-bold uppercase tracking-wider">STAGE 1</span>
              <h4 className="text-sm font-bold text-[#151c27] mt-1 group-hover:text-[#1a146b]">
                Isolated 4-Agent Evaluations
              </h4>
              <p className="text-xs text-[#474651] mt-1">
                4 parallel agent perspectives scrutinizing transcript lines with zero cross-talk.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-[#1a146b] pt-3 mt-3 border-t border-[#e2e8f8] font-semibold">
              <span>View Evaluators</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('debates')}
            className="p-4 rounded-lg bg-[#f9f9ff] border border-[#e2e8f8] hover:border-[#1a146b] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-[#ba1a1a] font-bold uppercase tracking-wider">STAGE 2</span>
              <h4 className="text-sm font-bold text-[#151c27] mt-1 group-hover:text-[#1a146b]">
                Live Debate Arena & Voice
              </h4>
              <p className="text-xs text-[#474651] mt-1">
                Turn-by-turn cross-examination with audio synthesis and 5th-chair interjection.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-[#ba1a1a] pt-3 mt-3 border-t border-[#e2e8f8] font-semibold">
              <span>Enter Debate</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('decisions')}
            className="p-4 rounded-lg bg-[#f9f9ff] border border-[#e2e8f8] hover:border-[#1a146b] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-[#00875a] font-bold uppercase tracking-wider">STAGE 3</span>
              <h4 className="text-sm font-bold text-[#151c27] mt-1 group-hover:text-[#1a146b]">
                Executive Final Decision
              </h4>
              <p className="text-xs text-[#474651] mt-1">
                Bayesian evidence synthesis weighing vetoes, quality multipliers, and debate survival.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-[#00875a] pt-3 mt-3 border-t border-[#e2e8f8] font-semibold">
              <span>View Final Dossier</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table (Exact Stitch Design) */}
      <div className="bg-white border border-[#e2e8f8] rounded-lg overflow-hidden flex flex-col shadow-2xs">
        <div className="px-5 py-3.5 border-b border-[#e2e8f8] flex justify-between items-center bg-[#f9f9ff]">
          <h3 className="text-xs text-[#151c27] font-semibold uppercase tracking-wider">
            Interview Sessions & Archetypes
          </h3>
          <span className="text-xs text-[#474651]">Click a candidate to evaluate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f0f3ff] border-b border-[#e2e8f8] text-[#474651] font-mono text-[11px]">
                <th className="px-4 py-2.5 font-medium">Candidate</th>
                <th className="px-4 py-2.5 font-medium">Target Role</th>
                <th className="px-4 py-2.5 font-medium">Pipeline Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Evidence Citations</th>
                <th className="px-4 py-2.5 font-medium">Debate Tension</th>
                <th className="px-4 py-2.5 font-medium text-right">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] text-[#151c27]">
              {Object.entries(PRELOADED_SCENARIOS).map(([key, scenario]) => {
                const profile = scenario.profile;
                const isSelected = candidate?.id === profile.id;
                const isCandidateA = key === 'candidate_a';

                return (
                  <tr 
                    key={key}
                    onClick={() => onSelectScenario(key)}
                    className={`hover:bg-[#f9f9ff] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#e7eefe]/50 font-semibold' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCandidateA ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span>{profile.name}</span>
                      <span className="text-[10px] text-[#474651] font-normal">({profile.archetypeTitle})</span>
                    </td>
                    <td className="px-4 py-3 text-[#474651]">{profile.targetRole}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] bg-[#f0f3ff] px-2 py-0.5 rounded border border-[#e2e8f8]">
                        [<span className="text-emerald-700">✓ Profile</span> <span className="text-emerald-700">✓ 4 Evals</span> <span className="text-[#1a146b] font-bold">● Complete</span>]
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-[#474651]">
                      {scenario.isolatedOpinions.technical.strengths.length + scenario.isolatedOpinions.technical.concerns.length} quotes
                    </td>
                    <td className="px-4 py-3">
                      {isCandidateA ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <AlertTriangle size={12} /> Credit Dispute
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 size={12} /> High Veracity
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={scenario.finalDossier.recommendation.includes('NO') ? 'text-[#ba1a1a]' : 'text-[#00875a]'}>
                        {scenario.finalDossier.recommendation.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
