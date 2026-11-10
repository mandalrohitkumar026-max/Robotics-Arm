import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface FrequencySpectrumProps {
  frequencies?: number[];
  psd?: number[];
  dominantFreq?: number;
  height?: number;
}

export const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  frequencies = [1, 2, 4, 6, 8, 10, 12, 14, 18, 22, 28, 32, 40, 45],
  psd = [0.4, 0.9, 0.6, 0.7, 1.2, 2.1, 1.4, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.05],
  dominantFreq = 10.2,
  height = 200
}) => {
  const chartData = frequencies.map((freq, i) => ({
    freq: `${freq} Hz`,
    power: psd[i] || 0
  }));

  return (
    <div className="w-full rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 shadow-subtle font-sans">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
        <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
          Power Spectral Density (Welch PSD)
        </span>
        <span className="text-xs font-mono text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE] font-medium">
          Peak: {dominantFreq} Hz
        </span>
      </div>

      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="spectrumLightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="freq" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: '"JetBrains Mono", monospace',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
              }}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#spectrumLightGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] mt-2 pt-2 border-t border-[#E2E8F0]">
        <span>Delta (0.5–4Hz)</span>
        <span>Theta (4–8Hz)</span>
        <span className="text-[#2563EB] font-bold">Alpha (8–13Hz)</span>
        <span>Beta (13–30Hz)</span>
        <span>Gamma (30–45Hz)</span>
      </div>
    </div>
  );
};
