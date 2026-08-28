import React from 'react';
import { X, Briefcase, CheckCircle2, ShieldAlert, FileText, Award, Building } from 'lucide-react';
import { OFFICIAL_JOB_DESCRIPTION } from '../data/preloadedCandidates';

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const jd = OFFICIAL_JOB_DESCRIPTION;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#e2e8f8] w-full max-w-4xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f8] bg-[#f9f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1a146b] flex items-center justify-center text-white shadow-xs">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#e7eefe] text-[#1a146b] px-2 py-0.5 rounded border border-[#1a146b]/20 uppercase">
                  Official Problem Artifact • 02_Job_Description.pdf
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#151c27] tracking-tight mt-0.5">
                {jd.roleTitle}
              </h2>
              <div className="text-xs text-[#474651] flex items-center gap-2">
                <span className="flex items-center gap-1"><Building size={12} /> {jd.company}</span>
                <span>•</span>
                <span>{jd.experienceRequired}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#575e70] hover:text-[#151c27] hover:bg-[#e2e8f8]/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
          {/* Key Deliverables & Responsibilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsibilities */}
            <div className="p-4 rounded-lg bg-[#f9f9ff] border border-[#e2e8f8] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1a146b]">
                <FileText size={15} />
                <span>Core Architectural Responsibilities</span>
              </div>
              <ul className="space-y-2 text-xs text-[#474651]">
                {jd.coreResponsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#1a146b] font-bold shrink-0">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mandatory Competencies */}
            <div className="p-4 rounded-lg bg-[#f9f9ff] border border-[#e2e8f8] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Award size={15} />
                <span>Mandatory Technical Competencies</span>
              </div>
              <ul className="space-y-2 text-xs text-[#474651]">
                {jd.mandatorySkills.map((skill, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cultural Values & Dealbreaker Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cultural Tenets */}
            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 flex flex-col gap-2">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>Cultural Tenets & Team Multipliers</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-950">
                {jd.culturalValues.map((val, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{val}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Inviolable Dealbreakers */}
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex flex-col gap-2">
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <ShieldAlert size={15} />
                <span>Inviolable Veto Dealbreakers</span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-950">
                {jd.dealbreakers.map((db, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-rose-700">✕</span>
                    <span>{db}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Raw Text Ground Truth */}
          <div className="p-4 rounded-lg bg-[#f0f3ff] border border-[#e2e8f8]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#474651] font-bold mb-2">
              Raw Document Verbatim Record (02_Job_Description.pdf)
            </div>
            <pre className="font-mono text-[11px] text-[#151c27] whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-[#e2e8f8] max-h-48 overflow-y-auto">
              {jd.rawText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e8f8] bg-[#f9f9ff] flex items-center justify-between">
          <span className="text-xs text-[#474651]">
            Used by all 4 AI agents to evaluate candidate competency thresholds and cultural dealbreakers.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1a146b] hover:bg-[#312e81] text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Close Job Spec
          </button>
        </div>
      </div>
    </div>
  );
};
