import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Mic, Radio, Volume2 } from 'lucide-react';
import type { DebateTurn } from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';
import { ttsEngine } from '../engine/ttsEngine';

interface VoiceStudioProps {
  turns: DebateTurn[];
  activeTurnIndex: number;
  onTurnChange: (index: number) => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  turns,
  activeTurnIndex,
  onTurnChange
}) => {
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

      ctx.strokeStyle = 'rgba(26, 20, 107, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (isPlaying && !isPaused && amplitude > 0) {
        for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
          ctx.beginPath();
          ctx.strokeStyle = '#312e81';
          ctx.globalAlpha = 0.8 - waveIdx * 0.25;
          ctx.lineWidth = 2 - waveIdx * 0.5;

          for (let x = 0; x < width; x++) {
            const freq = 0.03 + waveIdx * 0.015;
            const ampVal = amplitude * (12 + waveIdx * 5);
            const y = centerY + Math.sin(x * freq + phase + waveIdx) * ampVal * Math.sin((x / width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        phase += 0.15;
      } else {
        ctx.strokeStyle = 'rgba(26, 20, 107, 0.25)';
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

  const handlePlayToggle = () => {
    if (!isPlaying) {
      ttsEngine.playAll(activeTurnIndex >= 0 ? activeTurnIndex : 0);
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

  const handleStop = () => {
    ttsEngine.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setAmplitude(0);
  };

  const activeTurn = activeTurnIndex >= 0 && turns[activeTurnIndex] ? turns[activeTurnIndex] : null;
  const currentSpeakerConfig = activeTurn ? AGENT_CONFIGS[activeTurn.speaker] : null;

  return (
    <div className="flex flex-col bg-white border border-[#e2e8f8] rounded-lg p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f8] mb-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className={`text-[#ba1a1a] ${isPlaying && !isPaused ? 'animate-pulse' : ''}`} />
          <div>
            <h4 className="text-xs font-bold text-[#151c27]">War Room Voice Debate</h4>
            <p className="text-[10px] text-[#474651]">Multi-Agent TTS Playback</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              isPlaying && !isPaused 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-[#1a146b] hover:bg-[#312e81] text-white'
            }`}
            onClick={handlePlayToggle}
          >
            {isPlaying && !isPaused ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Play Audio'}</span>
          </button>

          <button
            type="button"
            className="p-1.5 rounded-md bg-white border border-[#e2e8f8] text-[#474651] hover:text-[#1a146b] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
          >
            <Square size={12} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="p-2 rounded-md bg-[#f9f9ff] border border-[#e2e8f8] flex items-center justify-between">
          {currentSpeakerConfig ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white border border-[#e2e8f8] flex items-center justify-center text-[#1a146b]">
                <Mic size={13} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#151c27]">{currentSpeakerConfig.displayName}</span>
                <span className="text-[10px] text-[#474651] ml-1">({currentSpeakerConfig.title})</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#474651] flex items-center gap-1.5 py-0.5">
              <Volume2 size={13} /> Ready for playback
            </div>
          )}

          {isPlaying && (
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
              LIVE
            </span>
          )}
        </div>

        <div className="w-full bg-[#f9f9ff] border border-[#e2e8f8] rounded-md p-1.5 flex items-center justify-center h-12">
          <canvas ref={canvasRef} width={380} height={40} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
