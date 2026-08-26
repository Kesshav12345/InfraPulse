import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export default function GovHeader({ latestDate = 'July 2026' }) {
  return (
    <header className="flex flex-col w-full border-b border-slate-200">
      {/* Indian National Tricolor Ribbon */}
      <div className="flex h-1 w-full">
        <div className="bg-[#FF9933] w-1/3" />
        <div className="bg-[#FFFFFF] w-1/3" />
        <div className="bg-[#138808] w-1/3" />
      </div>

      {/* Top Utility Strip */}
      <div className="bg-[#002B50] text-white text-xs py-1.5 px-6 flex justify-between items-center tracking-wide">
        <div className="flex items-center space-x-3">
          <span className="font-semibold">Government of India</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-200">Ministry of Statistics & Programme Implementation</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live National Monitoring Panel
          </span>
          <span className="text-slate-300">|</span>
          <span>Data Updated: <strong>{latestDate}</strong></span>
        </div>
      </div>

      {/* Main Institutional Header Bar */}
      <div className="bg-white py-2.5 px-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Official Emblem */}
          <img
            src="/emblem.png"
            alt="State Emblem of India"
            className="h-14 w-auto object-contain shrink-0 drop-shadow-xs"
          />

          <div className="flex flex-col">
            <h2 className="text-base font-extrabold text-[#003B6F] tracking-tight leading-tight">
              MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION
            </h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Infrastructure & Project Monitoring Division (IPMD)
            </p>
          </div>
        </div>

        {/* System Identifier */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-blue-700" />
              PAIMANA Intelligence
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Decision-Support System for Infrastructure</p>
          </div>
        </div>
      </div>
    </header>
  );
}
