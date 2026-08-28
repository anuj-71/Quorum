import React from 'react';
import { 
  Bot, Sparkles, Upload, Play, ShieldCheck, ArrowRight, 
  Cpu, Users, Briefcase, ShieldAlert, CheckCircle2, ChevronRight, Zap 
} from 'lucide-react';
import { PRELOADED_SCENARIOS } from '../data/preloadedCandidates';

interface LandingPageProps {
  onSelectScenario: (key: string) => void;
  onOpenUpload: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectScenario, onOpenUpload }) => {
  const agents = [
    {
      name: 'Dr. Evelyn Vance',
      role: 'Principal Systems Architect',
      focus: 'Distributed Systems & Scalability',
      color: '#00f0ff',
      bg: 'rgba(0, 240, 255, 0.08)',
      border: 'rgba(0, 240, 255, 0.25)',
      icon: Cpu,
    },
    {
      name: 'Marcus Sterling',
      role: 'VP of People & Culture',
      focus: 'Team Dynamics & Culture Multiplier',
      color: '#00ff9d',
      bg: 'rgba(0, 255, 157, 0.08)',
      border: 'rgba(0, 255, 157, 0.25)',
      icon: Users,
    },
    {
      name: 'Sarah Chen',
      role: 'Director of Engineering & ROI',
      focus: 'Business Impact & Trade-offs',
      color: '#ffb700',
      bg: 'rgba(255, 183, 0, 0.08)',
      border: 'rgba(255, 183, 0, 0.25)',
      icon: Briefcase,
    },
    {
      name: 'Victor "The Inquisitor" Thorne',
      role: 'Lead Technical Auditor & Risk Officer',
      focus: 'Contradiction Detection & Vetoes',
      color: '#ff0055',
      bg: 'rgba(255, 0, 85, 0.08)',
      border: 'rgba(255, 0, 85, 0.25)',
      icon: ShieldAlert,
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#050508] text-white flex flex-col justify-start relative selection:bg-indigo-500/30 selection:text-white pb-12">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-rose-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.25)]">
            <Bot size={18} className="text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-sm">QUORUM</span>
              <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full border border-indigo-500/30">
                v2.4 PRO
              </span>
            </div>
            <div className="text-[10px] text-zinc-500">Autonomous Multi-Agent Deliberation Suite</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-zinc-400 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5 font-mono text-[10px]">
            <ShieldCheck size={12} className="text-emerald-400" /> Zero-Knowledge Token Isolation
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center text-center px-4 sm:px-6 pt-6 sm:pt-8 gap-6">
        
        {/* Shimmering Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-zinc-300 shadow-md backdrop-blur-md">
          <Sparkles size={12} className="text-indigo-400 animate-pulse" />
          <span className="font-medium">Autonomous Multi-Agent Deliberation</span>
          <span className="text-zinc-600">•</span>
          <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
            4 Isolated Evaluators <Zap size={10} />
          </span>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-2 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Uncompromising Hiring Decisions Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
              Multi-Agent AI Debate
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Four specialized AI evaluators scrutinize transcripts, cross-examine claims in a live dialectical debate arena, and compute deterministic Bayesian verdicts.
          </p>
        </div>

        {/* Primary Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl text-left items-stretch mt-2">
          
          {/* Card 1: Custom Upload */}
          <div 
            onClick={onOpenUpload}
            className="group cursor-pointer flex flex-col justify-between p-5 rounded-2xl bg-[#0a0a0e]/95 border border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-200 relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Upload size={17} />
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wider">
                  LIVE LLM REASONING
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                Analyze Custom Dossier
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                Upload your candidate resumes and interview transcripts. Execute 4 isolated agent evaluations in parallel with live OpenAI, Anthropic, or Gemini models.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-400">
              <span className="text-zinc-500 text-[10px] font-normal">Supports PDF, TXT, Raw Paste</span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Start Pipeline</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Sandbox */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-[#0a0a0e]/95 border border-white/10 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Play size={17} />
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-wider">
                  INSTANT SIMULATION
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Explore Demo Archetypes
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                Pre-calculated deliberation sessions demonstrating dealbreaker vetoes and debate dynamics:
              </p>

              {/* Archetype Quick-Launch Buttons */}
              <div className="flex flex-col gap-2">
                {Object.entries(PRELOADED_SCENARIOS).map(([key, scenario]) => {
                  const isJerk = key === 'brilliant_jerk';
                  const isInflator = key === 'resume_inflator';
                  return (
                    <button
                      key={key}
                      onClick={() => onSelectScenario(key)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/30 transition-all text-xs text-left group/btn cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isJerk ? 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]' : isInflator ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]'}`} />
                        <div className="truncate">
                          <div className="font-semibold text-white group-hover/btn:text-emerald-300 transition-colors text-[11px]">
                            {scenario.profile.archetypeTitle}
                          </div>
                          <div className="text-[9px] text-zinc-500 truncate max-w-[220px]">
                            {scenario.profile.name} • {scenario.profile.targetRole}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-zinc-500 group-hover/btn:text-emerald-400 group-hover/btn:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* The 4 AI Agents Showcase */}
        <div className="w-full max-w-4xl flex flex-col items-center mt-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5">
            <Sparkles size={11} className="text-indigo-400" />
            <span>The 4 Specialized AI Evaluators</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full text-left">
            {agents.map((ag, i) => {
              const Icon = ag.icon;
              return (
                <div 
                  key={i} 
                  className="p-3 rounded-xl bg-[#0a0a0e] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between shadow-md"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                      style={{ backgroundColor: ag.bg, color: ag.color, border: `1px solid ${ag.border}` }}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{ag.name}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{ag.role}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-light leading-snug">
                    {ag.focus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer Feature Badges */}
      <footer className="w-full max-w-5xl mx-auto py-6 mt-8 border-t border-white/5 flex items-center justify-center gap-6 text-[10px] text-zinc-500 flex-wrap shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Deterministic Token Isolation</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <Bot size={13} className="text-indigo-400" />
          <span>Non-Averaging Bayesian Verdicts</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-cyan-400" />
          <span>Line-Exact Source Grounding</span>
        </div>
      </footer>
    </div>
  );
};
