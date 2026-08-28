import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CandidateProfile } from '../types';
import { buildCandidateProfile } from '../engine/profileBuilder';
import { RAW_DOCUMENTS } from '../data/preloadedCandidates';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadCandidate: (candidate: CandidateProfile) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadCandidate
}) => {
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('AI Engineer — Agentic Systems (Freight Operations)');
  const [experienceYears, setExperienceYears] = useState(3.5);
  const [education, setEducation] = useState('B.Tech Computer Science');
  const [currentCompany, setCurrentCompany] = useState('Logistics Tech');
  const [resumeText, setResumeText] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const handlePreFillCandidateA = () => {
    setName('Rohan Malhotra');
    setTargetRole('AI Engineer — Agentic Systems (Freight Operations)');
    setExperienceYears(3.5);
    setEducation('B.Tech Computer Science, 2022');
    setCurrentCompany('Voltrix Logistics Tech');
    setResumeText(RAW_DOCUMENTS.candidate_a.resumeRawText);
    setTranscriptText(RAW_DOCUMENTS.candidate_a.transcriptRawText);
  };

  const handlePreFillCandidateB = () => {
    setName('Ananya Iyer');
    setTargetRole('AI Engineer — Agentic Systems (Freight Operations)');
    setExperienceYears(6);
    setEducation('B.E. Information Technology, 2019');
    setCurrentCompany('Bridgepoint Systems');
    setResumeText(RAW_DOCUMENTS.candidate_b.resumeRawText);
    setTranscriptText(RAW_DOCUMENTS.candidate_b.transcriptRawText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !resumeText.trim() || !transcriptText.trim()) return;

    setIsParsing(true);
    try {
      const dynamicProfile = await buildCandidateProfile(
        resumeText.trim(),
        transcriptText.trim(),
        name.trim(),
        targetRole.trim()
      );

      dynamicProfile.experienceYears = Number(experienceYears) || dynamicProfile.experienceYears;
      dynamicProfile.education = education.trim() || dynamicProfile.education;
      dynamicProfile.currentCompany = currentCompany.trim() || dynamicProfile.currentCompany;

      onUploadCandidate(dynamicProfile);
      onClose();
    } catch (err) {
      console.error('Failed to parse candidate profile', err);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-[#e2e8f8] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#151c27]">
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#e2e8f8] flex items-center justify-between bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-[#1a146b]" />
            <h3 className="text-sm font-bold text-[#151c27]">Dynamic Candidate Profile Ingestion</h3>
          </div>
          <button 
            type="button" 
            className="p-1 rounded text-[#474651] hover:text-[#151c27] hover:bg-white transition-colors cursor-pointer" 
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1 custom-scrollbar">
          {/* Quick Pre-fill Actions for Official Benchmark PDFs */}
          <div className="p-3 bg-[#f0f3ff] rounded-lg border border-[#e2e8f8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[#1a146b]" />
              <span className="font-semibold text-xs text-[#1a146b]">Load Official Problem PDFs:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreFillCandidateA}
                className="px-2.5 py-1 bg-white border border-[#e2e8f8] hover:border-[#1a146b] rounded text-[11px] font-semibold text-[#151c27] transition-all cursor-pointer"
              >
                03/05: Rohan Malhotra (A)
              </button>
              <button
                type="button"
                onClick={handlePreFillCandidateB}
                className="px-2.5 py-1 bg-white border border-[#e2e8f8] hover:border-[#1a146b] rounded text-[11px] font-semibold text-[#151c27] transition-all cursor-pointer"
              >
                04/06: Ananya Iyer (B)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#151c27] mb-1">Candidate Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Malhotra"
                required
                className="w-full p-2 bg-white border border-[#e2e8f8] rounded-md font-sans text-xs text-[#151c27] focus:outline-none focus:border-[#1a146b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#151c27] mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="AI Engineer — Agentic Systems"
                required
                className="w-full p-2 bg-white border border-[#e2e8f8] rounded-md font-sans text-xs text-[#151c27] focus:outline-none focus:border-[#1a146b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#151c27] mb-1">Years of Exp.</label>
              <input
                type="number"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full p-2 bg-white border border-[#e2e8f8] rounded-md font-sans text-xs text-[#151c27] focus:outline-none focus:border-[#1a146b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#151c27] mb-1">Education</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full p-2 bg-white border border-[#e2e8f8] rounded-md font-sans text-xs text-[#151c27] focus:outline-none focus:border-[#1a146b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#151c27] mb-1">Current Company</label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                className="w-full p-2 bg-white border border-[#e2e8f8] rounded-md font-sans text-xs text-[#151c27] focus:outline-none focus:border-[#1a146b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#151c27] mb-1">
              Raw Resume Text (Ground Truth)
            </label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste raw extracted resume text (with work experience, bullet points, skills)..."
              required
              className="w-full p-2.5 bg-white border border-[#e2e8f8] rounded-md font-mono text-[11px] text-[#151c27] leading-relaxed focus:outline-none focus:border-[#1a146b]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#151c27] mb-1">
              Interview Transcript Text (Questions & Answers)
            </label>
            <textarea
              rows={6}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste interview transcript lines (Interviewer / Candidate Q&A)..."
              required
              className="w-full p-2.5 bg-white border border-[#e2e8f8] rounded-md font-mono text-[11px] text-[#151c27] leading-relaxed focus:outline-none focus:border-[#1a146b]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#e2e8f8] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#474651]">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Profile Builder will extract skills, claims & missing info dynamically.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md border border-[#e2e8f8] text-[#474651] hover:text-[#151c27] font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isParsing}
                className="px-4 py-1.5 bg-[#1a146b] hover:bg-[#312e81] text-white rounded-md font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FileText size={13} />
                <span>{isParsing ? 'Building Profile...' : 'Extract & Evaluate'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
