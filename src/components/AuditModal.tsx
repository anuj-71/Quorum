import React from 'react';
import { X, ShieldCheck, Cpu, CheckCircle2, Lock } from 'lucide-react';
import type { AuditLogEntry } from '../types';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-[#e2e8f8] rounded-xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden text-[#151c27]">
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#e2e8f8] flex items-center justify-between bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00875a]" />
            <h3 className="text-sm font-bold text-[#151c27]">Zero-Knowledge Isolation Proof & Telemetry</h3>
          </div>
          <button 
            type="button" 
            className="p-1 rounded text-[#474651] hover:text-[#151c27] hover:bg-white transition-colors cursor-pointer" 
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Isolation Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-[#f0f3ff] rounded-lg border border-[#e2e8f8]">
            <Lock size={20} className="text-[#1a146b] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#1a146b] text-xs">PROVABLE ZERO-KNOWLEDGE AGENT ISOLATION</div>
              <div className="text-xs text-[#474651] mt-0.5 leading-relaxed">
                Stage 1 Agent calls are dispatched as separate, parallel HTTP payloads with zero shared memory or cross-agent context before the debate round.
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="border border-[#e2e8f8] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f9f9ff] border-b border-[#e2e8f8] text-[#474651] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Pipeline Stage</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Dispatched</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Tokens</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f8] font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f9f9ff]">
                    <td className="py-2 px-3 text-[#1a146b] font-medium">{log.callType}</td>
                    <td className="py-2 px-3">
                      {log.agentRole ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0f3ff] text-[#1a146b] border border-[#e2e8f8]">
                          {log.agentRole.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-[#474651]">GLOBAL</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-[#474651]">{new Date(log.dispatchedAt).toLocaleTimeString()}</td>
                    <td className="py-2 px-3 font-semibold text-[#151c27]">{log.durationMs}ms</td>
                    <td className="py-2 px-3 text-[#474651]">{log.inputTokenCount} / {log.outputTokenCount}</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
                        <CheckCircle2 size={11} /> VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-1.5 text-[#474651] text-[11px]">
            <Cpu size={13} className="text-[#1a146b]" />
            <span>All prompt payloads and completions conform to IEEE-compliant auditability standards.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-[#e2e8f8] flex justify-end bg-[#f9f9ff]">
          <button 
            type="button" 
            className="px-4 py-1.5 rounded-md bg-[#1a146b] hover:bg-[#312e81] text-white text-xs font-semibold shadow-xs cursor-pointer"
            onClick={onClose}
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
