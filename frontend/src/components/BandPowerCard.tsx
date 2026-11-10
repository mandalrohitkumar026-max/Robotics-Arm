import React from 'react';
import type { BandPower } from '../types/eeg';

interface BandPowerCardProps {
  name: 'Delta' | 'Theta' | 'Alpha' | 'Beta' | 'Gamma';
  data: BandPower;
}

const BAND_CONFIG = {
  Delta: { freq: '0.5–4 Hz', role: 'Slow wave baseline' },
  Theta: { freq: '4–8 Hz', role: 'Drowsiness & memory load' },
  Alpha: { freq: '8–13 Hz', role: 'Posterior relaxation & SMR' },
  Beta: { freq: '13–30 Hz', role: 'Sensorimotor cortical drive' },
  Gamma: { freq: '30–45 Hz', role: 'Cognitive feature integration' },
};

export const BandPowerCard: React.FC<BandPowerCardProps> = ({ name, data }) => {
  const config = BAND_CONFIG[name] || { freq: '', role: '' };

  return (
    <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between font-sans">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
          <h4 className="font-semibold text-xs font-mono text-[#0F172A]">{name}</h4>
        </div>
        <span className="text-[11px] font-mono text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
          {config.freq}
        </span>
      </div>

      <div className="my-2 flex items-baseline justify-between">
        <div>
          <span className="text-xl font-bold font-mono text-[#0F172A] tabular-nums">
            {data?.power?.toFixed(1) || '0.0'}
          </span>
          <span className="text-xs text-[#64748B] ml-1">µV²</span>
        </div>
        <span className="text-xs font-semibold font-mono text-[#2563EB] tabular-nums">
          {data?.percentage?.toFixed(1) || '0.0'}%
        </span>
      </div>

      <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden border border-[#E2E8F0]">
        <div
          className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(2, data?.percentage || 0))}%` }}
        />
      </div>

      <p className="text-[11px] text-[#64748B] mt-2 truncate">
        {config.role}
      </p>
    </div>
  );
};
