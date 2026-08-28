import React from 'react';
import { Bot, ShieldCheck, Key, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onOpenApiKey: () => void;
  onOpenAudit: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApiKey,
  onOpenAudit,
  onReset
}) => {
  return (
    <header className="navbar-container sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="navbar-brand flex items-center gap-4">
        <div className="brand-logo-badge p-2 bg-white/5 rounded-xl border border-white/10 relative">
          <Bot className="brand-icon text-white" size={24} />
          <span className="pulse-dot absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse border-2 border-black"></span>
        </div>
        <div>
          <div className="brand-title text-xl font-bold tracking-tight text-white flex items-center gap-2">
            QUORUM <span className="brand-version text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded uppercase font-bold tracking-widest border border-indigo-500/20">v2.4 PRO</span>
          </div>
          <div className="brand-subtitle text-xs text-white/40">Multi-Agent Deliberation Suite</div>
        </div>
      </div>

      <div className="navbar-controls flex items-center gap-3">
        {/* Global Toolbar Actions */}
        <div className="action-button-group flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-all"
            onClick={onOpenAudit}
            title="View Zero-Knowledge Isolation Proofs"
          >
            <ShieldCheck size={16} />
            <span>Audit Proof</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-sm font-medium transition-all"
            onClick={onOpenApiKey}
            title="Configure Live LLM Provider"
          >
            <Key size={16} />
            <span>API Keys</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all ml-2"
            onClick={onReset}
            title="Close Dashboard & Return Home"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
