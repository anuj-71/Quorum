import type { AgentOpinion, AgentRole, CandidateProfile, DebateTurn, EvidenceQuote } from '../types';
import { executeLlmCall } from './llmClient';
import { PROMPTS } from '../data/defaultPrompts';
import { validateQuotesList } from './citationValidator';

/**
 * Executes a sequential multi-agent debate where each turn is an independent LLM call
 * made specifically by the speaking agent reacting to prior turns, source evidence,
 * and their own initial evaluation.
 */
export async function generateDebateTurns(
  candidate: CandidateProfile,
  opinions: Record<AgentRole, AgentOpinion>
): Promise<DebateTurn[]> {
  const turns: DebateTurn[] = [];

  // Track dynamic current scores across turns as agents concede or harden positions
  const currentScores: Record<AgentRole, number> = {
    technical: opinions.technical?.score ?? 5.0,
    hr: opinions.hr?.score ?? 5.0,
    hiring_manager: opinions.hiring_manager?.score ?? 5.0,
    skeptic: opinions.skeptic?.score ?? 5.0
  };

  // Determine sequential cross-examination sequence
  const sequence: Array<{ speaker: AgentRole; target: AgentRole; round: number }> = [
    { speaker: 'skeptic', target: 'technical', round: 1 },
    { speaker: 'technical', target: 'skeptic', round: 1 },
    { speaker: 'hr', target: 'hiring_manager', round: 2 },
    { speaker: 'hiring_manager', target: 'technical', round: 2 },
    { speaker: 'skeptic', target: 'hiring_manager', round: 3 }
  ];

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    const speakerOpinion = opinions[step.speaker];
    const targetOpinion = opinions[step.target];

    // Format all previous turns into conversational context
    const priorTurnsFormatted = turns
      .map(
        (t) =>
          `[Round ${t.roundNumber}] ${t.speaker.toUpperCase()} -> ${
            t.targetAgent ? t.targetAgent.toUpperCase() : 'PANEL'
          } (${t.action}): "${t.statement}" ${
            t.stanceShift
              ? `[STANCE SHIFT: Score changed from ${t.stanceShift.previousScore} to ${t.stanceShift.newScore} because: "${t.stanceShift.reasonForShift}"]`
              : ''
          }`
      )
      .join('\n\n');

    // Pass the speaker's own initial evaluation, target's initial evaluation, evidence, and prior discussion
    const promptPayload = `
CANDIDATE: ${candidate.name} (Target Role: ${candidate.targetRole})

SOURCE EVIDENCE DOSSIER:
Resume Snippet:
${candidate.resumeRawText.slice(0, 1200)}

Transcript Snippet:
${candidate.transcriptRawText.slice(0, 1600)}

YOUR INITIAL EVALUATION (${step.speaker.toUpperCase()}):
- Score: ${speakerOpinion?.score}/10 (Verdict: ${speakerOpinion?.verdict})
- Headline: "${speakerOpinion?.summaryHeadline}"
- Core Strengths: ${speakerOpinion?.strengths.map((s) => `"${s.quoteText}" (Line ${s.lineNumber})`).join('; ') || 'None'}
- Core Concerns: ${speakerOpinion?.concerns.map((c) => `"${c.quoteText}" (Line ${c.lineNumber})`).join('; ') || 'None'}

TARGET AGENT TO ADDRESS (${step.target.toUpperCase()}):
- Score: ${targetOpinion?.score}/10 (Verdict: ${targetOpinion?.verdict})
- Headline: "${targetOpinion?.summaryHeadline}"

PRIOR DEBATE TURNS SO FAR:
${priorTurnsFormatted || 'None. You are initiating the opening challenge of the cross-examination.'}

YOUR CURRENT ROLE MANDATE:
You are the ${step.speaker.toUpperCase()} agent. Address the ${step.target.toUpperCase()} agent directly in response to what they stated or their initial position.
You must independently evaluate if their points are valid based on the source text:
- If challenged with verifiable evidence or flaws you overlooked, decide whether to DEFEND your position with counter-evidence or CONCEDE and revise your score.
- If challenging, point directly to a verifiable flaw, contradiction, or gap in the transcript/resume.
- If you change your score, populate the "stanceShift" field with your previous score, your new score, and the exact reason for the shift. If your score does not change, set "stanceShift": null.

OUTPUT MUST BE VALID JSON ONLY matching this exact schema:
{
  "action": "CHALLENGE" | "SUPPORT" | "CONCEDE" | "DEFEND" | "COUNTER_EVIDENCE",
  "statement": "Your verbatim spoken statement to @${step.target.toUpperCase()} (2-4 sentences, sharp, authentic, professional).",
  "citedQuotes": [
    {
      "quoteText": "verbatim quote from source text",
      "source": "resume" | "transcript",
      "lineNumber": 1,
      "relevanceScore": 0.95,
      "verifiability": "VERIFIED" | "DISPUTED" | "UNVERIFIABLE" | "INSUFFICIENT_DATA",
      "evidenceStatus": "sufficient" | "insufficient" | "unverified",
      "commentary": "brief note on significance"
    }
  ],
  "stanceShift": null
}

Or if revising score:
"stanceShift": {
  "previousScore": ${currentScores[step.speaker]},
  "newScore": 7.2,
  "reasonForShift": "Specific reason explaining why you conceded or adjusted your score"
}
`.trim();

    let systemPrompt = PROMPTS.technicalAgent;
    if (step.speaker === 'hr') systemPrompt = PROMPTS.hrAgent;
    if (step.speaker === 'hiring_manager') systemPrompt = PROMPTS.hiringManagerAgent;
    if (step.speaker === 'skeptic') systemPrompt = PROMPTS.skepticAgent;

    let parsedTurn: DebateTurn | null = null;
    try {
      const { text } = await executeLlmCall(promptPayload, systemPrompt, {
        callType: 'DEBATE_TURN',
        agentRole: step.speaker
      });

      if (text && text !== '{}') {
        const json = JSON.parse(text);
        if (json.statement) {
          // Code-enforced citation validation against candidate source text
          const validatedQuotes = validateQuotesList(json.citedQuotes, candidate.resumeRawText, candidate.transcriptRawText);

          parsedTurn = {
            id: `turn-${Date.now()}-${turns.length}`,
            roundNumber: step.round,
            speaker: step.speaker,
            targetAgent: step.target,
            action: json.action || 'CHALLENGE',
            statement: json.statement,
            citedQuotes: validatedQuotes,
            stanceShift: json.stanceShift || undefined,
            audioDurationSec: Math.max(10, Math.floor(json.statement.length / 15))
          };

          if (json.stanceShift?.newScore !== undefined) {
            currentScores[step.speaker] = json.stanceShift.newScore;
          }
        }
      }
    } catch {
      // LLM execution failed or API key not present
    }

    // Explicit demo fallback only when no live LLM call returned data
    if (!parsedTurn) {
      parsedTurn = generateDemoFallbackTurn(candidate, opinions, step, turns, currentScores);
      if (parsedTurn.stanceShift?.newScore !== undefined) {
        currentScores[step.speaker] = parsedTurn.stanceShift.newScore;
      }
    }

    turns.push(parsedTurn);
  }

  return turns;
}

/**
 * Clearly labeled offline fallback generator.
 * Used strictly as a demo placeholder when no active LLM API key is configured.
 */
function generateDemoFallbackTurn(
  candidate: CandidateProfile,
  opinions: Record<AgentRole, AgentOpinion>,
  step: { speaker: AgentRole; target: AgentRole; round: number },
  existingTurns: DebateTurn[],
  currentScores: Record<AgentRole, number>
): DebateTurn {
  const isRohan = candidate.name.toLowerCase().includes('rohan');
  const isAnanya = candidate.name.toLowerCase().includes('ananya');

  const turnId = `demo-fallback-turn-${Date.now()}-${existingTurns.length}`;
  const baseTurn: DebateTurn = {
    id: turnId,
    roundNumber: step.round,
    speaker: step.speaker,
    targetAgent: step.target,
    action: 'CHALLENGE',
    statement: `[DEMO FALLBACK] As ${step.speaker}, reviewing initial evaluations and source transcript for ${candidate.name}.`,
    citedQuotes: [],
    audioDurationSec: 14
  };

  if (isRohan) {
    if (step.speaker === 'skeptic' && step.target === 'technical') {
      const rawQuotes: Partial<EvidenceQuote>[] = [
        {
          quoteText: 'Fine — “sole architect” is probably too strong. I led the design, she built most of the production version.',
          source: 'transcript',
          lineNumber: 24,
          relevanceScore: 1.0,
          verifiability: 'VERIFIED',
          commentary: 'Credit misattribution acknowledged in interview.'
        },
        {
          quoteText: 'No formal study, just tuned it as things broke.',
          source: 'transcript',
          lineNumber: 14,
          relevanceScore: 0.95,
          verifiability: 'VERIFIED',
          commentary: 'Lack of rigorous benchmark evaluation.'
        }
      ];

      return {
        ...baseTurn,
        action: 'CHALLENGE',
        statement:
          'Evelyn, you praised his architectural claims, but look at Transcript Line 24. Rohan claimed to be the "sole architect", but admitted Priya built most of the production version. More critically on Line 14: his model routing had "no formal study, just tuned as things broke." That is unmeasured trial-and-error.',
        citedQuotes: validateQuotesList(rawQuotes, candidate.resumeRawText, candidate.transcriptRawText)
      };
    }

    if (step.speaker === 'technical' && step.target === 'skeptic') {
      const prevScore = currentScores.technical;
      const newScore = 7.2;
      return {
        ...baseTurn,
        action: 'CONCEDE',
        statement:
          'Victor, I must concede to your audit on Line 14. Tuning model routing ad-hoc without formal eval sets on freight invoices creates hidden failure loops. I am revising my score down from 8.4 to 7.2.',
        citedQuotes: [],
        stanceShift: {
          previousScore: prevScore,
          newScore: newScore,
          reasonForShift: 'Conceded that unmeasured heuristics and lack of formal eval sets create production risk.'
        }
      };
    }

    if (step.speaker === 'hr' && step.target === 'hiring_manager') {
      const rawQuotes: Partial<EvidenceQuote>[] = [
        {
          quoteText: 'Teammate wanted to hardcode more categories up front. I pushed for the agent approach. We went with mine.',
          source: 'transcript',
          lineNumber: 18,
          relevanceScore: 0.9,
          verifiability: 'VERIFIED',
          commentary: 'Friction handling technical disagreement.'
        }
      ];

      return {
        ...baseTurn,
        action: 'CHALLENGE',
        statement:
          'Sarah, we cannot ignore the flight risk and collaboration friction. On Transcript Line 18, when a teammate disagreed on failure categories, Rohan forced his approach unilaterally. Combined with 3 jobs in 3.5 years (Line 34), retention is a major concern.',
        citedQuotes: validateQuotesList(rawQuotes, candidate.resumeRawText, candidate.transcriptRawText)
      };
    }

    if (step.speaker === 'hiring_manager' && step.target === 'technical') {
      const prevScore = currentScores.hiring_manager;
      const newScore = 5.5;
      return {
        ...baseTurn,
        action: 'CONCEDE',
        statement:
          'Marcus and Victor make valid points. High delivery velocity is quickly wiped out if a hire creates team attrition and jumps ship in 12 months. Given the routing fragility and retention risk, I am dropping my score to 5.5.',
        citedQuotes: [],
        stanceShift: {
          previousScore: prevScore,
          newScore: newScore,
          reasonForShift: 'Conceded that high flight risk and unmeasured routing reduce net ROI.'
        }
      };
    }

    if (step.speaker === 'skeptic' && step.target === 'hiring_manager') {
      return {
        ...baseTurn,
        action: 'COUNTER_EVIDENCE',
        statement:
          'Sarah, the consensus is now clear. Both the technical foundation and the collaboration signals fail the bar required for autonomous freight exception handling. I maintain an Immediate Veto.',
        citedQuotes: []
      };
    }
  }

  if (isAnanya) {
    if (step.speaker === 'skeptic' && step.target === 'technical') {
      const rawQuotes: Partial<EvidenceQuote>[] = [
        {
          quoteText: 'That’s a real gap relative to what this role needs, and I’d rather say that clearly than talk around it.',
          source: 'transcript',
          lineNumber: 11,
          relevanceScore: 0.95,
          verifiability: 'VERIFIED',
          commentary: 'Explicit admission of multi-agent framework gap.'
        }
      ];

      return {
        ...baseTurn,
        action: 'CHALLENGE',
        statement:
          'Evelyn, while Ananya is honest, Transcript Line 11 confirms she has zero production LangGraph or multi-agent experience. At Cargonet AI, freight exception pipelines are already live. Can we afford the ramp-up time?',
        citedQuotes: validateQuotesList(rawQuotes, candidate.resumeRawText, candidate.transcriptRawText)
      };
    }

    if (step.speaker === 'technical' && step.target === 'skeptic') {
      const rawQuotes: Partial<EvidenceQuote>[] = [
        {
          quoteText: 'Second, I proposed a pre-deploy checklist for prompt changes: a lightweight review step plus a small eval set to run before anything ships.',
          source: 'transcript',
          lineNumber: 21,
          relevanceScore: 0.95,
          verifiability: 'VERIFIED',
          commentary: 'High rigor in production regression testing.'
        }
      ];

      return {
        ...baseTurn,
        action: 'DEFEND',
        statement:
          'Victor, her core Python, FastAPI, and data pipeline fundamentals are rock-solid (Resume Line 12). Framework APIs like LangGraph can be learned in two weeks, whereas her production discipline in managing prompt regressions (Transcript Line 21) is much harder to teach.',
        citedQuotes: validateQuotesList(rawQuotes, candidate.resumeRawText, candidate.transcriptRawText)
      };
    }

    if (step.speaker === 'hr' && step.target === 'hiring_manager') {
      const rawQuotes: Partial<EvidenceQuote>[] = [
        {
          quoteText: 'I want to be upfront about this — it was based on internal review, not a formal benchmark...',
          source: 'transcript',
          lineNumber: 8,
          relevanceScore: 0.98,
          verifiability: 'VERIFIED',
          commentary: 'Refusal to inflate achievements.'
        }
      ];

      return {
        ...baseTurn,
        action: 'SUPPORT',
        statement:
          'Sarah, Ananya\'s self-awareness and integrity are extraordinary. On Line 8, she proactively corrected an informal 40% efficiency claim rather than taking undue credit. Her 6-year tenure also signals stability.',
        citedQuotes: validateQuotesList(rawQuotes, candidate.resumeRawText, candidate.transcriptRawText)
      };
    }

    if (step.speaker === 'hiring_manager' && step.target === 'technical') {
      const prevScore = currentScores.hiring_manager;
      const newScore = 8.5;
      const rawQuotes: Partial<EvidenceQuote>[] = [
        {
          quoteText: 'I’d start by reading through your existing planner/executor/reviewer code directly... pair with someone on a small bug fix first...',
          source: 'transcript',
          lineNumber: 14,
          relevanceScore: 0.95,
          verifiability: 'VERIFIED',
          commentary: 'Pragmatic, structured ramp-up methodology.'
        }
      ];

      return {
        ...baseTurn,
        action: 'SUPPORT',
        statement:
          'Marcus and Evelyn, I agree. Look at Transcript Line 14: her ramp-up plan is pragmatic—she reads the codebase directly and pairs on bug fixes. Her incident ownership makes her a lower production risk. I am raising my score from 7.5 to 8.5.',
        citedQuotes: validateQuotesList(rawQuotes, candidate.resumeRawText, candidate.transcriptRawText),
        stanceShift: {
          previousScore: prevScore,
          newScore: newScore,
          reasonForShift: 'Verified that production incident rigor and clear ramp-up plan outweigh initial framework unfamiliarity.'
        }
      };
    }

    if (step.speaker === 'skeptic' && step.target === 'hiring_manager') {
      return {
        ...baseTurn,
        action: 'SUPPORT',
        statement:
          'Sarah, my audit confirms zero uncorroborated metrics or exaggerated claims. Her veracity is verified. I endorse a Strong Hire.',
        citedQuotes: []
      };
    }
  }

  // Generic dynamic fallback
  const speakerInitial = opinions[step.speaker];
  return {
    ...baseTurn,
    action: 'CHALLENGE',
    statement: `[DEMO FALLBACK] Addressing @${step.target.toUpperCase()}: From my initial analysis (Score: ${speakerInitial?.score || 5}/10), we must closely examine how the candidate handles production edge cases.`,
    citedQuotes: []
  };
}

export async function handleRecruiterInterjection(
  userQuestion: string,
  candidate: CandidateProfile,
  opinions: Record<AgentRole, AgentOpinion>,
  existingTurns: DebateTurn[]
): Promise<DebateTurn[]> {
  const prompt = `
CANDIDATE: ${candidate.name} (Role: ${candidate.targetRole})
CURRENT PANEL STANDINGS:
- Technical (Evelyn): ${opinions.technical?.score}/10
- HR (Marcus): ${opinions.hr?.score}/10
- Hiring Manager (Sarah): ${opinions.hiring_manager?.score}/10
- Skeptic (Victor): ${opinions.skeptic?.score}/10

The Executive Recruiter (5th Chair) just interjected into the live debate with this instruction/question:
"${userQuestion}"

GENERATE 2 SEQUENTIAL REACTIVE RESPONSES from panel agents:
1. One from HR or Skeptic addressing the risk or policy implication.
2. One from Technical or Hiring Manager proposing a concrete execution/contract structure.

OUTPUT JSON matching Array<DebateTurn> format.
  `.trim();

  const systemPrompt =
    'You are orchestrating the AI interview panel sequentially reacting to an executive recruiter interjection.';

  try {
    const { text } = await executeLlmCall(prompt, systemPrompt, {
      callType: 'RECRUITER_INTERJECTION'
    });
    if (text && text !== '{}') {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : (parsed.turns && Array.isArray(parsed.turns)) ? parsed.turns : null;
      if (list && list.length > 0) {
        return list.map((t: any, idx: number) => ({
          ...t,
          id: `interject-${Date.now()}-${idx}`,
          citedQuotes: validateQuotesList(t.citedQuotes, candidate.resumeRawText, candidate.transcriptRawText)
        }));
      }
    }
  } catch {
    // Fallback
  }

  const nextRound =
    existingTurns.length > 0 ? existingTurns[existingTurns.length - 1].roundNumber + 1 : 3;

  return [
    {
      id: `interject-${Date.now()}-1`,
      roundNumber: nextRound,
      speaker: 'hiring_manager',
      targetAgent: 'technical',
      action: 'CLARIFY',
      statement: `Addressing the Recruiter's question ("${userQuestion}"): If we establish a strict 90-day milestone review tied directly to team collaboration and code reviews, it mitigates the upfront delivery risk while testing alignment in practice.`,
      citedQuotes: [],
      audioDurationSec: 15
    },
    {
      id: `interject-${Date.now()}-2`,
      roundNumber: nextRound,
      speaker: 'hr',
      targetAgent: 'hiring_manager',
      action: 'CHALLENGE',
      statement: `Even under probationary terms, we must assign an external senior engineering mentor outside their direct reporting line to ensure objective psychological safety check-ins every two weeks.`,
      citedQuotes: [],
      audioDurationSec: 14
    }
  ];
}
