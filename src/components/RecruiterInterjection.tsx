import React, { useState } from 'react';
import { Send, UserCheck, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface RecruiterInterjectionProps {
  onSubmitInterjection: (question: string) => Promise<void>;
  isLoading: boolean;
}

export const RecruiterInterjection: React.FC<RecruiterInterjectionProps> = ({
  onSubmitInterjection,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="flex flex-col bg-white border border-[#e2e8f8] rounded-lg overflow-hidden shadow-2xs transition-all">
      {/* Collapsible Slim Bar Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-3 px-4 bg-[#f9f9ff] hover:bg-[#f0f3ff] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#e7eefe] flex items-center justify-center text-[#1a146b]">
            <UserCheck size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#151c27]">Recruiter 5th-Chair Interjection</h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#1a146b] border border-[#e2e8f8] font-bold uppercase">
                Optional
              </span>
            </div>
            <p className="text-[10px] text-[#474651]">Inject hypotheses or policy constraints into the panel debate</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs font-semibold text-[#1a146b] px-2.5 py-1 rounded bg-white border border-[#e2e8f8] hover:border-[#1a146b] transition-all"
          >
            {isOpen ? 'Collapse' : 'Interject'}
          </button>
          <div className="text-[#474651]">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded Content Body */}
      {isOpen && (
        <div className="p-4 border-t border-[#e2e8f8] bg-white space-y-3 animate-in fade-in duration-200">
          {/* Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 custom-scrollbar">
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
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
