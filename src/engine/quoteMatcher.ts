// Bidirectional Quote Matcher and Line Highlighter Utility

export interface SourceLine {
  lineNumber: number;
  text: string;
  isHighlighted?: boolean;
  highlightCategory?: 'cyan' | 'emerald' | 'amber' | 'crimson';
  highlightCommentary?: string;
}

export function parseSourceIntoLines(rawText: string): SourceLine[] {
  if (!rawText) return [];
  const rawLines = rawText.split('\n');
  return rawLines.map((line, idx) => ({
    lineNumber: idx + 1,
    text: line,
    isHighlighted: false
  }));
}

export function findQuoteLine(rawText: string, quote: string): number {
  if (!rawText || !quote) return -1;
  const lines = rawText.split('\n');
  const cleanQuote = quote.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  
  // Try exact inclusion first
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(quote.toLowerCase().slice(0, 30))) {
      return i + 1;
    }
  }

  // Try normalized word-overlap search
  const quoteWords = cleanQuote.split(/\s+/).filter(w => w.length > 3);
  if (quoteWords.length === 0) return -1;

  let bestMatchLine = -1;
  let maxMatchedWords = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineClean = lines[i].toLowerCase().replace(/[^a-z0-9]/g, ' ');
    let matches = 0;
    for (const word of quoteWords) {
      if (lineClean.includes(word)) matches++;
    }
    if (matches > maxMatchedWords && matches >= Math.min(3, quoteWords.length)) {
      maxMatchedWords = matches;
      bestMatchLine = i + 1;
    }
  }

  return bestMatchLine;
}

export function highlightLinesMatchingQuote(
  lines: SourceLine[],
  targetQuote: string,
  targetLineNumber?: number,
  theme: 'cyan' | 'emerald' | 'amber' | 'crimson' = 'cyan',
  commentary?: string
): SourceLine[] {
  const lineToHighlight = targetLineNumber && targetLineNumber > 0 
    ? targetLineNumber 
    : findQuoteLine(lines.map(l => l.text).join('\n'), targetQuote);

  return lines.map(line => {
    // If line matches target lineNumber, or contains the quote directly
    const isDirectMatch = line.lineNumber === lineToHighlight;
    const isTextMatch = targetQuote && targetQuote.length > 15 && line.text.toLowerCase().includes(targetQuote.toLowerCase().slice(0, 25));

    if (isDirectMatch || isTextMatch) {
      return {
        ...line,
        isHighlighted: true,
        highlightCategory: theme,
        highlightCommentary: commentary
      };
    }
    return {
      ...line,
      isHighlighted: false
    };
  });
}
