import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Bot, MessageSquare, Scale, 
  FileText, ShieldCheck, Wifi, WifiOff, Plus, Trophy, Briefcase, Key, X, Check
} from 'lucide-react';
import type { CandidateProfile } from '../types';
import { getClientApiKey, setClientApiKey } from '../engine/llmClient';

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
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getClientApiKey() || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isLive = serverMode === 'LIVE_GEMINI' || !!getClientApiKey();

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setClientApiKey(apiKeyInput.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsKeyModalOpen(false);
      window.location.reload();
    }, 500);
  };

  const navItems = [
    { id: 'dashboard' as ActiveNavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'candidates' as ActiveNavView, label: 'Candidates', icon: Users },
    { id: 'aipanel' as ActiveNavView, label: 'AI Panel (Stage 1)', icon: Bot },
    { id: 'debates' as ActiveNavView, label: 'Panel Debates (Stage 2)', icon: MessageSquare },
    { id: 'decisions' as ActiveNavView, label: 'Decisions (Stage 3)', icon: Scale },
    { id: 'evidence' as ActiveNavView, label: 'Evidence Room', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#f9f9ff] border-r border-[#e2e8f8] flex flex-col justify-between h-screen p-4 select-none shrink-0 font-sans">
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a146b] flex items-center justify-center text-white shadow-2xs font-mono font-bold text-sm">
            🏛️
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#151c27]">Quorum</h1>
            <p className="text-[10px] text-[#474651]">Multi-Agent Deliberation Panel</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 bg-[#1a146b] hover:bg-[#312e81] text-white py-2 px-3 rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>New Interview</span>
        </button>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-white text-[#1a146b] shadow-2xs font-semibold border border-[#e2e8f8]'
                    : 'text-[#474651] hover:text-[#151c27] hover:bg-white/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#1a146b]' : 'text-[#575e70]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[#e2e8f8]">
        {/* Candidate Context Pill */}
        {candidate && (
          <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f8] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-[#575e70] uppercase font-bold">Active Subject</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold text-[#151c27] truncate">{candidate.name}</div>
            <div className="text-[10px] text-[#474651] truncate">{candidate.targetRole}</div>
          </div>
        )}

        {/* Utilities & Modals */}
        <div className="flex flex-col gap-1">
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

          {/* Server Mode Indicator — Interactive Key Config */}
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium border cursor-pointer transition-all ${
              isLive
                ? 'text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                : 'text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100'
            }`}
            title="Click to configure Gemini API Key or toggle mode"
          >
            <div className="flex items-center gap-2">
              {isLive ? (
                <Wifi size={13} className="text-emerald-600 shrink-0" />
              ) : (
                <WifiOff size={13} className="text-amber-600 shrink-0" />
              )}
              <span className="font-semibold">
                {isLive ? 'Live Gemini API' : 'Offline Demo Mode'}
              </span>
            </div>
            <Key size={11} className="text-[#575e70]" />
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2e8f8] rounded-xl max-w-md w-full p-5 shadow-2xl text-[#151c27] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f8]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#e7eefe] flex items-center justify-center text-[#1a146b]">
                  <Key size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#151c27]">Gemini API Key Settings</h3>
                  <p className="text-[10px] text-[#474651]">Toggle between Live Gemini API & Offline Demo</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded text-[#474651] hover:text-[#151c27] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#151c27] mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key (e.g. AIzaSy...)"
                  className="w-full p-2 bg-white border border-[#e2e8f8] rounded-md font-mono text-xs text-[#151c27] focus:outline-none focus:border-[#1a146b]"
                />
                <p className="text-[10px] text-[#474651] mt-1 leading-snug">
                  Key is saved in browser localStorage and never sent anywhere except directly to Google Gemini REST API.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    setClientApiKey('');
                    window.location.reload();
                  }}
                  className="text-[11px] text-rose-700 hover:underline font-semibold cursor-pointer"
                >
                  Use Offline Demo
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-3 py-1.5 rounded-md border border-[#e2e8f8] text-xs font-semibold text-[#474651] hover:text-[#151c27] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-4 py-1.5 bg-[#1a146b] hover:bg-[#312e81] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    {saveSuccess ? <Check size={13} /> : null}
                    <span>{saveSuccess ? 'Saved!' : 'Save & Activate'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
