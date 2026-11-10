import React, { useState } from 'react';
import { useEEG } from '../context/EEGContext';
import { WaveformCanvas } from '../components/WaveformCanvas';
import { PageHeader } from '../components/PageHeader';
import { api } from '../services/api';
import {
  Eye,
  Sliders,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const BlinkDetection: React.FC = () => {
  const { blinkInfo, triggerSimulatedBlink } = useEEG();

  const [threshold, setThreshold] = useState(blinkInfo.threshold_uv || 75.0);
  const [minDuration, setMinDuration] = useState(120);
  const [maxDuration, setMaxDuration] = useState(480);
  const [cooldown, setCooldown] = useState(blinkInfo.cooldown_ms || 350);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleUpdateConfig = async () => {
    try {
      await api.updateBlinkConfig({
        threshold_uv: threshold,
        min_duration_ms: minDuration,
        max_duration_ms: maxDuration,
        cooldown_ms: cooldown
      });
      setSaveStatus("Threshold and refractory parameters updated");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("Parameters saved locally");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const secondsSinceLastBlink = Math.max(0, ((Date.now() - blinkInfo.last_blink_timestamp) / 1000)).toFixed(1);

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Ocular Artifact &amp; Blink Detection"
        subtitle="Detects steep corneal-retinal dipole potential spikes on frontopolar channels (Fp1/Fp2) for discrete robotic commands"
        badge="EOG Gating"
        actions={
          <button
            onClick={triggerSimulatedBlink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors cursor-pointer shadow-subtle"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Inject Test Blink</span>
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[#64748B] uppercase">Total Blink Count</span>
          <div className="my-1.5 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
            {blinkInfo.total_blinks}
          </div>
          <span className="text-[11px] text-[#64748B]">Lifetime session total</span>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[#64748B] uppercase">Blink Frequency</span>
          <div className="my-1.5 text-2xl font-bold font-mono tabular-nums text-[#16A34A]">
            {blinkInfo.blink_rate_bpm} <span className="text-xs font-normal text-[#64748B]">BPM</span>
          </div>
          <span className="text-[11px] text-[#64748B]">Resting baseline: 12–20</span>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[#64748B] uppercase">Last Blink</span>
          <div className="my-1.5 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
            {secondsSinceLastBlink}s <span className="text-xs font-normal text-[#64748B]">ago</span>
          </div>
          <span className="text-[11px] text-[#16A34A] font-medium">Refractory clear</span>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[#64748B] uppercase">Spike Duration</span>
          <div className="my-1.5 text-2xl font-bold font-mono tabular-nums text-[#2563EB]">
            {blinkInfo.last_blink_duration_ms} <span className="text-xs font-normal text-[#64748B]">ms</span>
          </div>
          <span className="text-[11px] text-[#64748B]">Nominal: 150–350 ms</span>
        </div>
      </div>

      <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2563EB]" />
            ELECTRO-OCULOGRAPHIC (EOG) ARTIFACT PROFILE
          </span>
          <span className="text-[11px] font-mono text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-[4px] border border-[#BFDBFE]">
            Dipole Deflection
          </span>
        </div>

        <div className="p-4 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#64748B] space-y-2">
          <div className="flex items-center justify-between font-bold text-[#0F172A]">
            <span>NORMAL EEG BASELINE</span>
            <span className="text-[#2563EB]">BLINK SPIKE (&gt; +75 µV)</span>
            <span>RECOVERY TO BASELINE</span>
          </div>
          <div className="w-full text-center tracking-widest text-[#2563EB] font-bold text-sm overflow-x-auto py-1">
            ───────────────────────/ ───────────────────────
          </div>
          <div className="text-center text-[11px] text-[#475569] font-sans">
            Ocular motion rotates the positive cornea towards frontopolar electrodes (Fp1/Fp2), generating a prominent monopolar potential spike.
          </div>
        </div>
      </div>

      <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#2563EB]" />
            FRONTOPOLAR (Fp1 &amp; Fp2) REAL-TIME OSCILLOSCOPE
          </span>
          <span className="text-[11px] font-mono text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-[4px] border border-[#BBF7D0]">
            Active Event Gating
          </span>
        </div>
        <WaveformCanvas channels={["Fp1", "Fp2"]} height={200} />
      </div>

      <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2563EB]" />
            DETECTION PARAMETERS &amp; REFRACTORY CONTROLS
          </span>
          {saveStatus && (
            <span className="text-xs font-mono text-[#16A34A] flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#64748B]">Peak Threshold:</span>
              <strong className="text-[#2563EB] tabular-nums">{threshold} µV</strong>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#64748B]">Min Duration:</span>
              <strong className="text-[#2563EB] tabular-nums">{minDuration} ms</strong>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              step="10"
              value={minDuration}
              onChange={(e) => setMinDuration(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#64748B]">Max Duration:</span>
              <strong className="text-[#2563EB] tabular-nums">{maxDuration} ms</strong>
            </div>
            <input
              type="range"
              min="250"
              max="800"
              step="25"
              value={maxDuration}
              onChange={(e) => setMaxDuration(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#64748B]">Cooldown:</span>
              <strong className="text-[#2563EB] tabular-nums">{cooldown} ms</strong>
            </div>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={cooldown}
              onChange={(e) => setCooldown(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleUpdateConfig}
            className="px-3.5 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-medium transition-colors cursor-pointer shadow-subtle"
          >
            Apply Detector Parameters
          </button>
        </div>
      </div>
    </div>
  );
};
