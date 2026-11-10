import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import {
  BarChart3,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
  Clock,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';

export const Analytics: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<'7D' | '30D' | 'ALL'>('7D');

  const intentDistribution = [
    { name: 'REST', count: 185, color: '#64748B' },
    { name: 'LEFT', count: 142, color: '#2563EB' },
    { name: 'RIGHT', count: 128, color: '#0284C7' },
    { name: 'GRIP', count: 96, color: '#D97706' },
    { name: 'RELEASE', count: 88, color: '#16A34A' },
    { name: 'STOP', count: 24, color: '#DC2626' }
  ];

  const trendData = [
    { time: '14:00', confidence: 94.2, quality: 98.0 },
    { time: '14:15', confidence: 91.5, quality: 97.5 },
    { time: '14:30', confidence: 95.8, quality: 98.2 },
    { time: '14:45', confidence: 93.4, quality: 96.9 },
    { time: '15:00', confidence: 96.1, quality: 98.4 },
    { time: '15:15', confidence: 94.7, quality: 98.0 }
  ];

  const sessionSummary = [
    { id: 'SES-0941', date: '2026-10-01 15:15', duration: '12m 40s', intents: 142, avgConf: '95.4%', status: 'Nominal' },
    { id: 'SES-0940', date: '2026-10-01 14:30', duration: '08m 15s', intents: 98, avgConf: '93.8%', status: 'Nominal' },
    { id: 'SES-0939', date: '2026-10-01 13:55', duration: '15m 02s', intents: 184, avgConf: '94.1%', status: 'Nominal' },
    { id: 'SES-0938', date: '2026-09-30 18:20', duration: '05m 50s', intents: 61, avgConf: '91.2%', status: 'Nominal' },
    { id: 'SES-0937', date: '2026-09-30 16:45', duration: '11m 30s', intents: 138, avgConf: '94.8%', status: 'Nominal' }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Platform Analytics"
        subtitle="Longitudinal performance metrics, intent classification distributions, and signal fidelity trends"
        badge="Telemetry Analysis"
        actions={
          <div className="flex rounded-[6px] bg-[#FFFFFF] p-0.5 border border-[#E2E8F0] text-xs font-mono shadow-subtle">
            {(['7D', '30D', 'ALL'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                  filterPeriod === p
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#BFDBFE]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle">
          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wide">Total Commands</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">663</div>
          <div className="text-[11px] text-[#64748B] mt-1">Verified execution events</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle">
          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wide">Average Confidence</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#16A34A]">94.3%</div>
          <div className="text-[11px] text-[#64748B] mt-1">Gating threshold: ≥80%</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle">
          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wide">Mean Signal Quality</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#2563EB]">98.0%</div>
          <div className="text-[11px] text-[#64748B] mt-1">Noise floor: &lt;2.1 µV</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle">
          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wide">Latency P95</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">8.4 ms</div>
          <div className="text-[11px] text-[#64748B] mt-1">End-to-end BCI loop</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2563EB]" />
              Intent Classification Volume
            </span>
            <span className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0]">
              Filter: {filterPeriod}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0F172A',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {intentDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
            <span>Highest Occurrence: REST baseline (27.9%)</span>
            <span className="font-mono text-[#2563EB]">6 Distinct Classes</span>
          </div>
        </div>

        <div className="lg:col-span-6 p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2563EB]" />
              Fidelity &amp; Confidence Tracking
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-[#2563EB]">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Confidence
              </span>
              <span className="flex items-center gap-1 text-[#16A34A]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Signal
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[85, 100]} stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0F172A',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563EB' }}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#16A34A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
            <span>Correlation Coefficient: r = +0.78</span>
            <span className="font-mono text-[#16A34A]">Stable Envelope</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            Session Stability Ledger
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">Showing Recent 5 Sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase tracking-wide">
              <tr>
                <th className="py-2.5 px-4 font-semibold">SESSION ID</th>
                <th className="py-2.5 px-4 font-semibold">DATE / TIME</th>
                <th className="py-2.5 px-4 font-semibold">DURATION</th>
                <th className="py-2.5 px-4 font-semibold">INTENTS DETECTED</th>
                <th className="py-2.5 px-4 font-semibold">AVG CONFIDENCE</th>
                <th className="py-2.5 px-4 text-right font-semibold">SYSTEM HEALTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#475569]">
              {sessionSummary.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#0F172A]">{s.id}</td>
                  <td className="py-2.5 px-4 tabular-nums">{s.date}</td>
                  <td className="py-2.5 px-4 tabular-nums">{s.duration}</td>
                  <td className="py-2.5 px-4 tabular-nums text-[#0F172A] font-semibold">{s.intents}</td>
                  <td className="py-2.5 px-4 tabular-nums text-[#16A34A] font-semibold">{s.avgConf}</td>
                  <td className="py-2.5 px-4 text-right font-sans">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
