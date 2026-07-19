import React from 'react';
import { Camera, MapPin } from 'lucide-react';

export default function ReportIssue() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4 text-white">
      {/* Page Header Titles */}
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
          File Complaint
        </span>
        <h2 className="font-display text-5xl font-black tracking-wider text-white mt-1 uppercase">
          REPORT ISSUE
        </h2>
      </div>

      {/* 3-Step Progress Timeline Wrapper */}
      <div className="flex items-center justify-center max-w-md mx-auto relative py-4">
        <div className="absolute left-0 right-0 h-[1px] bg-slate-800 z-0" />
        <div className="flex justify-between w-full z-10">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                step === 2
                  ? 'bg-amber-500 text-black ring-4 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : step === 1
                  ? 'bg-amber-500/80 text-black'
                  : 'bg-slate-900 border border-slate-700 text-slate-400'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Box Container */}
      <div className="space-y-6 max-w-2xl mx-auto">
        <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2">
          Evidence & Location
        </h3>

        {/* Drag & Drop Photo Upload Box */}
        <div className="border border-dashed border-slate-800 bg-[#0b1329]/20 hover:bg-[#0b1329]/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group min-h-[180px]">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 group-hover:text-amber-500 transition-colors">
            <Camera size={20} />
          </div>
          <span className="text-sm font-medium text-slate-300 mt-1">
            Tap to attach photo evidence
          </span>
          <span className="text-xs font-mono text-slate-500">
            Supports JPG, PNG, HEIC
          </span>
        </div>

        {/* GPS Coordinates Geolocation Trigger Input */}
        <div className="relative flex items-center bg-[#0b1329]/40 border border-slate-800/80 rounded-xl px-4 py-3.5 focus-within:border-amber-500/50 transition-all">
          <MapPin size={16} className="text-slate-500 mr-3" />
          <input
            type="text"
            readOnly
            placeholder="Capture GPS location"
            className="bg-transparent w-full text-sm outline-none placeholder-slate-500 cursor-pointer"
          />
        </div>

        {/* Narrative Description Textarea */}
        <div className="bg-[#0b1329]/40 border border-slate-800/80 rounded-xl px-4 py-3.5 focus-within:border-amber-500/50 transition-all">
          <textarea
            rows={5}
            placeholder="Describe the issue — include duration, impact on residents, any incidents..."
            className="bg-transparent w-full text-sm outline-none placeholder-slate-500 resize-none font-body leading-relaxed text-slate-200"
          />
        </div>

        {/* Action Action Navigation Buttons Row */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button className="w-full bg-[#0b1329]/40 border border-slate-800 text-slate-300 font-mono text-xs uppercase py-3.5 rounded-xl hover:bg-slate-900 transition-all cursor-pointer tracking-wider font-bold">
            Back
          </button>
          <button className="w-full bg-amber-500 text-black font-mono text-xs uppercase py-3.5 rounded-xl hover:bg-amber-600 transition-all cursor-pointer tracking-wider font-bold shadow-[0_4px_20px_rgba(245,158,11,0.25)]">
            Review
          </button>
        </div>
      </div>
    </div>
  );
}