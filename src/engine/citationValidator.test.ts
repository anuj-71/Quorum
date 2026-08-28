import { describe, it, expect } from 'vitest';
import { validateCitation, validateQuotesList } from './citationValidator';

describe('CitationValidator Engine', () => {
  const sampleTranscript = `Interviewer: Can you explain how you designed the multi-agent system?
Rohan: We built a 3-tier system with planner, executor, and reviewer agents.
Interviewer: How did you handle failures?
Rohan: We implemented exponential backoff and dead-letter queues.`;

  const sampleResume = `Rohan Malhotra
Senior AI Engineer with 3.5 years of experience in distributed agent systems.`;

  it('validates exact quote substrings in transcript', () => {
    const result = validateCitation(
      {
        quoteText: 'We built a 3-tier system with planner, executor, and reviewer agents.',
        source: 'transcript',
        lineNumber: 2
      },
      sampleResume,
      sampleTranscript
    );
    expect(result.citationValid).toBe(true);
    expect(result.verifiability).toBe('VERIFIED');
  });

  it('flags hallucinated quotes as invalid citations', () => {
    const result = validateCitation(
      {
        quoteText: 'I built the entire Linux kernel from scratch with CUDA.',
        source: 'transcript',
        lineNumber: 10
      },
      sampleResume,
      sampleTranscript
    );
    expect(result.citationValid).toBe(false);
  });

  it('validates lists of quotes in batch', () => {
    const quotes = validateQuotesList(
      [
        { quoteText: 'Rohan Malhotra', source: 'resume', lineNumber: 1 },
        { quoteText: 'Nonexistent text', source: 'transcript', lineNumber: 99 }
      ],
      sampleResume,
      sampleTranscript
    );
    expect(quotes.length).toBe(2);
    expect(quotes[0].citationValid).toBe(true);
    expect(quotes[1].citationValid).toBe(false);
  });
});
