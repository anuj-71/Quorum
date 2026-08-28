// Global polyfills for testing environment
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    getVoices: () => [],
    pending: false,
    speaking: false,
    paused: false,
    onvoiceschanged: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  } as unknown as SpeechSynthesis;

  HTMLCanvasElement.prototype.getContext = (() => {
    return {
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      strokeRect: () => {},
      fillRect: () => {},
      fillText: () => {}
    } as unknown as CanvasRenderingContext2D;
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  window.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 16) as unknown as number;
  window.cancelAnimationFrame = (id: number) => clearTimeout(id);
}
