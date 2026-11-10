import React, { useState, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { useEEG } from '../context/EEGContext';
import { PageHeader } from '../components/PageHeader';
import {
  Cpu,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';

interface PredictionRecord {
  timestamp: string;
  intent: string;
  confidence: number;
  latency_ms: number;
  status: 'EXECUTED' | 'GATED_LOW_CONFIDENCE';
}

const COMMAND_DEFINITIONS = [
  { name: 'REST', desc: 'Neutral sensorimotor baseline (No robotic motion)' },
  { name: 'LEFT', desc: 'Right motor cortex ERD desynchronization (Rotate Base Left)' },
  { name: 'RIGHT', desc: 'Left motor cortex ERD desynchronization (Rotate Base Right)' },
  { name: 'FORWARD', desc: 'Frontocentral beta drive (Extend Manipulator Forward)' },
  { name: 'BACKWARD', desc: 'Parietocentral theta modulation (Retract Arm Backward)' },
  { name: 'GRIP', desc: 'Bilateral sensorimotor beta burst (Clamp End-Effector)' },
  { name: 'RELEASE', desc: 'Sensorimotor post-movement beta rebound (Open Gripper)' },
  { name: 'STOP', desc: 'Frontal cognitive abort trigger (Immediate Safety Halt)' }
];

export const IntentDetection: React.FC = () => {
  const { confidenceThreshold } = useDemo();
  const { latestPacket, triggerIntent } = useEEG();

  const currentIntent = latestPacket?.intent?.intent || 'REST';
  const confidence = latestPacket?.intent?.confidence || 94.6;
  const probabilities = latestPacket?.intent?.probabilities || {
    REST: 78.4,
    LEFT: 7.2,
    RIGHT: 5.1,
    FORWARD: 3.2,
    BACKWARD: 2.1,
    GRIP: 1.8,
    RELEASE: 1.2,
    STOP: 1.0
  };

  const isSafe = confidence >= confidenceThreshold;

  const c3Power = latestPacket?.filtered_signals?.C3
    ? Math.abs(latestPacket.filtered_signals.C3.reduce((a, b) => a + b, 0) / latestPacket.filtered_signals.C3.length)
    : 14.5;
  const c4Power = latestPacket?.filtered_signals?.C4
    ? Math.abs(latestPacket.filtered_signals.C4.reduce((a, b) => a + b, 0) / latestPacket.filtered_signals.C4.length)
    : 15.2;

  const smrAsymmetry = latestPacket?.spectral?.alpha_beta_ratio
    ? (currentIntent === 'LEFT' ? 0.68 : currentIntent === 'RIGHT' ? -0.72 : 0.05)
    : 0.04;

  const [history, setHistory] = useState<PredictionRecord[]>([
    { timestamp: '18:31:02', intent: 'REST', confidence: 95.2, latency_ms: 3.2, status: 'EXECUTED' },
    { timestamp: '18:31:07', intent: 'LEFT', confidence: 93.8, latency_ms: 3.4, status: 'EXECUTED' },
    { timestamp: '18:31:12', intent: 'RIGHT', confidence: 91.4, latency_ms: 2.9, status: 'EXECUTED' },
    { timestamp: '18:31:17', intent: 'GRIP', confidence: 94.1, latency_ms: 3.1, status: 'EXECUTED' },
    { timestamp: '18:31:22', intent: 'RELEASE', confidence: 92.6, latency_ms: 3.5, status: 'EXECUTED' }
  ]);

  useEffect(() => {
    if (latestPacket?.intent?.intent) {
      const nowStr = new Date().toTimeString().split(' ')[0];
      setHistory((prev) => {
        if (prev.length > 0 && prev[0].intent === currentIntent) return prev;
        const newRecord: PredictionRecord = {
          timestamp: nowStr,
          intent: currentIntent,
          confidence: confidence,
          latency_ms: 3.4,
          status: isSafe ? 'EXECUTED' : 'GATED_LOW_CONFIDENCE'
        };
        return [newRecord, ...prev.slice(0, 9)];
      });
    }
  }, [currentIntent, confidence, isSafe, latestPacket]);

  const probChartData = Object.entries(probabilities).map(([name, prob]) => ({
    name,
    prob: typeof prob === 'number' ? prob : 0
  }));

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="AI Intent Detection &amp; Inference"
        subtitle="Real-time multi-class motor imagery prediction, sensorimotor ERD tracking, and confidence gating"
        badge="Inference Active"
        actions={
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => triggerIntent('LEFT')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Simulate Left</span>
            </button>
            <button
              onClick={() => triggerIntent('RIGHT')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Simulate Right</span>
            </button>
            <button
              onClick={() => triggerIntent('GRIP')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Zap className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Simulate Grip</span>
            </button>
            <button
              onClick={() => triggerIntent('STOP')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Zap className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Simulate Stop</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-3">
              <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                ACTIVE INFERENCE STATE
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-medium">
                Random Forest (100 Trees)
              </span>
            </div>

            <div className="my-2 p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
                  CLASSIFIED INTENT
                </span>
                <div className="text-2xl font-bold font-mono text-[#0F172A] my-1">
                  {currentIntent}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-sans">
                  {isSafe ? (
                    <span className="text-[#16A34A] flex items-center gap-1 font-medium bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Validated (&ge; {confidenceThreshold}%)
                    </span>
                  ) : (
                    <span className="text-[#D97706] flex items-center gap-1 font-medium bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Gated (&lt; {confidenceThreshold}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
                  CONFIDENCE
                </span>
                <div className={`text-2xl font-bold font-mono tabular-nums my-1 ${isSafe ? 'text-[#2563EB]' : 'text-[#D97706]'}`}>
                  {confidence.toFixed(1)}%
                </div>
                <span className="text-[10px] font-mono text-[#64748B] tabular-nums">
                  Latency: 3.4 ms
                </span>
              </div>
            </div>

            <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0] mb-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isSafe ? 'bg-[#2563EB]' : 'bg-[#D97706]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
              />
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>Safety Gate Floor: <strong className="text-[#0F172A]">{confidenceThreshold}%</strong></span>
            <span className="text-[#16A34A] flex items-center gap-1 font-medium font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Continuous Inference
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-3">
              <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2563EB]" />
                SENSORIMOTOR RHYTHMS (SMR) C3 / C4 DESYNCHRONIZATION
              </span>
              <span className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0]">
                Contralateral Motor Cortex
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-1">
              <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span className="font-bold text-[#0F172A]">C3 (LEFT HEMISPHERE)</span>
                  <span className="text-[#16A34A] font-medium font-sans">Right Hand</span>
                </div>
                <div className="my-1.5 text-xl font-bold font-mono tabular-nums text-[#0F172A]">
                  {c3Power.toFixed(2)} <span className="text-xs font-normal text-[#64748B]">µV</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-sans">
                  {smrAsymmetry < -0.3 ? 'ERD Desynchronized (Active)' : 'Baseline SMR Rhythm'}
                </span>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span className="font-bold text-[#0F172A]">C4 (RIGHT HEMISPHERE)</span>
                  <span className="text-[#2563EB] font-medium font-sans">Left Hand</span>
                </div>
                <div className="my-1.5 text-xl font-bold font-mono tabular-nums text-[#0F172A]">
                  {c4Power.toFixed(2)} <span className="text-xs font-normal text-[#64748B]">µV</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-sans">
                  {smrAsymmetry > 0.3 ? 'ERD Desynchronized (Active)' : 'Baseline SMR Rhythm'}
                </span>
              </div>
            </div>

            <div className="space-y-1 mt-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                <span className="text-[#0284C7]">&larr; C3 Dominance (Right)</span>
                <span>Equilibrium</span>
                <span className="text-[#2563EB]">C4 Dominance (Left) &rarr;</span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full relative overflow-hidden border border-[#E2E8F0]">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#CBD5E1] z-10" />
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                  style={{
                    marginLeft: `${Math.max(0, Math.min(100, 50 + smrAsymmetry * 45))}%`,
                    width: '10px',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#E2E8F0] text-[11px] font-mono text-[#64748B] flex items-center justify-between">
            <span>Asymmetry Index: <strong className="text-[#0F172A] tabular-nums">{smrAsymmetry.toFixed(3)}</strong></span>
            <span className="text-[#2563EB] font-sans font-medium">Differential BCI Feature</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            8-CLASS INTENT PROBABILITY DISTRIBUTION (%)
          </span>
          <span className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0]">
            Softmax Calibrated
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={probChartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis stroke="#94A3B8" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#0F172A',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                }}
                formatter={(val: number) => [`${val.toFixed(1)}%`, 'Probability']}
              />
              <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                {probChartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === currentIntent ? '#2563EB' : '#E2E8F0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
          <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              LIVE INFERENCE HISTORY (LAST 10 PREDICTIONS)
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">Rolling buffer</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="bg-[#F8FAFC]/50 border-b border-[#E2E8F0] text-[#64748B] uppercase">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Time</th>
                  <th className="py-2.5 px-3 font-semibold">Class</th>
                  <th className="py-2.5 px-3 font-semibold">Confidence</th>
                  <th className="py-2.5 px-3 font-semibold">Latency</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 tabular-nums text-[#64748B]">{h.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-[#2563EB]">{h.intent}</td>
                    <td className="py-2.5 px-3 tabular-nums text-[#0F172A] font-semibold">{h.confidence.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 tabular-nums text-[#64748B]">{h.latency_ms.toFixed(1)} ms</td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                          h.status === 'EXECUTED'
                            ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                            : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                        }`}
                      >
                        {h.status === 'EXECUTED' ? 'PASSED' : 'GATED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2563EB]" />
              INTENT VOCABULARY &amp; KINEMATICS
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">8 Classes</span>
          </div>

          <div className="p-3 space-y-1.5 overflow-y-auto max-h-72">
            {COMMAND_DEFINITIONS.map((c) => {
              const isActive = currentIntent === c.name;
              return (
                <div
                  key={c.name}
                  className={`p-2 rounded-[6px] border text-xs font-mono transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                      : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#475569]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
                      }`}
                    />
                    <span className="font-bold text-[#0F172A]">{c.name}</span>
                  </div>
                  <span className="text-[11px] font-sans text-[#64748B] truncate max-w-[200px]" title={c.desc}>
                    {c.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
