import React from 'react';
import { useDemo } from '../context/DemoContext';
import { useEEG } from '../context/EEGContext';
import { SignalChart } from '../components/SignalChart';
import { RobotPreview } from '../components/RobotPreview';
import { Play, Pause, RotateCcw, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, startDemo, pauseDemo, resetDemo, showHardwareNotice } = useDemo();
  const { bands, latestPacket } = useEEG();

  const currentIntent = latestPacket?.intent?.intent || state.currentIntent || 'REST';
  const confidence = latestPacket?.intent?.confidence || state.confidence || 94.6;

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
              NeuroArm Control Center
            </h1>
            <span className="text-[11px] font-mono text-[#2563EB] px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] border border-[#BFDBFE] font-medium">
              Demo Mode Active
            </span>
          </div>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Medical-grade EEG acquisition and 5-DOF robotic manipulator workstation
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {state.isRunning && !state.isPaused ? (
            <button
              onClick={pauseDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#D97706] font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>
          )}
          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <SignalChart
            channelName="Fp1"
            samplingRate={250}
            timeWindowSeconds={5}
            height={200}
            showControls={true}
          />
        </div>

        <div className="lg:col-span-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 flex flex-col justify-between text-xs font-mono shadow-subtle">
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
              SYSTEM TELEMETRY
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">EEG Input</span>
                <span className="text-[#16A34A] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Simulation Stream
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Signal Quality</span>
                <span className="text-[#0F172A] font-bold tabular-nums">98.2% (Nominal)</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Current Intent</span>
                <span className="text-[#2563EB] font-bold">{currentIntent}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">AI Confidence</span>
                <span className="text-[#0F172A] font-semibold tabular-nums">{confidence.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Hardware Arm</span>
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                  Disconnected
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Sampling: 250 Hz FS</span>
            <button
              onClick={showHardwareNotice}
              className="text-[#2563EB] hover:underline font-sans font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Connect Hardware</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 text-xs font-mono shadow-subtle">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">
              SPECTRAL BAND POWER (FP1 LEAD)
            </span>
            <span className="text-[11px] text-[#64748B]">Welch PSD (1.0s window)</span>
          </div>

          <div className="space-y-2.5">
            {[
              { band: 'ALPHA', freq: '8–13 Hz', pct: bands.Alpha?.percentage || 32.6, power: bands.Alpha?.power || 14.2 },
              { band: 'BETA', freq: '13–30 Hz', pct: bands.Beta?.percentage || 28.5, power: bands.Beta?.power || 7.5 },
              { band: 'THETA', freq: '4–8 Hz', pct: bands.Theta?.percentage || 17.2, power: bands.Theta?.power || 6.8 },
              { band: 'DELTA', freq: '0.5–4 Hz', pct: bands.Delta?.percentage || 15.6, power: bands.Delta?.power || 12.4 },
              { band: 'GAMMA', freq: '>30 Hz', pct: bands.Gamma?.percentage || 6.1, power: bands.Gamma?.power || 2.7 },
            ].map((row) => (
              <div key={row.band} className="flex items-center justify-between py-1 border-b border-[#F1F5F9] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F172A] w-14">{row.band}</span>
                  <span className="text-[#64748B] text-[11px]">{row.freq}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full"
                      style={{ width: `${Math.min(100, row.pct)}%` }}
                    />
                  </div>
                  <span className="text-[#0F172A] font-semibold tabular-nums w-12 text-right">{row.pct.toFixed(1)}%</span>
                  <span className="text-[#64748B] tabular-nums w-14 text-right">{row.power.toFixed(1)} µV²</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 text-xs font-mono shadow-subtle">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">
              REAL-TIME EVENT LOG
            </span>
            <span className="text-[11px] text-[#64748B]">Auto-scroll telemetry</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {(state.activities || []).slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] last:border-0 text-[12px]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#64748B] tabular-nums">{item.time}</span>
                  <span className="text-[#0F172A] font-medium">{item.message}</span>
                </div>
                <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 shadow-subtle">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-xs font-semibold text-[#0F172A]">
              3D Robotic Arm Kinematics Preview
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Virtual 5-DOF Manipulator Coupled with Motor Imagery Telemetry
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#2563EB] px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] border border-[#BFDBFE] font-medium">
            Simulation Active
          </span>
        </div>

        <RobotPreview height={300} showSliders={true} />
      </div>
    </div>
  );
};
