import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, Square, Mic, Radio, Volume2, 
  ChevronDown, ChevronUp, SkipBack, SkipForward,
  Cpu, Users, Briefcase, ShieldAlert
} from 'lucide-react';
import type { DebateTurn, AgentRole } from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';
import { ttsEngine } from '../engine/ttsEngine';

interface VoiceStudioProps {
  turns: DebateTurn[];
  activeTurnIndex: number;
  onTurnChange: (index: number) => void;
  defaultOpen?: boolean;
}

const getAgentIcon = (role: AgentRole) => {
  switch (role) {
    case 'technical': return <Cpu size={14} className="text-[#1a146b]" />;
    case 'hr': return <Users size={14} className="text-[#00875a]" />;
    case 'hiring_manager': return <Briefcase size={14} className="text-[#b76e00]" />;
    case 'skeptic': return <ShieldAlert size={14} className="text-[#ba1a1a]" />;
    default: return <Mic size={14} className="text-[#1a146b]" />;
  }
};

const getAgentThemeBorder = (role: AgentRole) => {
  switch (role) {
    case 'technical': return 'border-l-4 border-l-[#1a146b] bg-[#e7eefe]/40';
    case 'hr': return 'border-l-4 border-l-[#00875a] bg-[#e3fcef]/40';
    case 'hiring_manager': return 'border-l-4 border-l-[#b76e00] bg-[#fff0b3]/30';
    case 'skeptic': return 'border-l-4 border-l-[#ba1a1a] bg-[#ffebe6]/40';
    default: return 'border-l-4 border-l-[#1a146b] bg-[#f9f9ff]';
  }
};

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  turns,
  activeTurnIndex,
  onTurnChange,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    ttsEngine.setTurns(turns, {
      onTurnStart: (idx) => {
        onTurnChange(idx);
        setIsPlaying(true);
        setIsPaused(false);
      },
      onTurnEnd: () => {},
      onPlaybackComplete: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setAmplitude(0);
      },
      onVisualizerFrame: (amp) => {
        setAmplitude(amp);
      }
    });

    return () => {
      ttsEngine.stop();
    };
  }, [turns, onTurnChange]);

  // Audio wave canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.strokeStyle = 'rgba(26, 20, 107, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (isPlaying && !isPaused && amplitude > 0) {
        for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
          ctx.beginPath();
          ctx.strokeStyle = waveIdx === 0 ? '#1a146b' : waveIdx === 1 ? '#312e81' : '#5654a8';
          ctx.globalAlpha = 0.85 - waveIdx * 0.25;
          ctx.lineWidth = 2.5 - waveIdx * 0.6;

          for (let x = 0; x < width; x++) {
            const freq = 0.035 + waveIdx * 0.015;
            const ampVal = amplitude * (14 + waveIdx * 6);
            const y = centerY + Math.sin(x * freq + phase + waveIdx) * ampVal * Math.sin((x / width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        phase += 0.16;
      } else {
        ctx.strokeStyle = 'rgba(26, 20, 107, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, amplitude, activeTurnIndex, turns]);

  const handlePlayToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isPlaying) {
      const startIndex = activeTurnIndex >= 0 && activeTurnIndex < turns.length ? activeTurnIndex : 0;
      ttsEngine.playAll(startIndex);
      setIsPlaying(true);
      setIsPaused(false);
    } else if (isPaused) {
      ttsEngine.resume();
      setIsPaused(false);
    } else {
      ttsEngine.pause();
      setIsPaused(true);
    }
  };

  const handleStop = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    ttsEngine.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setAmplitude(0);
  };

  const handleNextTurn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIdx = Math.min(turns.length - 1, activeTurnIndex + 1);
    if (nextIdx !== activeTurnIndex) {
      onTurnChange(nextIdx);
      if (isPlaying) {
        ttsEngine.jumpToTurn(nextIdx);
      }
    }
  };

  const handlePrevTurn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prevIdx = Math.max(0, activeTurnIndex - 1);
    if (prevIdx !== activeTurnIndex) {
      onTurnChange(prevIdx);
      if (isPlaying) {
        ttsEngine.jumpToTurn(prevIdx);
      }
    }
  };

  const handleJumpToTurn = (index: number) => {
    onTurnChange(index);
    if (isPlaying) {
      ttsEngine.jumpToTurn(index);
    }
  };

  const activeTurn = activeTurnIndex >= 0 && turns[activeTurnIndex] ? turns[activeTurnIndex] : turns[0] || null;
  const currentSpeakerConfig = activeTurn ? AGENT_CONFIGS[activeTurn.speaker] : null;
  const progressPercent = turns.length > 0 ? Math.round(((Math.max(0, activeTurnIndex) + 1) / turns.length) * 100) : 0;

  return (
    <div className="flex flex-col bg-white border border-[#e2e8f8] rounded-lg overflow-hidden shadow-2xs transition-all">
      {/* Collapsible Slim Bar Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-3 px-4 bg-[#f9f9ff] hover:bg-[#f0f3ff] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#e7eefe] flex items-center justify-center text-[#1a146b] shrink-0">
            <Radio size={14} className={isPlaying && !isPaused ? 'animate-pulse text-[#ba1a1a]' : 'text-[#1a146b]'} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-[#151c27]">War Room Voice Debate</h4>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                isPlaying && !isPaused 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 animate-pulse' 
                  : isPaused 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-white text-[#474651] border border-[#e2e8f8]'
              }`}>
                {isPlaying && !isPaused ? '● Live Synthesizing' : isPaused ? '⏸ Paused' : 'Voice Synthesis'}
              </span>
            </div>
            <p className="text-[10px] text-[#474651] truncate">
              {isPlaying && currentSpeakerConfig 
                ? `Speaking: ${currentSpeakerConfig.displayName} (${activeTurnIndex + 1}/${turns.length})` 
                : 'Multi-agent text-to-speech cross-examination'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Header Play/Pause Button */}
          <button
            type="button"
            onClick={handlePlayToggle}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isPlaying && !isPaused 
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200' 
                : isPaused
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-[#1a146b] hover:bg-[#312e81] text-white'
            }`}
          >
            {isPlaying && !isPaused ? <Pause size={11} /> : <Play size={11} />}
            <span>{isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Play'}</span>
          </button>

          <button
            type="button"
            className="text-xs font-semibold text-[#1a146b] px-2 py-1 rounded bg-white border border-[#e2e8f8] hover:border-[#1a146b] transition-all flex items-center gap-1"
          >
            <span>{isOpen ? 'Collapse' : 'Studio'}</span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Studio Body */}
      {isOpen && (
        <div className="p-4 border-t border-[#e2e8f8] bg-white space-y-4 animate-in fade-in duration-200">
          {/* Playback Progress Indicator */}
          <div className="space-y-1.5 bg-[#f9f9ff] p-3 rounded-lg border border-[#e2e8f8]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-semibold text-[#151c27] flex items-center gap-1.5">
                <Volume2 size={13} className="text-[#1a146b]" />
                <span>Playback Progress</span>
              </span>
              <span className="text-[#474651]">
                Turn <strong className="text-[#1a146b]">{Math.max(0, activeTurnIndex) + 1}</strong> of <strong>{turns.length}</strong> ({progressPercent}%)
              </span>
            </div>
            
            <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-[#1a146b] to-[#312e81] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Active Speaker Spotlight Card */}
          {activeTurn && currentSpeakerConfig ? (
            <div className={`p-3.5 rounded-lg border border-[#e2e8f8] flex flex-col gap-2.5 transition-all shadow-2xs ${getAgentThemeBorder(activeTurn.speaker)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f8] flex items-center justify-center shadow-2xs">
                    {getAgentIcon(activeTurn.speaker)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#151c27]">{currentSpeakerConfig.displayName}</span>
                      <span className="text-[10px] text-[#474651] font-mono">({currentSpeakerConfig.title})</span>
                    </div>
                    <span className="text-[10px] text-[#575e70]">{currentSpeakerConfig.focusArea}</span>
                  </div>
                </div>

                {isPlaying && !isPaused ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    SPEAKING NOW
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#474651] bg-white px-2 py-0.5 rounded border border-[#e2e8f8]">
                    Selected Speaker
                  </span>
                )}
              </div>

              {/* Spoken Quote Preview */}
              <div className="p-2.5 bg-white/90 rounded border border-[#e2e8f8] text-xs text-[#151c27] leading-relaxed italic line-clamp-2 font-light">
                "{activeTurn.statement.replace(/Line \d+:/g, '').trim()}"
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#f9f9ff] border border-[#e2e8f8] text-center text-xs text-[#474651]">
              Ready for playback. Select a turn or press Play to begin cross-examination synthesis.
            </div>
          )}

          {/* Interactive Turn Scrubbing Queue */}
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#474651] mb-1.5 flex items-center justify-between">
              <span>Debate Turn Sequence</span>
              <span>Click turn to jump audio</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {turns.map((turn, idx) => {
                const isActive = activeTurnIndex === idx;
                const config = AGENT_CONFIGS[turn.speaker];
                return (
                  <button
                    key={turn.id || idx}
                    type="button"
                    onClick={() => handleJumpToTurn(idx)}
                    className={`px-2.5 py-1.5 rounded-md border text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isActive 
                        ? 'bg-[#1a146b] text-white border-[#1a146b] font-semibold shadow-2xs' 
                        : 'bg-[#f9f9ff] hover:bg-[#f0f3ff] text-[#151c27] border-[#e2e8f8]'
                    }`}
                  >
                    <span className="font-mono text-[10px]">T{idx + 1}</span>
                    <span className="truncate max-w-[90px]">{config?.displayName.split(' ')[0] || turn.speaker}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Waveform Canvas */}
          <div className="w-full bg-[#f9f9ff] border border-[#e2e8f8] rounded-md p-1.5 flex items-center justify-center h-14">
            <canvas ref={canvasRef} width={420} height={48} className="w-full h-full" />
          </div>

          {/* Full Playback Control Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f8]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevTurn}
                disabled={activeTurnIndex <= 0}
                className="p-2 rounded-md bg-white border border-[#e2e8f8] text-[#474651] hover:text-[#1a146b] hover:border-[#1a146b] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Previous Turn"
              >
                <SkipBack size={13} />
              </button>

              <button
                type="button"
                onClick={handlePlayToggle}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  isPlaying && !isPaused 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200' 
                    : isPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#1a146b] hover:bg-[#312e81] text-white'
                }`}
              >
                {isPlaying && !isPaused ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlaying && !isPaused ? 'Pause Playback' : isPaused ? 'Resume Audio' : 'Play Full Debate'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextTurn}
                disabled={activeTurnIndex >= turns.length - 1}
                className="p-2 rounded-md bg-white border border-[#e2e8f8] text-[#474651] hover:text-[#1a146b] hover:border-[#1a146b] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Next Turn"
              >
                <SkipForward size={13} />
              </button>

              <button
                type="button"
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="p-2 rounded-md bg-white border border-[#e2e8f8] text-[#474651] hover:text-rose-700 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Stop & Reset"
              >
                <Square size={13} />
              </button>
            </div>

            <div className="text-[10px] font-mono text-[#575e70]">
              Speech Synthesis API
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
