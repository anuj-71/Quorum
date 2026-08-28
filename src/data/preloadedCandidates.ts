import type { CandidateProfile, AgentOpinion, DebateTurn, FinalDecisionDossier, JobDescription, CandidateComparisonEntry, AgentRole } from '../types';
import { parseProfileFromRawText } from '../engine/profileBuilder';
import { computeNonAveragingDecision } from '../engine/decisionEngine';
import { validateQuotesList } from '../engine/citationValidator';

export interface PreloadedScenario {
  profile: CandidateProfile;
  isolatedOpinions: Record<string, AgentOpinion>;
  debateTurns: DebateTurn[];
  finalDossier: FinalDecisionDossier;
}

export const OFFICIAL_JOB_DESCRIPTION: JobDescription = {
  id: '02_job_description',
  roleTitle: 'AI Engineer — Agentic Systems (Freight Operations)',
  company: 'Cargonet AI',
  experienceRequired: '3+ Years Python Backend & Applied AI/LLM Systems',
  coreResponsibilities: [
    'Improve the multi-agent AI system (planner, executor, reviewer, and specialized agents) that powers freight operations: quoting, booking, tracking, document processing, and error handling.',
    'Build features mainly by directing AI coding tools (like Claude Code) — reviewing and guiding their output, not just writing code yourself.',
    'Work on the Python backend (small services) and the React.js front-end, using MongoDB as the database, to build clean features and easy-to-use screens for operators.',
    'Improve how the AI is prompted, what tools/memory it has access to, and how it searches for relevant information (RAG / vector search); help decide which AI models to use for the best balance of quality and cost.',
    'Keep the live system running smoothly — find and fix bugs when an AI agent misbehaves, and improve how we test and monitor the system.',
    'Help connect the system to outside tools: carrier/shipping APIs, other business software, and document scanning (OCR) for extracting data from shipping documents like invoices.'
  ],
  mandatorySkills: [
    'Solid Python backend skills (building APIs, working with small microservices)',
    'Real hands-on experience with AI/LLM systems (prompt writing, RAG/vector search, and eval testing)',
    'Comfortable taking production ownership when an AI agent misbehaves or breaks in live operations',
    'Basic React.js skills for building operator-facing front-end screens',
    'Nice to have: freight/logistics domain, OCR document scanning (BOLs/invoices), carrier API integrations'
  ],
  culturalValues: [
    'Production Ownership: Care as much about keeping things working reliably over time as about building the first version.',
    'Intellectual Honesty: Transparent disclosure of mistakes, gaps, and rigorous measurement vs informal vanity metrics.',
    'Collaborative Multiplier: Direct communication, cross-functional review processes, and pre-deploy safety checklists.'
  ],
  dealbreakers: [
    'Uncontrolled prompt pushes directly to production without review or evaluation sets.',
    'Misattribution of team accomplishments or claiming sole authorship over collaborative codebase.',
    'Inability to diagnose and resolve production agent failures in real-time.'
  ],
  rawText: `Job Description: AI Engineer — Agentic Systems (Freight Operations)
Company: Cargonet AI — a freight-tech company that runs AI “agent” systems in real production, handling things like shipment quoting, booking, tracking, document processing, and fixing errors automatically.

About the Role
We need an engineer to help improve our existing AI agent system (think of it as multiple AI workers — a planner, an executor, a reviewer, and specialized agents — working together). This is not a research-only job. You will build real features that go live for real users, mostly by directing AI coding tools (like Claude Code) rather than writing every line by hand — and you’ll be responsible for fixing things when they break in production.

What You'll Do
• Improve the multi-agent AI system (planner, executor, reviewer, and other agents) that powers freight operations: quoting, booking, tracking, document processing, and error handling.
• Build features mainly by directing AI coding tools (like Claude Code) — reviewing and guiding their output, not just writing code yourself.
• Work on the Python backend (built as small services) and the React.js front-end, using MongoDB as the database, to build clean features and easy-to-use screens for operators.
• Improve how the AI is prompted, what tools/memory it has access to, and how it searches for relevant information (RAG / vector search); help decide which AI models to use for the best balance of quality and cost.
• Keep the live system running smoothly — find and fix bugs when an AI agent misbehaves, and improve how we test and monitor the system.
• Help connect the system to outside tools: carrier/shipping APIs, other business software, and document scanning (OCR) for extracting data from shipping documents like invoices.

What We're Looking For
• Solid Python backend skills (building APIs, working with small services).
• Some real hands-on experience with AI/LLM systems — not just tutorials. Things like prompt writing, RAG/vector search, and testing how well an AI system performs.
• Comfortable taking ownership when something breaks in production, not just when a demo goes well.
• Basic React.js skills for building simple front-end screens.
• Nice to have: experience with logistics/freight, document scanning (OCR), or connecting different business systems together.

What This Role Is NOT
This is not a “build it once and move on” role. We care as much about keeping things working reliably over time as we do about building the first version.`
};

export const RAW_DOCUMENTS = {
  candidate_a: {
    resumeRawText: `Rohan Malhotra
Senior AI/Backend Engineer

Summary
AI engineer with 3.5 years of experience building multi-agent LLM systems and Python backends. Led design of a production agent platform now handling thousands of daily freight exceptions. Known for moving fast and shipping under pressure.

Experience
Senior AI Engineer — Voltrix Logistics Tech (Jan 2025 – Present, 7 months)
• Line 10: Designed and built the exception-handling engine end-to-end for Voltrix’s multi-agent freight ops platform (planner/executor/reviewer pattern), cutting manual exception review time by 40%.
• Line 11: Owned prompt design and model routing across GPT-4 and open-weight SLMs, reducing inference cost by ~30%.
• Line 12: Sole architect of the retry/escalation logic now running in production, handling 5,000+ freight exceptions/month.
• Line 13: Presented the system design at a company-wide tech talk.

AI Engineer — Quickship Data Systems (Feb 2024 – Dec 2024, 11 months)
• Line 16: Built a RAG pipeline over carrier rate documents using LangChain + Pinecone, cutting manual rate lookup time significantly.
• Line 17: Improved BOL/invoice extraction accuracy through better OCR pre-processing.

Backend Developer — Nimbus Cloud Solutions (Aug 2022 – Jan 2024, 1.5 years)
• Line 20: Built Python microservices for a SaaS analytics product used by 50+ enterprise clients.
• Line 21: Led a 4-person team migrating a legacy monolith to microservices.

Skills
Python, FastAPI, LangGraph, CrewAI, MongoDB, React (basic), RAG, Vector Search (Pinecone, FAISS), Prompt Engineering, Docker, Kubernetes

Education
B.Tech Computer Science, 2022

Certifications
• LangChain for LLM Application Development (2024)`,
    transcriptRawText: `Interview Transcript — Candidate A (Rohan Malhotra)

Technical Section
Line 4: Q1 (Interviewer): Walk me through the exception-handling engine you built at Voltrix.
Line 5: A1: It’s planner-executor-reviewer. Failures come in, get classified, retried or escalated, then double-checked. I designed the whole retry/escalation logic.
Line 7: Q2: What made you choose that structure over a simpler rule-based system?
Line 8: A2: Rules don’t scale. Too many failure types — timeouts, bad EDI, missing BOL fields. Agents handle that better.
Line 10: Q3: How do you measure whether the reviewer agent is actually catching real problems?
Line 11: A3: We track override rate. It’s low. I’d have to check the exact number though, haven’t looked recently.
Line 13: Q4: What’s your approach to model routing?
Line 14: A4: Cost-based. Simple stuff to the SLM, harder reasoning to GPT-4. No formal study, just tuned it as things broke.

Behavioral Section
Line 17: Q5 (Interviewer): Tell me about a time you disagreed with a teammate on a technical decision.
Line 18: A5: Teammate wanted to hardcode more categories up front. I pushed for the agent approach. We went with mine.
Line 20: Q6: Who actually wrote the retry/escalation logic that’s in production now?
Line 21: A6: I designed it. Priya did a lot of the implementation, I reviewed her PRs. I was the architect.
Line 23: Q7 (Skeptic follow-up): Your resume says “sole architect.” But it sounds like Priya built a lot of it. Can you clarify?
Line 24: A7: Fine — “sole architect” is probably too strong. I led the design, she built most of the production version.

Ownership / Hiring Manager Section
Line 27: Q8: Why should we invest in ramping you up here versus someone with more freight-domain experience?
Line 28: A8: I move fast. I’ve built something structurally close to this already. I don’t think I’d need much ramp time.
Line 30: Q9: This role needs long-term ownership of production reliability. How do you feel about being on-call for agent failures?
Line 31: A9: Fine, I’ve done on-call before. Though Voltrix’s user base is still small, so I haven’t seen serious incident volume yet.
Line 33: Q10: You’ve had three roles in 3.5 years, each under a year except the first. What’s driving that?
Line 34: A10: Better pay and title, mostly. Voltrix is more aligned with what I want long-term.`
  },

  candidate_b: {
    resumeRawText: `Ananya Iyer
Software Engineer (Backend → AI)

Summary
Backend engineer with steady experience maintaining internal tools, recently moved into applied AI work. Comfortable with Python and standard web APIs; still building depth in AI-specific tooling.

Experience
Software Engineer II — Bridgepoint Systems (Jun 2021 – Present, 4 years)
• Line 10: Maintains Python/FastAPI microservices for an internal ops platform used by a few internal teams.
• Line 11: Helped migrate part of the document ingestion pipeline to use OCR-based extraction for scanned forms.
• Line 12: Over the last 1.5 years, started building an internal RAG-based support-ticket assistant: set up a retrieval pipeline (LangChain + Chroma); team estimated answer accuracy improved by around 40% based on informal review.
• Line 13: After a production incident (see interview), introduced a pre-deploy checklist for prompt changes that the team adopted.

Junior Backend Developer — Bridgepoint Systems (Jul 2019 – Jun 2021, 2 years)
• Line 16: Built basic REST APIs for internal tooling.
• Line 17: Worked with QA and product to define API contracts.

Skills
Python, FastAPI, MongoDB, PostgreSQL, LangChain, Chroma, basic React, OCR pipelines (Tesseract), Docker

Education
B.E. Information Technology, 2019

Note
Has not used multi-agent orchestration frameworks (LangGraph, CrewAI, AutoGen) in production — most LLM work to date has been a single-agent RAG pipeline.`,
    transcriptRawText: `Interview Transcript — Candidate B (Ananya Iyer)

Technical Section
Line 4: Q1 (Interviewer): Tell me about the RAG pipeline you built for the support-ticket assistant.
Line 5: A1: Sure — happy to walk through it step by step. We retrieve from a Chroma vector store built from past resolved tickets and internal docs. The top few matches get passed to the LLM, which drafts a response for a human agent to review before it goes out. We chunked documents by section rather than fixed length, since that kept related context together.
Line 7: Q2: Your resume mentions a ~40% accuracy improvement. How was that measured?
Line 8: A2: I want to be upfront about this — it was based on internal review, not a formal benchmark. A few of us spot-checked a sample of responses before and after the change and it felt clearly better, but I wouldn’t want to present that number as something rigorous if it comes up again.
Line 10: Q3: Have you worked with multi-agent orchestration frameworks — LangGraph, CrewAI?
Line 11: A3: Not in production. I’ve read through the docs for both and built a small planner/executor toy project on my own time, but everything I’ve actually shipped has been single-agent RAG. That’s a real gap relative to what this role needs, and I’d rather say that clearly than talk around it.
Line 13: Q4: How would you approach ramping up on multi-agent systems specifically?
Line 14: A4: I’d start by reading through your existing planner/executor/reviewer code directly, rather than a general course, since the real failure patterns usually aren’t in the docs. Then I’d want to pair with someone on a small bug fix first, before touching the architecture itself.

Behavioral Section
Line 17: Q5 (Interviewer): Tell me about a mistake you made and how you handled it.
Line 18: A5: I pushed a prompt change to the support assistant straight to production — we didn’t have a review process at the time, so nothing stopped me. It caused a spike in bad responses for about two hours before we caught it and rolled back.
Line 20: Q6: What did you do after that?
Line 21: A6: A few things. First, I ran an incident retro with the team and was direct that it was my mistake in the writeup — I didn’t want to soften that. Second, I proposed a pre-deploy checklist for prompt changes: a lightweight review step plus a small eval set to run before anything ships. It’s been part of our process since.
Line 23: Q7 (Skeptic follow-up): Was there any pushback on you owning that mistake publicly, or did you find a way to spread the responsibility?
Line 24: A7: No, I named it as mine in the retro doc. One teammate pointed out we should’ve had the checklist before this happened, which is fair — but I didn’t try to shift blame for the specific incident onto the process gap.

Ownership / Hiring Manager Section
Line 27: Q8: This role is heavily oriented around multi-agent orchestration on day one. Given you haven’t shipped that in production, how do you think about that gap?
Line 28: A8: It’s real, and I’d rather you go in with clear eyes about it than find out later. What I’d point to instead is a pattern: I’ve picked up new technical areas quickly before — OCR pipelines, then RAG — and I tend to ask for help early instead of quietly struggling, which I think matters more for ramp time than having already touched this exact framework.
Line 30: Q9: Why should we invest in ramping you up here versus someone who already has multi-agent experience?
Line 31: A9: Honestly, I can’t out-argue someone who’s already done the exact work. What I’d say is I’m a safer bet on the production-ownership side — I’ve been through a real incident and changed how the team works because of it, not just shipped something that looked good in a demo.
Line 33: Q10: You’ve been at one company for six years. Any concern about adapting to a fast-moving startup environment?
Line 34: A10: It’s a fair thing to ask about. I’d say the role itself changed a lot even though the employer didn’t — I went from junior backend work, to leading a pipeline migration, to driving our team’s move into AI. So I’ve had to keep adapting, just inside one company.`
  }
};

// Build Candidate Profiles Dynamically from Raw Documents
const profileCandidateA = parseProfileFromRawText(
  RAW_DOCUMENTS.candidate_a.resumeRawText,
  RAW_DOCUMENTS.candidate_a.transcriptRawText
);

const profileCandidateB = parseProfileFromRawText(
  RAW_DOCUMENTS.candidate_b.resumeRawText,
  RAW_DOCUMENTS.candidate_b.transcriptRawText
);

export const CANDIDATE_COMPARISON_DATA: CandidateComparisonEntry[] = [
  {
    candidateId: 'ananya-iyer',
    name: 'Ananya Iyer (Candidate B)',
    archetypeTitle: '🛡️ Production-Disciplined Generalist',
    officialArtifactId: '04_Resume_B.pdf & 06_Transcript_B.pdf',
    technicalScore: 6.8,
    hrScore: 9.6,
    hiringManagerScore: 8.5,
    skepticScore: 9.0,
    naiveAverage: 8.48,
    bayesianRecommendation: 'HIRE',
    isVetoTriggered: false,
    keyDifferentiator: 'Extreme intellectual honesty, proven production incident retro discipline (Line 21), and rapid ramp-up trajectory outweighing day-one multi-agent framework gap.',
    rank: 1
  },
  {
    candidateId: 'rohan-malhotra',
    name: 'Rohan Malhotra (Candidate A)',
    archetypeTitle: '⚡ Fast-Moving Agent Builder',
    officialArtifactId: '03_Resume_A.pdf & 05_Transcript_A.pdf',
    technicalScore: 8.4,
    hrScore: 4.8,
    hiringManagerScore: 6.5,
    skepticScore: 3.5,
    naiveAverage: 5.80,
    bayesianRecommendation: 'LEAN_NO_HIRE',
    isVetoTriggered: false,
    keyDifferentiator: 'Day-one planner/executor/reviewer experience compromised by resume credit exaggeration ("sole architect" vs Priya, Line 24) and unmeasured ad-hoc routing (Line 14).',
    rank: 2
  }
];

// Candidate A Opinions & Turns
const isolatedOpinionsA: Record<AgentRole, AgentOpinion> = {
  technical: {
    agentRole: 'technical',
    score: 8.4,
    confidence: 0.90,
    verdict: 'STRONG_HIRE',
    summaryHeadline: 'Direct multi-agent freight experience with planner/executor/reviewer pattern and model routing.',
    detailedAnalysis: 'Rohan has shipped the exact architectural pattern Cargonet AI needs (planner-executor-reviewer) in a live freight ops setting. Has hands-on experience routing between GPT-4 and SLMs, cutting inference costs by ~30%.',
    strengths: validateQuotesList([
      {
        quoteText: 'Designed and built the exception-handling engine end-to-end for Voltrix’s multi-agent freight ops platform (planner/executor/reviewer pattern)...',
        source: 'resume',
        lineNumber: 10,
        relevanceScore: 0.98,
        verifiability: 'VERIFIED',
        commentary: 'Exact match for Cargonet AI agent architecture.'
      },
      {
        quoteText: 'It’s planner-executor-reviewer. Failures come in, get classified, retried or escalated, then double-checked.',
        source: 'transcript',
        lineNumber: 5,
        relevanceScore: 0.95,
        verifiability: 'VERIFIED',
        commentary: 'Clear architectural articulation of freight exception handling.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    concerns: validateQuotesList([
      {
        quoteText: 'Cost-based. Simple stuff to the SLM, harder reasoning to GPT-4. No formal study, just tuned it as things broke.',
        source: 'transcript',
        lineNumber: 14,
        relevanceScore: 0.82,
        verifiability: 'VERIFIED',
        commentary: 'Ad-hoc model routing without rigorous evaluation sets.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-TECH-ROHAN-99A1'
  },
  hr: {
    agentRole: 'hr',
    score: 4.8,
    confidence: 0.85,
    verdict: 'LEAN_NO_HIRE',
    summaryHeadline: 'Fast operator with potential teamwork friction, credit inflation, and retention flight risk.',
    detailedAnalysis: 'Candidate pushed his approach over teammate during disagreement without collaborative consensus (Line 18). Job tenure shows 3 jobs in 3.5 years motivated by "better pay and title" (Line 34).',
    strengths: [],
    concerns: validateQuotesList([
      {
        quoteText: 'Teammate wanted to hardcode more categories up front. I pushed for the agent approach. We went with mine.',
        source: 'transcript',
        lineNumber: 18,
        relevanceScore: 0.88,
        verifiability: 'VERIFIED',
        commentary: 'Dominating approach to technical disagreements.'
      },
      {
        quoteText: 'Better pay and title, mostly. Voltrix is more aligned with what I want long-term.',
        source: 'transcript',
        lineNumber: 34,
        relevanceScore: 0.90,
        verifiability: 'VERIFIED',
        commentary: 'High flight risk across 3 roles in 3.5 years.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-HR-ROHAN-99B2'
  },
  hiring_manager: {
    agentRole: 'hiring_manager',
    score: 6.5,
    confidence: 0.80,
    verdict: 'LEAN_HIRE',
    summaryHeadline: 'Minimal ramp-up required for freight multi-agent systems, but unproven under serious incident volume.',
    detailedAnalysis: 'Rohan can immediately contribute to freight quoting and exception routing. However, Voltrix user base is small and he admitted to not having seen serious production incident volume yet (Line 31).',
    strengths: validateQuotesList([
      {
        quoteText: 'I move fast. I’ve built something structurally close to this already. I don’t think I’d need much ramp time.',
        source: 'transcript',
        lineNumber: 28,
        relevanceScore: 0.92,
        verifiability: 'VERIFIED',
        commentary: 'Fast velocity for immediate OKRs.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    concerns: validateQuotesList([
      {
        quoteText: 'Though Voltrix’s user base is still small, so I haven’t seen serious incident volume yet.',
        source: 'transcript',
        lineNumber: 31,
        relevanceScore: 0.85,
        verifiability: 'VERIFIED',
        commentary: 'Production ownership untested at scale.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-HM-ROHAN-99C3'
  },
  skeptic: {
    agentRole: 'skeptic',
    score: 3.5,
    confidence: 0.92,
    verdict: 'NO_HIRE',
    summaryHeadline: 'Direct contradiction between resume authorship claim and interview reality.',
    detailedAnalysis: 'Resume claimed "Sole architect of the retry/escalation logic" (Resume Line 12). Under cross-examination, Rohan conceded: "Fine — sole architect is probably too strong. I led the design, she built most of the production version" (Line 24). Also lacks metrics on reviewer override rate (Line 11).',
    strengths: [],
    concerns: validateQuotesList([
      {
        quoteText: 'Sole architect of the retry/escalation logic now running in production...',
        source: 'resume',
        lineNumber: 12,
        relevanceScore: 0.98,
        verifiability: 'DISPUTED',
        commentary: 'Contradicted by interview admission.'
      },
      {
        quoteText: 'Fine — “sole architect” is probably too strong. I led the design, she built most of the production version.',
        source: 'transcript',
        lineNumber: 24,
        relevanceScore: 1.0,
        verifiability: 'VERIFIED',
        commentary: 'Direct admission of resume exaggeration.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    redFlags: validateQuotesList([
      {
        quoteText: 'We track override rate. It’s low. I’d have to check the exact number though, haven’t looked recently.',
        source: 'transcript',
        lineNumber: 11,
        relevanceScore: 0.88,
        verifiability: 'UNVERIFIABLE',
        evidenceStatus: 'insufficient',
        commentary: 'Cannot substantiate core accuracy metrics of reviewer agent.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-SKEPTIC-ROHAN-99D4'
  }
};

const debateTurnsA: DebateTurn[] = [
  {
    id: 'turn-r1',
    roundNumber: 1,
    speaker: 'technical',
    targetAgent: 'skeptic',
    action: 'SUPPORT',
    statement: 'Rohan has direct experience building the planner-executor-reviewer pattern on top of FastAPI and LangGraph for freight dispatch. That cuts our ramp-up time to near zero.',
    citedQuotes: validateQuotesList([
      {
        quoteText: 'Designed and built the exception-handling engine end-to-end for Voltrix’s multi-agent freight ops platform (planner/executor/reviewer pattern)...',
        source: 'resume',
        lineNumber: 10,
        relevanceScore: 0.95,
        verifiability: 'VERIFIED',
        commentary: 'Architectural match for Cargonet AI.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    audioDurationSec: 15.0
  },
  {
    id: 'turn-r2',
    roundNumber: 1,
    speaker: 'skeptic',
    targetAgent: 'technical',
    action: 'CHALLENGE',
    statement: 'Evelyn, look at Transcript Line 24. Rohan claimed to be the "sole architect", but admitted Priya built most of the production version. More critically, look at Line 14: his model routing had "no formal study, just tuned as things broke." That is not engineering rigor—it is reckless trial-and-error in production.',
    citedQuotes: validateQuotesList([
      {
        quoteText: 'Fine — “sole architect” is probably too strong. I led the design, she built most of the production version.',
        source: 'transcript',
        lineNumber: 24,
        relevanceScore: 1.0,
        verifiability: 'VERIFIED',
        commentary: 'Credit misattribution.'
      },
      {
        quoteText: 'No formal study, just tuned it as things broke.',
        source: 'transcript',
        lineNumber: 14,
        relevanceScore: 0.95,
        verifiability: 'VERIFIED',
        commentary: 'Unmeasured model routing.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    stanceShift: {
      previousScore: 3.5,
      newScore: 3.0,
      reasonForShift: 'Hardened stance after highlighting lack of empirical routing evaluation.'
    },
    audioDurationSec: 17.5
  },
  {
    id: 'turn-r3',
    roundNumber: 2,
    speaker: 'hr',
    targetAgent: 'hiring_manager',
    action: 'SUPPORT',
    statement: 'Sarah, I share Victor\'s concern. On Line 18, when a teammate disagreed on categorizing failure types, Rohan pushed his approach without seeking consensus. And 3 jobs in 3.5 years (Line 34) suggests he will jump ship as soon as another startup offers a title bump.',
    citedQuotes: validateQuotesList([
      {
        quoteText: 'Teammate wanted to hardcode more categories up front. I pushed for the agent approach. We went with mine.',
        source: 'transcript',
        lineNumber: 18,
        relevanceScore: 0.90,
        verifiability: 'VERIFIED',
        commentary: 'Teamwork friction.'
      }
    ], RAW_DOCUMENTS.candidate_a.resumeRawText, RAW_DOCUMENTS.candidate_a.transcriptRawText),
    audioDurationSec: 14.0
  },
  {
    id: 'turn-r4',
    roundNumber: 2,
    speaker: 'technical',
    targetAgent: 'skeptic',
    action: 'CONCEDE',
    statement: 'I concede to Victor on the routing rigor point. Tuning routing heuristics ad-hoc without formal eval sets on freight invoices creates hidden failure modes. I am dropping my score from 8.4 to 7.2.',
    citedQuotes: [],
    stanceShift: {
      previousScore: 8.4,
      newScore: 7.2,
      reasonForShift: 'Acknowledged that unmeasured model routing creates operational fragility in production.'
    },
    audioDurationSec: 13.5
  }
];

// Candidate B Opinions & Turns
const isolatedOpinionsB: Record<AgentRole, AgentOpinion> = {
  technical: {
    agentRole: 'technical',
    score: 6.8,
    confidence: 0.88,
    verdict: 'LEAN_HIRE',
    summaryHeadline: 'Solid Python backend and RAG fundamentals, but lacks production multi-agent framework experience.',
    detailedAnalysis: 'Ananya has strong Python/FastAPI microservices skills (4 yrs) and clean RAG implementation with Chroma/LangChain. However, she has not shipped multi-agent systems (LangGraph/CrewAI) in production, representing a ramp-up gap.',
    strengths: validateQuotesList([
      {
        quoteText: 'Over the last 1.5 years, started building an internal RAG-based support-ticket assistant: set up a retrieval pipeline (LangChain + Chroma)...',
        source: 'resume',
        lineNumber: 12,
        relevanceScore: 0.92,
        verifiability: 'VERIFIED',
        commentary: 'Solid applied RAG implementation.'
      },
      {
        quoteText: 'We chunked documents by section rather than fixed length, since that kept related context together.',
        source: 'transcript',
        lineNumber: 5,
        relevanceScore: 0.94,
        verifiability: 'VERIFIED',
        commentary: 'Sound chunking strategy for retrieval quality.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    concerns: validateQuotesList([
      {
        quoteText: 'Has not used multi-agent orchestration frameworks (LangGraph, CrewAI, AutoGen) in production — most LLM work to date has been a single-agent RAG pipeline.',
        source: 'resume',
        lineNumber: 22,
        relevanceScore: 0.95,
        verifiability: 'VERIFIED',
        commentary: 'Direct framework gap relative to Cargonet AI requirements.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-TECH-ANANYA-88A1'
  },
  hr: {
    agentRole: 'hr',
    score: 9.6,
    confidence: 0.98,
    verdict: 'STRONG_HIRE',
    summaryHeadline: 'Exceptional intellectual honesty, accountability, and team process multiplier.',
    detailedAnalysis: 'Candidate exhibited rare integrity. Openly owned a production prompt outage in retro without blame-shifting (Line 21), and proactively created a pre-deploy checklist and eval set for the entire team (Line 21). 6-year tenure demonstrates loyalty.',
    strengths: validateQuotesList([
      {
        quoteText: 'First, I ran an incident retro with the team and was direct that it was my mistake in the writeup — I didn’t want to soften that.',
        source: 'transcript',
        lineNumber: 21,
        relevanceScore: 0.99,
        verifiability: 'VERIFIED',
        commentary: 'Exemplary ownership and psychological safety.'
      },
      {
        quoteText: 'Second, I proposed a pre-deploy checklist for prompt changes: a lightweight review step plus a small eval set to run before anything ships.',
        source: 'transcript',
        lineNumber: 21,
        relevanceScore: 0.98,
        verifiability: 'VERIFIED',
        commentary: 'Transforms failures into institutional safeguards.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    concerns: [],
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-HR-ANANYA-88B2'
  },
  hiring_manager: {
    agentRole: 'hiring_manager',
    score: 8.5,
    confidence: 0.90,
    verdict: 'HIRE',
    summaryHeadline: 'High production ownership and fast ramp-up curve make her a safer long-term investment.',
    detailedAnalysis: 'Ananya is a safer bet for production reliability (Line 31). Her self-awareness, willingness to ask for help early, and demonstrated track record of learning OCR then RAG prove she will ramp up on multi-agent systems quickly.',
    strengths: validateQuotesList([
      {
        quoteText: 'What I’d say is I’m a safer bet on the production-ownership side — I’ve been through a real incident and changed how the team works because of it...',
        source: 'transcript',
        lineNumber: 31,
        relevanceScore: 0.96,
        verifiability: 'VERIFIED',
        commentary: 'Direct match for "care as much about keeping things working over time".'
      },
      {
        quoteText: 'I’d start by reading through your existing planner/executor/reviewer code directly... pair with someone on a small bug fix first...',
        source: 'transcript',
        lineNumber: 14,
        relevanceScore: 0.93,
        verifiability: 'VERIFIED',
        commentary: 'Pragmatic, high-leverage onboarding strategy.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    concerns: [],
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-HM-ANANYA-88C3'
  },
  skeptic: {
    agentRole: 'skeptic',
    score: 9.0,
    confidence: 0.95,
    verdict: 'STRONG_HIRE',
    summaryHeadline: 'Zero bullshit detected. Candidate explicitly clarifies limits of metrics and experience.',
    detailedAnalysis: 'Unlike most candidates who inflate metrics, Ananya proactively clarified that her ~40% accuracy number was an informal spot-check rather than a rigorous benchmark (Line 8), and explicitly highlighted her multi-agent gap upfront (Line 11). Zero deception.',
    strengths: validateQuotesList([
      {
        quoteText: 'I want to be upfront about this — it was based on internal review, not a formal benchmark... I wouldn’t want to present that number as something rigorous...',
        source: 'transcript',
        lineNumber: 8,
        relevanceScore: 0.98,
        verifiability: 'VERIFIED',
        commentary: 'Rare intellectual honesty regarding resume metrics.'
      },
      {
        quoteText: 'That’s a real gap relative to what this role needs, and I’d rather say that clearly than talk around it.',
        source: 'transcript',
        lineNumber: 11,
        relevanceScore: 0.97,
        verifiability: 'VERIFIED',
        commentary: 'Direct transparency on multi-agent gap.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    concerns: [],
    executionTimestamp: '2026-08-28T04:00:00.100Z',
    isolationHash: 'ISO-SKEPTIC-ANANYA-88D4'
  }
};

const debateTurnsB: DebateTurn[] = [
  {
    id: 'turn-a1',
    roundNumber: 1,
    speaker: 'technical',
    targetAgent: 'hiring_manager',
    action: 'CHALLENGE',
    statement: 'Sarah, while Ananya is strong on Python fundamentals and single-agent RAG, the JD specifically asks for multi-agent systems. She explicitly admitted on Line 11 that she has not shipped LangGraph or CrewAI in production.',
    citedQuotes: validateQuotesList([
      {
        quoteText: 'That’s a real gap relative to what this role needs, and I’d rather say that clearly than talk around it.',
        source: 'transcript',
        lineNumber: 11,
        relevanceScore: 0.96,
        verifiability: 'VERIFIED',
        commentary: 'Framework gap acknowledgment.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    audioDurationSec: 16.0
  },
  {
    id: 'turn-a2',
    roundNumber: 1,
    speaker: 'hiring_manager',
    targetAgent: 'technical',
    action: 'SUPPORT',
    statement: 'Evelyn, look at her trajectory and ownership. On Line 31, she emphasizes that she is a safer bet for production reliability. On Line 14, her ramp-up strategy is to pair on small bug fixes and read code directly. She transitioned from backend to OCR, then to RAG—she can master LangGraph rapidly.',
    citedQuotes: validateQuotesList([
      {
        quoteText: 'What I’d say is I’m a safer bet on the production-ownership side — I’ve been through a real incident and changed how the team works because of it...',
        source: 'transcript',
        lineNumber: 31,
        relevanceScore: 0.95,
        verifiability: 'VERIFIED',
        commentary: 'Long-term ownership mindset.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    stanceShift: {
      previousScore: 8.5,
      newScore: 8.8,
      reasonForShift: 'Reinforced conviction that production incident discipline outweighs framework unfamiliarity.'
    },
    audioDurationSec: 18.0
  },
  {
    id: 'turn-a3',
    roundNumber: 2,
    speaker: 'skeptic',
    targetAgent: 'hr',
    action: 'SUPPORT',
    statement: 'Marcus, I verified her claims. On Line 8, she voluntarily admitted her 40% accuracy metric was an informal spot-check rather than claiming credit for a formal study. Zero deceptive inflation. That integrity is worth more than someone claiming sole credit for other people\'s code.',
    citedQuotes: validateQuotesList([
      {
        quoteText: 'I want to be upfront about this — it was based on internal review, not a formal benchmark...',
        source: 'transcript',
        lineNumber: 8,
        relevanceScore: 0.99,
        verifiability: 'VERIFIED',
        commentary: 'Authentic honesty.'
      }
    ], RAW_DOCUMENTS.candidate_b.resumeRawText, RAW_DOCUMENTS.candidate_b.transcriptRawText),
    audioDurationSec: 16.5
  },
  {
    id: 'turn-a4',
    roundNumber: 2,
    speaker: 'technical',
    targetAgent: 'hiring_manager',
    action: 'CONCEDE',
    statement: 'I agree with Sarah and Victor. Multi-agent framework syntax in LangGraph is easy to learn for an experienced Python engineer; genuine production accountability and ownership are rare. I am raising my score from 6.8 to 8.2.',
    citedQuotes: [],
    stanceShift: {
      previousScore: 6.8,
      newScore: 8.2,
      reasonForShift: 'Conceded that strong Python fundamentals and production ownership enable rapid multi-agent ramp-up.'
    },
    audioDurationSec: 14.0
  }
];

export const PRELOADED_SCENARIOS: Record<string, PreloadedScenario> = {
  candidate_a: {
    profile: profileCandidateA,
    isolatedOpinions: isolatedOpinionsA,
    debateTurns: debateTurnsA,
    finalDossier: computeNonAveragingDecision(
      profileCandidateA.id,
      profileCandidateA.name,
      isolatedOpinionsA,
      debateTurnsA
    )
  },
  candidate_b: {
    profile: profileCandidateB,
    isolatedOpinions: isolatedOpinionsB,
    debateTurns: debateTurnsB,
    finalDossier: computeNonAveragingDecision(
      profileCandidateB.id,
      profileCandidateB.name,
      isolatedOpinionsB,
      debateTurnsB
    )
  }
};
