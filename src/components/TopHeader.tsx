import React from 'react';
import { RotateCcw, Plus, Search, Trophy, Briefcase } from 'lucide-react';
import type { ActiveNavView } from './Sidebar';

interface TopHeaderProps {
  activeView: ActiveNavView;
  onOpenUpload: () => void;
  onReset: () => void;
  isDeliberating: boolean;
  onOpenCompare?: () => void;
  onOpenJobDescription?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeView,
  onOpenUpload,
  onReset,
  isDeliberating,
  onOpenCompare,
  onOpenJobDescription
}) => {
  const getViewTitle = (view: ActiveNavView) => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'candidates': return 'Candidates';
      case 'aipanel': return 'AI Panel (Stage 1: Zero-Knowledge Isolation)';
      case 'debates': return 'Panel Debates (Stage 2: Cross-Examination)';
      case 'decisions': return 'Decisions (Stage 3: Bayesian Synthesis)';
      case 'evidence': return 'Evidence Room & Ground Truth';
    }
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-[#e2e8f8] flex items-center justify-between shrink-0 z-20 font-sans shadow-xs">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <span className="text-[#1a146b] font-bold text-sm">
          {getViewTitle(activeView)}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {onOpenJobDescription && (
          <button
            type="button"
            onClick={onOpenJobDescription}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e2e8f8] bg-white hover:bg-[#f0f3ff] text-xs font-semibold text-[#151c27] shadow-2xs transition-colors cursor-pointer"
          >
            <Briefcase size={13} className="text-[#1a146b]" />
            <span>02_JD Spec</span>
          </button>
        )}

        {onOpenCompare && (
          <button
            type="button"
            onClick={onOpenCompare}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#312e81]/30 bg-[#312e81]/10 hover:bg-[#312e81]/20 text-xs font-semibold text-[#1a146b] shadow-2xs transition-colors cursor-pointer"
          >
            <Trophy size={13} className="text-amber-600" />
            <span>Compare Candidates</span>
          </button>
        )}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#474651]" />
          <input
            type="text"
            placeholder="Search quotes & claims..."
            className="h-8 pl-8 pr-3 w-48 lg:w-56 bg-white border border-[#e2e8f8] rounded-md font-mono text-xs text-[#151c27] placeholder:text-[#474651]/60 focus:outline-none focus:border-[#1a146b]"
          />
        </div>

        {isDeliberating && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#e7eefe] text-[#1a146b] text-xs font-mono font-semibold animate-pulse border border-[#312e81]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a146b] animate-ping" />
            <span>Deliberating...</span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenUpload}
          className="bg-[#1a146b] text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#312e81] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>New Interview</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          title="Reset Pipeline"
          className="p-1.5 rounded-md border border-[#e2e8f8] text-[#474651] hover:text-[#1a146b] hover:bg-[#f0f3ff] transition-all cursor-pointer"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};

