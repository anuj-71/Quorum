import type { DebateTurn } from '../types';
import { AGENT_CONFIGS } from '../data/defaultPrompts';

export interface VoicePlaybackCallbacks {
  onTurnStart?: (turnIndex: number, turn: DebateTurn) => void;
  onTurnEnd?: (turnIndex: number, turn: DebateTurn) => void;
  onWordBoundary?: (word: string, charIndex: number) => void;
  onPlaybackComplete?: () => void;
  onVisualizerFrame?: (amplitude: number) => void;
}

class TTSEngine {
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentTurnIndex: number = -1;
  private turns: DebateTurn[] = [];
  private callbacks: VoicePlaybackCallbacks = {};
  private visualizerInterval: number | null = null;

  public setTurns(turns: DebateTurn[], callbacks: VoicePlaybackCallbacks) {
    this.turns = turns;
    this.callbacks = callbacks;
  }

  public playAll(fromIndex: number = 0) {
    this.stop();
    if (!this.turns || this.turns.length === 0) return;
    this.isSpeaking = true;
    this.isPaused = false;
    this.currentTurnIndex = fromIndex;
    this.playTurn(this.currentTurnIndex);
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.stopVisualizer();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.startVisualizer();
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentTurnIndex = -1;
    this.stopVisualizer();
  }

  public jumpToTurn(index: number) {
    if (index >= 0 && index < this.turns.length) {
      this.playAll(index);
    }
  }

  private playTurn(index: number) {
    if (index >= this.turns.length) {
      this.stop();
      this.callbacks.onPlaybackComplete?.();
      return;
    }

    const turn = this.turns[index];
    this.currentTurnIndex = index;
    const persona = AGENT_CONFIGS[turn.speaker];

    this.callbacks.onTurnStart?.(index, turn);
    this.startVisualizer();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Fallback timer simulation for environments without speech
      const duration = (turn.audioDurationSec || 6) * 1000;
      setTimeout(() => {
        this.callbacks.onTurnEnd?.(index, turn);
        if (this.isSpeaking && !this.isPaused) {
          this.playTurn(index + 1);
        }
      }, duration);
      return;
    }

    // Prepare Web Speech Synthesis
    window.speechSynthesis.cancel(); // clean queue
    const cleanText = turn.statement.replace(/Line \d+:/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = persona.voiceRate || 1.0;
    utterance.pitch = persona.voicePitch || 1.0;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v => 
        (persona.voiceNameHint && v.name.toLowerCase().includes(persona.voiceNameHint.toLowerCase())) ||
        (turn.speaker === 'technical' && (v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Male'))) ||
        (turn.speaker === 'hr' && (v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Female'))) ||
        (turn.speaker === 'hiring_manager' && (v.name.includes('Karen') || v.name.includes('Victoria') || v.name.includes('Female'))) ||
        (turn.speaker === 'skeptic' && (v.name.includes('Fred') || v.name.includes('Alex') || v.name.includes('Male')))
      );
      if (match) utterance.voice = match;
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const spokenWord = cleanText.substring(event.charIndex, event.charIndex + (event.charLength || 6));
        this.callbacks.onWordBoundary?.(spokenWord, event.charIndex);
      }
    };

    utterance.onend = () => {
      this.callbacks.onTurnEnd?.(index, turn);
      if (this.isSpeaking && !this.isPaused) {
        // Small organic conversational pause between debate speakers
        setTimeout(() => {
          this.playTurn(index + 1);
        }, 350);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or interrupt', e);
      this.callbacks.onTurnEnd?.(index, turn);
      if (this.isSpeaking && !this.isPaused) {
        this.playTurn(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  private startVisualizer() {
    this.stopVisualizer();
    this.visualizerInterval = window.setInterval(() => {
      // Simulate live harmonic sound wave frequencies
      const baseAmp = 0.3 + Math.random() * 0.7;
      this.callbacks.onVisualizerFrame?.(baseAmp);
    }, 80);
  }

  private stopVisualizer() {
    if (this.visualizerInterval !== null) {
      clearInterval(this.visualizerInterval);
      this.visualizerInterval = null;
    }
    this.callbacks.onVisualizerFrame?.(0);
  }

  public getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      currentTurnIndex: this.currentTurnIndex
    };
  }
}

export const ttsEngine = new TTSEngine();
