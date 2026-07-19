import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ComplaintModal({ isOpen, onClose, wardName, data }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-strong w-full max-w-lg overflow-hidden rounded-[--radius]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[--color-border]">
          <div>
            <span className="font-mono text-xs uppercase text-[--color-muted-foreground]">Ward Details</span>
            <h3 className="text-xl font-bold tracking-wide text-[--color-foreground] font-display">
              {wardName} Analytics
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[--color-secondary] text-[--color-secondary-foreground] hover:text-[--color-foreground] hover:bg-[--color-card] transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[--color-card] rounded-xl border border-[--color-border]">
              <span className="text-xs text-[--color-muted-foreground] block mb-1">Critical Breaches</span>
              <span className="text-lg font-bold text-[--color-danger] flex items-center gap-1.5 font-mono">
                <AlertTriangle size={14} /> {data?.escalated || 0} Issues
              </span>
            </div>
            <div className="p-3 bg-[--color-card] rounded-xl border border-[--color-border]">
              <span className="text-xs text-[--color-muted-foreground] block mb-1">Efficiency Score</span>
              <span className="text-lg font-bold text-[--color-success] flex items-center gap-1.5 font-mono">
                <CheckCircle2 size={14} /> {data?.responsiveness || 0}%
              </span>
            </div>
          </div>
          
          <p className="text-[--color-secondary-foreground] leading-relaxed font-body">
            This panel shows real-time dispatch and resolution diagnostics for {wardName}. 
            SLA parameters are currently active under the Nagar Seva compliance tracking guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}