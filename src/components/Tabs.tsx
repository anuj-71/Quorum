import React from 'react';
import { Bot, MessageSquare, Award } from 'lucide-react';

export type TabId = 'evaluations' | 'debate' | 'verdict';

interface TabsProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  isDebateAvailable: boolean;
  isVerdictAvailable: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChangeTab, isDebateAvailable, isVerdictAvailable }) => {
  const tabs = [
    { 
      id: 'evaluations' as TabId, 
      label: 'Stage 1: Independent Evals', 
      icon: Bot,
      disabled: false 
    },
    { 
      id: 'debate' as TabId, 
      label: 'Stage 2: Live Debate Arena', 
      icon: MessageSquare,
      disabled: !isDebateAvailable 
    },
    { 
      id: 'verdict' as TabId, 
      label: 'Stage 3: Executive Verdict', 
      icon: Award,
      disabled: !isVerdictAvailable 
    },
  ];

  return (
    <div className="w-full bg-[#0a0a0c] p-1.5 rounded-2xl border border-white/10 shadow-lg mb-6 shrink-0">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChangeTab(tab.id)}
              className={`
                relative flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200
                ${isActive 
                  ? 'bg-white/10 text-white shadow-[0_2px_12px_rgba(0,0,0,0.5)] border border-white/15' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'}
                ${tab.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
