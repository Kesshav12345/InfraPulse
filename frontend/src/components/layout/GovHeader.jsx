import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function GovHeader({ latestDate = 'July 2026' }) {
  const { user, logout } = useAuth();
  return (
    <header className="flex flex-col w-full border-b border-[#C8DAEB]">
      {/* Indian National Tricolor Ribbon */}
      <div className="flex h-1 w-full">
        <div className="bg-[#FF9933] w-1/3" />
        <div className="bg-[#FFFFFF] w-1/3" />
        <div className="bg-[#138808] w-1/3" />
      </div>

      {/* Slim Polished Top Identity Band */}
      <div className="bg-gradient-to-r from-[#102A72] via-[#0E2970] to-[#13A8E0] h-1.5 w-full" />

      {/* Main Institutional Header Bar */}
      <div className="bg-white py-2.5 px-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Official Emblem */}
          <img
            src="/emblem.png"
            alt="State Emblem of India"
            className="h-14 w-auto object-contain shrink-0 drop-shadow-xs"
          />

          <div className="flex flex-col">
            <h2 className="text-base font-extrabold text-[#10213D] tracking-tight leading-tight">
              MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION
            </h2>
            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mt-0.5">
              Infrastructure & Project Monitoring Division (IPMD)
            </p>
          </div>

          <img
            src="/data-for-dev.png"
            alt="Data for Development"
            className="h-11 w-auto object-contain shrink-0 border-l border-slate-200 pl-4 ml-2"
          />
        </div>

        {/* System Identifier & Auth */}
        <div className="flex items-center space-x-6">
          <img
            src="/logo-paimana.png"
            alt="PAIMANA Intelligence"
            className="h-12 w-auto object-contain shrink-0"
          />
          
          {user ? (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#10213D]">{user.username}</p>
                <p className="text-[10px] uppercase font-bold text-[#475569]">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="text-xs px-3 py-1.5 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-l border-slate-200 pl-6">
              <a
                href="/login"
                className="text-xs px-4 py-1.5 bg-[#102A72] hover:bg-[#0E235C] text-white font-semibold rounded-md shadow-xs transition-colors inline-block border-b-2 border-b-[#13A8E0]"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
