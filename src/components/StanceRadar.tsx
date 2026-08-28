import React from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Activity } from 'lucide-react';
import type { StanceSnapshot } from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';

interface StanceRadarProps {
  snapshots: StanceSnapshot[];
}

export const StanceRadar: React.FC<StanceRadarProps> = ({ snapshots }) => {
  return (
    <div className="flex flex-col bg-white border border-[#e2e8f8] rounded-lg p-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f8] mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#1a146b]" />
          <div>
            <h4 className="text-xs font-bold text-[#151c27]">Opinion Shifts & Stance Drift</h4>
            <p className="text-[10px] text-[#474651]">Agent score changes during deliberation</p>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="flex flex-col gap-2.5">
        {snapshots.map((snap) => {
          const config = AGENT_CONFIGS[snap.agentRole];
          const isUp = snap.shiftDelta > 0;
          const isDown = snap.shiftDelta < 0;

          return (
            <div 
              key={snap.agentRole}
              className="p-2.5 rounded-md bg-[#f9f9ff] border border-[#e2e8f8] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#151c27]">{config.displayName}</span>
                  <span className="text-[10px] text-[#474651] hidden sm:inline">({config.title})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isDown ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isUp && <TrendingUp size={10} />}
                    {isDown && <TrendingDown size={10} />}
                    {!isUp && !isDown && <Minus size={10} />}
                    <span>{isUp ? `+${snap.shiftDelta.toFixed(1)}` : snap.shiftDelta.toFixed(1)}</span>
                  </span>

                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    snap.statusTag === 'VETO_TRIGGERED' 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold' 
                      : 'bg-white text-[#474651] border border-[#e2e8f8]'
                  }`}>
                    {snap.statusTag === 'VETO_TRIGGERED' && <ShieldAlert size={9} className="mr-0.5 inline" />}
                    {snap.statusTag.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-[10px] text-[#474651]">Init: {snap.initialScore.toFixed(1)}</span>
                
                <div className="flex-1 h-2 bg-[#e2e8f8] rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-[#312e81] rounded-full transition-all duration-500"
                    style={{ width: `${snap.postDebateScore * 10}%` }}
                  />
                </div>

                <span className="text-[10px] font-bold text-[#1a146b]">
                  Final: {snap.postDebateScore.toFixed(1)}/10
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
