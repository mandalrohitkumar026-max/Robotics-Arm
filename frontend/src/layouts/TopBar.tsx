import React from 'react';
import { useDemo } from '../context/DemoContext';
import { useEEG } from '../context/EEGContext';
import { User, Activity, Cpu } from 'lucide-react';

interface TopBarProps {
  pageTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ pageTitle }) => {
  const { state, triggerEStop, resetEStop } = useDemo();
  const { connectionStatus } = useEEG();

  return (
    <header className="h-12 bg-[#FFFFFF] border-b border-[#E2E8F0] px-5 flex items-center justify-between sticky top-0 z-30 select-none font-sans">
      {/* Left: Clean Page Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-[14px] font-semibold text-[#0F172A] tracking-tight">
          {pageTitle}
        </h2>
      </div>

      {/* Center: Session Indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#64748B]">
        <span>Session:</span>
        <span className="font-semibold text-[#0F172A] px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]">
          NR-2026-004
        </span>
      </div>

      {/* Right: Restrained Telemetry & Status */}
      <div className="flex items-center gap-3 text-[12px] font-mono">
        {/* EEG Status */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#475569]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span>EEG: Connected</span>
        </div>

        {/* Model Status */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#475569] px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
          <Cpu className="w-3 h-3 text-[#2563EB]" />
          <span>RF v1.0</span>
        </div>

        {/* E-Stop Button */}
        {state.eStopLatched ? (
          <button
            onClick={resetEStop}
            className="px-2.5 py-1 rounded-[6px] bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Reset Stop
          </button>
        ) : (
          <button
            onClick={triggerEStop}
            className="px-2.5 py-1 rounded-[6px] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Emergency Stop
          </button>
        )}

        {/* Minimal User Avatar */}
        <div className="w-7 h-7 rounded-[6px] bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#475569] hover:text-[#0F172A] cursor-pointer ml-1">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    </header>
  );
};
