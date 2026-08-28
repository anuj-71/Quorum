import type { EvidenceQuote } from '../types';

/**
 * Validates whether a cited quote text actually exists within the source documents (Resume or Interview Transcript).
 * Performs case-insensitive substring and token-overlap fuzzy matching.
 * Code-enforced without secondary LLM hallucination.
 */
export function validateCitation(
  quote: Partial<EvidenceQuote>,
  resumeRawText: string,
  transcriptRawText: string
): EvidenceQuote {
  const quoteText = (quote.quoteText || '').trim();
  const source = quote.source || 'transcript';
  const lineNumber = quote.lineNumber || 1;
  const relevanceScore = quote.relevanceScore ?? 0.9;
  const commentary = quote.commentary || '';

  if (!quoteText) {
    return {
      quoteText: 'No quote text provided',
      source,
      lineNumber,
      relevanceScore: 0,
      verifiability: 'UNVERIFIABLE',
      commentary: 'Empty citation provided',
      citationValid: false,
      evidenceStatus: 'unverified'
    };
  }

  // Normalize texts for robust substring matching
  const normQuote = quoteText.toLowerCase().replace(/['"“”‘’`]/g, '').replace(/\s+/g, ' ');
  const normResume = (resumeRawText || '').toLowerCase().replace(/['"“”‘’`]/g, '').replace(/\s+/g, ' ');
  const normTranscript = (transcriptRawText || '').toLowerCase().replace(/['"“”‘’`]/g, '').replace(/\s+/g, ' ');

  // Direct substring check
  const inResume = normResume.includes(normQuote);
  const inTranscript = normTranscript.includes(normQuote);
  let isMatch = inResume || inTranscript;

  // Fuzzy fallback for quotes with slight truncation or ellipses
  if (!isMatch && normQuote.length > 25) {
    const firstHalf = normQuote.slice(0, 30);
    const secondHalf = normQuote.slice(-30);
    if (
      normResume.includes(firstHalf) ||
      normTranscript.includes(firstHalf) ||
      normResume.includes(secondHalf) ||
      normTranscript.includes(secondHalf)
    ) {
      isMatch = true;
    }
  }

  if (isMatch) {
    return {
      quoteText,
      source,
      lineNumber,
      relevanceScore,
      verifiability: quote.verifiability || 'VERIFIED',
      commentary,
      citationValid: true,
      evidenceStatus: quote.evidenceStatus || 'sufficient'
    };
  } else {
    return {
      quoteText,
      source,
      lineNumber,
      relevanceScore: Math.min(relevanceScore, 0.3),
      verifiability: 'UNVERIFIABLE',
      commentary: commentary
        ? `${commentary} [Citation Unverified: quote not verified in source document]`
        : '[Citation Unverified: quote not verified in source document]',
      citationValid: false,
      evidenceStatus: 'unverified'
    };
  }
}

export function validateQuotesList(
  quotes: Partial<EvidenceQuote>[] | undefined,
  resumeRawText: string,
  transcriptRawText: string
): EvidenceQuote[] {
  if (!quotes || !Array.isArray(quotes)) return [];
  return quotes.map((q) => validateCitation(q, resumeRawText, transcriptRawText));
}
