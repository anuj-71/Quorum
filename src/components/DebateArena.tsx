import React from 'react';
import { Swords, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import type { DebateTurn, EvidenceQuote } from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';

interface DebateArenaProps {
  turns: DebateTurn[];
  activeTurnIndex: number;
  onSelectCitation: (quote: EvidenceQuote) => void;
  activeCitation: EvidenceQuote | null;
}

const getActionBadge = (action: DebateTurn['action']) => {
  switch (action) {
    case 'CHALLENGE':
      return <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] uppercase font-bold font-mono"><Swords size={11} /> CHALLENGING</span>;
    case 'CONCEDE':
      return <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] uppercase font-bold font-mono"><CheckCircle2 size={11} /> CONCEDING POINT</span>;
    case 'SUPPORT':
      return <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded text-[10px] uppercase font-bold font-mono"><ArrowRight size={11} /> SUPPORTING</span>;
    case 'RAISE_VETO':
      return <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 rounded text-[10px] uppercase font-bold font-mono"><ShieldAlert size={11} /> RAISING VETO</span>;
    case 'COUNTER_EVIDENCE':
      return <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] uppercase font-bold font-mono"><AlertTriangle size={11} /> COUNTER-EVIDENCE</span>;
    default:
      return <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-[10px] uppercase font-bold font-mono">{action}</span>;
  }
};

export const DebateArena: React.FC<DebateArenaProps> = ({
  turns,
  activeTurnIndex,
  onSelectCitation,
  activeCitation
}) => {
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg border border-[#e2e8f8] overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 px-4 border-b border-[#e2e8f8] bg-[#f9f9ff] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#1a146b]" />
          <h3 className="text-xs font-bold text-[#151c27]">Multi-Agent Live Deliberation</h3>
        </div>
        <div className="text-[10px] font-mono text-[#474651] bg-white px-2.5 py-0.5 rounded border border-[#e2e8f8]">
          Round {turns[turns.length - 1]?.roundNumber || 1} • {turns.length} Turns
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
        {turns.map((turn, index) => {
          const speakerConfig = AGENT_CONFIGS[turn.speaker];
          const targetConfig = turn.targetAgent ? AGENT_CONFIGS[turn.targetAgent] : null;
          const isActiveSpeaking = activeTurnIndex === index;

          return (
            <div
              key={turn.id || index}
              className={`flex flex-col max-w-[90%] ${
                turn.speaker === 'hiring_manager' || turn.speaker === 'hr' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              {/* Speaker Label */}
              <div className={`flex items-center gap-1.5 mb-1 text-xs ${
                turn.speaker === 'hiring_manager' || turn.speaker === 'hr' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <span className="font-bold text-[#151c27]">
                  {speakerConfig.displayName}
                </span>
                {targetConfig && (
                  <span className="flex items-center gap-1 text-[10px] text-[#474651]">
                    <ArrowRight size={10} />
                    <span className="font-medium">@{targetConfig.displayName}</span>
                  </span>
                )}
              </div>

              {/* Message Card */}
              <div 
                className={`p-3.5 rounded-lg border text-xs leading-relaxed transition-all ${
                  turn.speaker === 'hiring_manager' || turn.speaker === 'hr' 
                    ? 'bg-[#f0f3ff] border-[#d9dff5] text-[#151c27]' 
                    : 'bg-[#f9f9ff] border-[#e2e8f8] text-[#151c27]'
                } ${isActiveSpeaking ? 'ring-2 ring-[#1a146b] shadow-md' : ''}`}
              >
                {/* Action Badge */}
                <div className="mb-2">
                  {getActionBadge(turn.action)}
                </div>

                {/* Statement */}
                <div className="text-xs text-[#151c27] whitespace-pre-wrap">
                  {turn.statement}
                </div>

                {/* Stance Shift */}
                {turn.stanceShift && (
                  <div className="mt-2.5 p-2 bg-indigo-50 border border-indigo-200 rounded-md text-[11px]">
                    <span className="font-bold text-[#1a146b] font-mono block mb-0.5">
                      Opinion Shift: {turn.stanceShift.previousScore.toFixed(1)} ➔ {turn.stanceShift.newScore.toFixed(1)}
                    </span>
                    <p className="text-zinc-700 italic">"{turn.stanceShift.reasonForShift}"</p>
                  </div>
                )}

                {/* Citations */}
                {turn.citedQuotes && turn.citedQuotes.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#e2e8f8] flex flex-wrap gap-1.5">
                    {turn.citedQuotes.map((q, qIdx) => {
                      const isActive = activeCitation?.quoteText === q.quoteText;
                      return (
                        <button
                          key={qIdx}
                          type="button"
                          className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] transition-all cursor-pointer ${
                            isActive ? 'bg-[#1a146b] text-white border-[#1a146b]' : 'bg-white text-[#474651] border-[#e2e8f8] hover:border-[#1a146b]'
                          }`}
                          onClick={() => onSelectCitation(q)}
                        >
                          <span className="font-mono font-bold">L{q.lineNumber}</span>
                          <span className="truncate max-w-[150px]">"{q.quoteText}"</span>
                          <ExternalLink size={9} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
