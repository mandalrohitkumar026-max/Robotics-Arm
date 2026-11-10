import React from 'react';
import type { BrainwaveBand } from '../types/demo';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BrainwaveCardProps {
  band: BrainwaveBand;
}

export const BrainwaveCard: React.FC<BrainwaveCardProps> = ({ band }) => {
  return (
    <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between font-sans">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <h4 className="font-semibold text-xs font-mono text-[#0F172A]">{band.name}</h4>
          </div>
          <span className="text-[11px] font-mono text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
            {band.range}
          </span>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="text-xl font-bold font-mono text-[#0F172A] tabular-nums">
            {band.value.toFixed(1)} <span className="text-[11px] font-normal text-[#64748B]">µV²</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-[#2563EB]">
            <span className="tabular-nums font-semibold">{band.percentage.toFixed(1)}%</span>
            {band.trend === 'up' && <TrendingUp className="w-3 h-3 text-[#16A34A]" />}
            {band.trend === 'down' && <TrendingDown className="w-3 h-3 text-[#DC2626]" />}
            {band.trend === 'stable' && <Minus className="w-3 h-3 text-[#94A3B8]" />}
          </div>
        </div>

        <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden border border-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(4, band.percentage))}%` }}
          />
        </div>
      </div>

      <div className="mt-2.5 pt-1.5 border-t border-[#E2E8F0] text-[10px] font-mono text-[#64748B] truncate">
        Calibrated spectrum window
      </div>
    </div>
  );
};
