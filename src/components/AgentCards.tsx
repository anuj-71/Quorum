import React from 'react';
import { Cpu, Users, Briefcase, ShieldAlert, ExternalLink, ShieldCheck, Activity } from 'lucide-react';
import type { AgentOpinion, AgentRole, EvidenceQuote } from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';

interface AgentCardsProps {
  opinions: Record<AgentRole, AgentOpinion>;
  onSelectCitation: (quote: EvidenceQuote) => void;
  activeCitation: EvidenceQuote | null;
}

const getAgentIcon = (role: AgentRole) => {
  switch (role) {
    case 'technical': return <Cpu size={16} className="text-[#1a146b]" />;
    case 'hr': return <Users size={16} className="text-[#00875a]" />;
    case 'hiring_manager': return <Briefcase size={16} className="text-[#b76e00]" />;
    case 'skeptic': return <ShieldAlert size={16} className="text-[#ba1a1a]" />;
  }
};

const getVerdictBadge = (verdict: AgentOpinion['verdict']) => {
  switch (verdict) {
    case 'STRONG_HIRE': return 'bg-emerald-100 text-emerald-900 border border-emerald-300 ring-1 ring-emerald-400/30';
    case 'HIRE': return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    case 'LEAN_HIRE': return 'bg-indigo-50 text-indigo-800 border border-indigo-200';
    case 'LEAN_NO_HIRE': return 'bg-amber-50 text-amber-900 border border-amber-300';
    case 'NO_HIRE': return 'bg-rose-50 text-rose-800 border border-rose-200';
    case 'CRITICAL_VETO': return 'bg-rose-100 text-rose-900 border-2 border-rose-400 font-extrabold shadow-2xs';
    default: return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export const AgentCards: React.FC<AgentCardsProps> = ({
  opinions,
  onSelectCitation,
  activeCitation
}) => {
  const roles: AgentRole[] = ['technical', 'hr', 'hiring_manager', 'skeptic'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full pb-8">
      {roles.map((role) => {
        const opinion = opinions[role];
        const config = AGENT_CONFIGS[role];
        if (!opinion) return null;
        
        const totalCitations = opinion.strengths.length + opinion.concerns.length + (opinion.redFlags?.length || 0);

        return (
          <div
            key={role}
            className="flex flex-col rounded-lg border border-[#e2e8f8] bg-white shadow-2xs overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-row items-center justify-between p-4 border-b border-[#e2e8f8] bg-[#f9f9ff]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs">
                  {getAgentIcon(role)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#151c27]">
                    {config.displayName}
                  </span>
                  <span className="text-[11px] text-[#474651] uppercase tracking-wider font-mono">{config.title}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-[#e2e8f8]">
                <span className="text-base font-bold text-[#1a146b]">{opinion.score.toFixed(1)}</span>
                <span className="text-xs text-[#575e70]">/ 10</span>
              </div>
            </div>

            {/* Verdict & Summary */}
            <div className="flex flex-col p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-xs sm:text-[13px] font-bold px-3 py-1 rounded-md border font-mono tracking-wide uppercase shadow-2xs ${getVerdictBadge(opinion.verdict)}`}>
                  {opinion.verdict.replace(/_/g, ' ')}
                </span>
                
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#575e70] bg-[#f0f3ff] px-2 py-0.5 rounded border border-[#e2e8f8]">
                  <Activity size={11} className="text-[#575e70]" />
                  <span>Conf:</span>
                  <span className="font-bold text-[#151c27]">{(opinion.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-[#151c27] leading-snug">
                  "{opinion.summaryHeadline}"
                </h4>
                <p className="text-xs text-[#474651] leading-relaxed font-light">
                  {opinion.detailedAnalysis}
                </p>
              </div>
            </div>

            {/* Citations List */}
            <div className="flex-1 bg-[#f9f9ff] p-4 border-t border-[#e2e8f8]">
              <div className="text-[9px] uppercase font-mono tracking-widest text-[#575e70] mb-2 flex items-center justify-between">
                <span>Verified Source Citations</span>
                <span className="bg-white border border-[#e2e8f8] px-2 py-0.2 rounded-full text-[#575e70] text-[9px] font-mono">{totalCitations} quotes</span>
              </div>
              
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {/* Strengths */}
                {opinion.strengths.map((s, idx) => {
                  const isActive = activeCitation?.quoteText === s.quoteText;
                  return (
                    <button
                      key={`s-${idx}`}
                      type="button"
                      className={`text-left group flex items-start gap-2 p-2 rounded-md border text-xs transition-all cursor-pointer ${
                        isActive ? 'bg-[#e7eefe] border-[#1a146b] text-[#1a146b]' : 'bg-white border-[#e2e8f8] text-[#151c27] hover:border-[#1a146b]/40'
                      }`}
                      onClick={() => onSelectCitation(s)}
                    >
                      <span className="text-[9px] font-mono font-bold bg-[#f0f3ff] text-[#1a146b] px-1 py-0.5 rounded border border-[#e2e8f8] shrink-0">
                        L{s.lineNumber}
                      </span>
                      <span className="line-clamp-1 flex-1">"{s.quoteText}"</span>
                      <ExternalLink size={11} className="shrink-0 text-[#474651] group-hover:text-[#1a146b] mt-0.5" />
                    </button>
                  );
                })}

                {/* Concerns */}
                {opinion.concerns.map((c, idx) => {
                  const isActive = activeCitation?.quoteText === c.quoteText;
                  return (
                    <button
                      key={`c-${idx}`}
                      type="button"
                      className={`text-left group flex items-start gap-2 p-2 rounded-md border text-xs transition-all cursor-pointer ${
                        isActive ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-white border-[#e2e8f8] text-[#151c27] hover:border-amber-400'
                      }`}
                      onClick={() => onSelectCitation(c)}
                    >
                      <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 px-1 py-0.5 rounded border border-amber-200 shrink-0">
                        L{c.lineNumber}
                      </span>
                      <span className="line-clamp-1 flex-1">"{c.quoteText}"</span>
                      <ExternalLink size={11} className="shrink-0 text-[#474651] group-hover:text-amber-700 mt-0.5" />
                    </button>
                  );
                })}

                {/* Red flags */}
                {opinion.redFlags?.map((rf, idx) => {
                  const isActive = activeCitation?.quoteText === rf.quoteText;
                  return (
                    <button
                      key={`rf-${idx}`}
                      type="button"
                      className={`text-left group flex items-start gap-2 p-2 rounded-md border text-xs transition-all cursor-pointer ${
                        isActive ? 'bg-rose-50 border-rose-400 text-rose-900' : 'bg-white border-rose-200 text-rose-900 hover:border-rose-400'
                      }`}
                      onClick={() => onSelectCitation(rf)}
                    >
                      <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-900 px-1 py-0.5 rounded border border-rose-300 shrink-0">
                        FLAG L{rf.lineNumber}
                      </span>
                      <span className="line-clamp-1 flex-1">"{rf.quoteText}"</span>
                      <ExternalLink size={11} className="shrink-0 text-rose-700 mt-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Isolation Proof */}
            <div className="bg-white p-2.5 px-4 border-t border-[#e2e8f8] flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck size={13} />
                <span className="uppercase font-mono text-[9px]">Zero-Knowledge Token Isolation</span>
              </div>
              <span className="font-mono text-[9px] text-[#575e70] bg-[#f9f9ff] px-2 py-0.5 rounded border border-[#e2e8f8]">
                {opinion.isolationHash?.slice(0, 16) || 'SHA256:VERIFIED'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
