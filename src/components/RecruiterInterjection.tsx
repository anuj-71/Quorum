import React, { useState } from 'react';
import { Send, UserCheck, Sparkles, Loader2 } from 'lucide-react';

interface RecruiterInterjectionProps {
  onSubmitInterjection: (question: string) => Promise<void>;
  isLoading: boolean;
}

export const RecruiterInterjection: React.FC<RecruiterInterjectionProps> = ({
  onSubmitInterjection,
  isLoading
}) => {
  const [question, setQuestion] = useState('');

  const quickPrompts = [
    'What if candidate is placed on 3-month probation with mentor?',
    'Could this candidate thrive as an isolated solo R&D engineer?',
    'What specific take-home test would resolve unverified claims?'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    const q = question.trim();
    setQuestion('');
    await onSubmitInterjection(q);
  };

  return (
    <div className="flex flex-col bg-white border border-[#e2e8f8] rounded-lg p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <UserCheck size={16} className="text-[#1a146b]" />
          <div>
            <h4 className="text-xs font-bold text-[#151c27]">Recruiter 5th-Chair Interjection</h4>
            <p className="text-[10px] text-[#474651]">Inject custom constraints to re-spark debate</p>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#f0f3ff] text-[#1a146b] border border-[#e2e8f8] uppercase font-bold">
          Judge Mode
        </span>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-2 custom-scrollbar">
        <span className="text-[10px] text-[#474651] font-medium shrink-0 flex items-center gap-1">
          <Sparkles size={11} className="text-[#1a146b]" /> Presets:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="text-[10px] text-[#151c27] hover:text-[#1a146b] bg-[#f9f9ff] hover:bg-[#f0f3ff] px-2 py-1 rounded border border-[#e2e8f8] whitespace-nowrap transition-all cursor-pointer shrink-0"
            onClick={() => setQuestion(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Challenge the 4 agents with a custom hypothesis..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-white border border-[#e2e8f8] rounded-md px-3 py-1.5 text-xs text-[#151c27] placeholder:text-[#474651]/60 focus:outline-none focus:border-[#1a146b]"
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#1a146b] hover:bg-[#312e81] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Debating...</span>
            </>
          ) : (
            <>
              <Send size={12} />
              <span>Interject</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
