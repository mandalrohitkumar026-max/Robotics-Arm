import React from 'react';
import { useEEG } from '../context/EEGContext';
import { PageHeader } from '../components/PageHeader';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const BANDS_DATA = [
  { name: 'DELTA', range: '0.5–4 Hz', defaultPct: 15.6, defaultPower: 12.4 },
  { name: 'THETA', range: '4–8 Hz', defaultPct: 17.2, defaultPower: 6.8 },
  { name: 'ALPHA', range: '8–13 Hz', defaultPct: 32.6, defaultPower: 14.2 },
  { name: 'BETA', range: '13–30 Hz', defaultPct: 28.5, defaultPower: 7.5 },
  { name: 'GAMMA', range: '>30 Hz', defaultPct: 6.1, defaultPower: 2.7 },
];

export const BrainSignals: React.FC = () => {
  const { bands, spectral } = useEEG();

  const psdChartData = (spectral.frequencies || [1, 2, 4, 8, 10, 12, 16, 20, 25, 30, 40]).map((freq, idx) => ({
    frequency: freq,
    psd: spectral.psd?.[idx] || 0.1,
  }));

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Brain Signals Analysis"
        subtitle="Spectral power decomposition and electrophysiological statistical metrics"
        badge="250 Hz Stream"
      />

      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 space-y-3 shadow-subtle">
        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-xs font-semibold text-[#0F172A]">
              Frequency Spectrum (Welch PSD)
            </h3>
            <span className="text-[11px] text-[#64748B]">
              Power Spectral Density (0–45 Hz) &bull; Window: 256 samples
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#64748B]">
            <span>Peak: <strong className="text-[#2563EB] font-bold">{spectral.dominant_freq?.toFixed(1) || 10.2} Hz</strong></span>
            <span>Total Power: <strong className="text-[#0F172A] font-bold">{spectral.total_power?.toFixed(1) || 43.6} µV²</strong></span>
            <span>Entropy: <strong className="text-[#0F172A] font-bold">{spectral.spectral_entropy?.toFixed(3) || 0.842}</strong></span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={psdChartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="psdScientificGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="frequency"
                stroke="#94A3B8"
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <YAxis
                stroke="#94A3B8"
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                }}
                formatter={(val: number) => [`${val.toFixed(3)} µV²/Hz`, 'Power Density']}
                labelFormatter={(lbl) => `${lbl} Hz`}
              />
              <Area
                type="monotone"
                dataKey="psd"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#psdScientificGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 text-xs font-mono shadow-subtle">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">
              BAND POWER DISTRIBUTION
            </span>
            <span className="text-[11px] text-[#64748B]">Relative %</span>
          </div>

          <div className="space-y-3">
            {BANDS_DATA.map((b) => {
              const liveData = bands[b.name.charAt(0) + b.name.slice(1).toLowerCase()] || {
                percentage: b.defaultPct,
                power: b.defaultPower
              };
              const pct = liveData.percentage;
              return (
                <div key={b.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] w-16">{b.name}</span>
                      <span className="text-[#64748B] text-[11px]">{b.range}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#64748B] tabular-nums">{liveData.power.toFixed(1)} µV²</span>
                      <span className="text-[#2563EB] font-bold tabular-nums w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 text-xs font-mono shadow-subtle">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">
              ELECTROPHYSIOLOGICAL STATISTICS
            </span>
            <span className="text-[11px] text-[#64748B]">Window: 2000 ms</span>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-2.5 text-[#475569]">Baseline Mean</td>
                <td className="py-2.5 text-right font-bold text-[#0F172A] tabular-nums">+0.42 µV</td>
                <td className="py-2.5 text-right text-[11px] text-[#64748B]">Nominal Zero</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-2.5 text-[#475569]">Root Mean Square (RMS)</td>
                <td className="py-2.5 text-right font-bold text-[#0F172A] tabular-nums">4.28 µV</td>
                <td className="py-2.5 text-right text-[11px] text-[#64748B]">Effective Power</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-2.5 text-[#475569]">Variance</td>
                <td className="py-2.5 text-right font-bold text-[#0F172A] tabular-nums">18.32 µV²</td>
                <td className="py-2.5 text-right text-[11px] text-[#64748B]">Hjorth Activity</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-2.5 text-[#475569]">Peak-to-Peak Amplitude</td>
                <td className="py-2.5 text-right font-bold text-[#0F172A] tabular-nums">34.80 µV</td>
                <td className="py-2.5 text-right text-[11px] text-[#64748B]">Artifact Guardrail</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-2.5 text-[#475569]">Theta / Beta Ratio (TBR)</td>
                <td className="py-2.5 text-right font-bold text-[#2563EB] tabular-nums">
                  {spectral.theta_beta_ratio?.toFixed(2) || '1.15'}
                </td>
                <td className="py-2.5 text-right text-[11px] text-[#64748B]">Vigilance Index</td>
              </tr>
              <tr className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-2.5 text-[#475569]">Alpha / Beta Ratio</td>
                <td className="py-2.5 text-right font-bold text-[#0F172A] tabular-nums">
                  {spectral.alpha_beta_ratio?.toFixed(2) || '1.89'}
                </td>
                <td className="py-2.5 text-right text-[11px] text-[#64748B]">SMR Baseline</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
