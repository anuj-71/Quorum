import { describe, it, expect } from 'vitest';
import { buildCandidateProfile } from './profileBuilder';
import { RAW_DOCUMENTS } from '../data/preloadedCandidates';

describe('ProfileBuilder (Dynamic Ingestion Engine)', () => {
  it('extracts structured profile from raw Candidate A documents', async () => {
    const rawA = RAW_DOCUMENTS.candidate_a;
    const profile = await buildCandidateProfile(
      rawA.resumeRawText,
      rawA.transcriptRawText,
      'Rohan Malhotra',
      'AI Engineer — Agentic Systems'
    );

    expect(profile).toBeDefined();
    expect(profile.name).toBe('Rohan Malhotra');
    expect(profile.skills.length).toBeGreaterThan(0);
    expect(profile.claims.length).toBeGreaterThan(0);
    expect(profile.missingInfoAudit).toBeDefined();
  });

  it('handles arbitrary custom raw resume and transcript text', async () => {
    const resume = 'Jane Doe\nSenior Machine Learning Engineer at CloudScale\n5 years of experience in distributed PyTorch training.';
    const transcript = 'Interviewer: How do you optimize latency?\nJane: We use model quantization and vLLM continuous batching.';

    const profile = await buildCandidateProfile(resume, transcript, 'Jane Doe');
    expect(profile.name).toBe('Jane Doe');
    expect(profile.resumeRawText).toBe(resume);
    expect(profile.transcriptRawText).toBe(transcript);
  });
});
