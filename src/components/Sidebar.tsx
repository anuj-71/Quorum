import React from 'react';
import { 
  LayoutDashboard, Users, Bot, MessageSquare, Scale, 
  FileText, ShieldCheck, Wifi, WifiOff, Plus, Trophy, Briefcase
} from 'lucide-react';
import type { CandidateProfile } from '../types';

export type ActiveNavView = 'dashboard' | 'candidates' | 'aipanel' | 'debates' | 'decisions' | 'evidence';

interface SidebarProps {
  activeView: ActiveNavView;
  onSelectView: (view: ActiveNavView) => void;
  candidate: CandidateProfile | null;
  serverMode: 'LIVE_GEMINI' | 'OFFLINE_DEMO' | null;
  onOpenUpload: () => void;
  onOpenAudit: () => void;
  onOpenCompare?: () => void;
  onOpenJobDescription?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  candidate,
  serverMode,
  onOpenUpload,
  onOpenAudit,
  onOpenCompare,
  onOpenJobDescription
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveNavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'candidates' as ActiveNavView, label: 'Candidates', icon: Users },
    { id: 'aipanel' as ActiveNavView, label: 'AI Panel (Stage 1)', icon: Bot },
    { id: 'debates' as ActiveNavView, label: 'Panel Debates (Stage 2)', icon: MessageSquare },
    { id: 'decisions' as ActiveNavView, label: 'Decisions (Stage 3)', icon: Scale },
    { id: 'evidence' as ActiveNavView, label: 'Evidence Room', icon: FileText },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-[#e2e8f8] flex flex-col justify-between shrink-0 select-none z-30 font-sans shadow-sm">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#e2e8f8] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#312e81] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Bot size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1a146b] tracking-tight leading-tight">Quorum</h1>
            <p className="text-[11px] text-[#474651]">Multi-Agent Deliberation Panel</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1a146b] hover:bg-[#312e81] text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>New Interview</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="px-2 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-r-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#e7eefe] text-[#1a146b] border-l-4 border-[#1a146b] font-semibold' 
                    : 'text-[#474651] hover:bg-[#f0f3ff] hover:text-[#151c27]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-[#1a146b]' : 'text-[#575e70]'} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Candidate Badge & Bottom Actions */}
      <div className="p-3 border-t border-[#e2e8f8] space-y-2 bg-[#f9f9ff]">
        {/* Active Candidate Quick Pill */}
        {candidate && (
          <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs">
            <div className="text-[9px] font-mono text-[#575e70] uppercase tracking-wider flex items-center justify-between mb-0.5">
              <span>Active Subject</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="font-semibold text-xs text-[#151c27] truncate">{candidate.name}</div>
            <div className="text-[10px] text-[#474651] truncate">{candidate.targetRole}</div>
          </div>
        )}

        {/* Utility Links */}
        <div className="flex flex-col gap-0.5 pt-1">
          {onOpenJobDescription && (
            <button
              type="button"
              onClick={onOpenJobDescription}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-[#474651] hover:text-[#1a146b] hover:bg-white transition-colors cursor-pointer text-left"
            >
              <Briefcase size={14} className="text-[#1a146b]" />
              <span>Job Spec (02_JD.pdf)</span>
            </button>
          )}

          {onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-[#474651] hover:text-[#1a146b] hover:bg-white transition-colors cursor-pointer text-left"
            >
              <Trophy size={14} className="text-amber-600" />
              <span>Compare Candidates A vs B</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAudit}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-[#474651] hover:text-[#1a146b] hover:bg-white transition-colors cursor-pointer text-left"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Audit Proof Telemetry</span>
          </button>

          {/* Server Mode Indicator — replaces API Key input */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium border ${
              serverMode === 'LIVE_GEMINI'
                ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                : serverMode === 'OFFLINE_DEMO'
                ? 'text-amber-700 border-amber-200 bg-amber-50'
                : 'text-[#474651] border-[#e2e8f8] bg-white'
            }`}
          >
            {serverMode === 'LIVE_GEMINI' ? (
              <Wifi size={13} className="text-emerald-600 shrink-0" />
            ) : (
              <WifiOff size={13} className="text-amber-600 shrink-0" />
            )}
            <span>
              {serverMode === 'LIVE_GEMINI'
                ? 'Live Gemini API'
                : serverMode === 'OFFLINE_DEMO'
                ? 'Offline Demo Mode'
                : 'Connecting…'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

