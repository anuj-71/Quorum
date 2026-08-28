import React, { useEffect, useRef, useState } from 'react';
import { FileText, MessageSquare, CheckCircle, Search, Sparkles } from 'lucide-react';
import type { CandidateProfile, EvidenceQuote } from '../types';
import { parseSourceIntoLines } from '../engine/quoteMatcher';

interface DossierViewerProps {
  candidate: CandidateProfile;
  activeCitation: EvidenceQuote | null;
  onClearCitation?: () => void;
}

export const DossierViewer: React.FC<DossierViewerProps> = ({
  candidate,
  activeCitation
}) => {
  const [userTab, setUserTab] = useState<'transcript' | 'resume'>('transcript');
  const [searchTerm, setSearchTerm] = useState('');
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const activeTab = activeCitation ? (activeCitation.source === 'resume' ? 'resume' : 'transcript') : userTab;
  const isResumeTab = activeTab === 'resume';
  const rawText = isResumeTab ? candidate.resumeRawText : candidate.transcriptRawText;
  const lines = parseSourceIntoLines(rawText);

  useEffect(() => {
    if (activeCitation) {
      const targetLine = activeCitation.lineNumber;
      const timer = setTimeout(() => {
        const el = lineRefs.current[targetLine];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [activeCitation]);

  return (
    <div className="flex flex-col h-full bg-white border border-[#e2e8f8] rounded-lg overflow-hidden shadow-2xs font-sans">
      {/* Candidate Profile Summary Header */}
      <div className="p-4 border-b border-[#e2e8f8] bg-[#f9f9ff]">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e7eefe] text-[#1a146b] border border-[#312e81]/20 uppercase tracking-wider font-mono">
            {candidate.archetypeTitle}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-white text-[#474651] border border-[#e2e8f8] font-mono">
            {candidate.experienceYears} YoE
          </span>
        </div>

        <h2 className="text-lg font-bold text-[#151c27]">{candidate.name}</h2>
        <div className="text-xs text-[#474651] mt-0.5 mb-2.5">
          {candidate.targetRole} • {candidate.currentCompany}
        </div>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {candidate.skills.map((s, i) => (
            <span 
              key={i} 
              className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded border font-medium ${
                s.verified 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-white text-[#474651] border-[#e2e8f8]'
              }`}
            >
              {s.verified && <CheckCircle size={9} className="mr-1 text-emerald-600" />}
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="px-3 py-2 bg-white border-b border-[#e2e8f8] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-0.5 bg-[#f0f3ff] rounded-md border border-[#e2e8f8]">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'transcript' 
                ? 'bg-[#1a146b] text-white shadow-xs' 
                : 'text-[#474651] hover:text-[#151c27]'
            }`}
            onClick={() => setUserTab('transcript')}
          >
            <MessageSquare size={12} />
            <span>Transcript</span>
            <span className="text-[9px] px-1 rounded bg-white/20 text-white font-mono">LIVE</span>
          </button>
          
          <button
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'resume' 
                ? 'bg-[#1a146b] text-white shadow-xs' 
                : 'text-[#474651] hover:text-[#151c27]'
            }`}
            onClick={() => setUserTab('resume')}
          >
            <FileText size={12} />
            <span>Resume</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-1 bg-[#f9f9ff] border border-[#e2e8f8] rounded-md px-2 py-1 text-xs max-w-[140px]">
          <Search size={11} className="text-[#474651] shrink-0" />
          <input
            type="text"
            placeholder="Filter lines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-[#151c27] text-[11px] placeholder:text-[#474651]/50 w-full"
          />
        </div>
      </div>

      {/* Active Citation Notification */}
      {activeCitation && (
        <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-200 flex items-start gap-2">
          <Sparkles size={13} className="text-[#1a146b] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono font-bold text-[#1a146b] tracking-wider">
              LINKED CITATION (LINE {activeCitation.lineNumber}) • 100% GROUNDED
            </div>
            <div className="text-[11px] text-zinc-700 italic truncate">
              "{activeCitation.quoteText}"
            </div>
          </div>
        </div>
      )}

      {/* Document Content View */}
      <div className="flex-1 overflow-y-auto p-2 bg-[#f9f9ff] font-mono text-[11px] leading-relaxed custom-scrollbar">
        {lines.map((line) => {
          const isMatch = activeCitation && 
            ((activeCitation.source === 'resume' && isResumeTab) || (activeCitation.source === 'transcript' && !isResumeTab)) &&
            (line.lineNumber === activeCitation.lineNumber || (activeCitation.quoteText.length > 20 && line.text.includes(activeCitation.quoteText.slice(0, 25))));

          const isSearchHit = searchTerm && line.text.toLowerCase().includes(searchTerm.toLowerCase());

          return (
            <div
              key={line.lineNumber}
              ref={(el) => { lineRefs.current[line.lineNumber] = el; }}
              className={`flex items-start gap-3 px-2 py-0.5 rounded transition-colors ${
                isMatch 
                  ? 'bg-indigo-100 text-[#1a146b] font-bold border-l-2 border-[#1a146b] pl-1.5' 
                  : isSearchHit 
                  ? 'bg-amber-100 text-amber-900' 
                  : 'text-[#474651] hover:bg-white hover:text-[#151c27]'
              }`}
            >
              <span className={`w-8 text-right shrink-0 select-none text-[10px] ${isMatch ? 'text-[#1a146b] font-bold' : 'text-[#777682]'}`}>
                {line.lineNumber}
              </span>
              <span className="break-all whitespace-pre-wrap flex-1">
                {line.text || ' '}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
