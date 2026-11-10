import React, { useRef, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { useEEG } from '../context/EEGContext';
import { demoEngine } from '../services/demoEngine';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SignalChartProps {
  channelName?: string;
  samplingRate?: number;
  timeWindowSeconds?: number;
  height?: number;
  showControls?: boolean;
}

const CHANNELS_8 = ['Fp1', 'Fp2', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2'];
const CHANNEL_COLORS: Record<string, string> = {
  Fp1: '#2563EB',
  Fp2: '#0284C7',
  C3: '#059669',
  C4: '#16A34A',
  P3: '#D97706',
  P4: '#B45309',
  O1: '#7C3AED',
  O2: '#9333EA',
};

export const SignalChart: React.FC<SignalChartProps> = ({
  channelName = 'Fp1',
  samplingRate = 250,
  timeWindowSeconds = 5,
  height = 240,
  showControls = true
}) => {
  const { state: demoState, startDemo, pauseDemo, resetDemo } = useDemo();
  const {
    connectionStatus,
    mode,
    filterMode,
    setFilterMode,
    voltageScale,
    setVoltageScale,
    getRawBuffer,
    getFilteredBuffer,
  } = useEEG();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackBufferRef = useRef<number[]>([]);
  const timeStepRef = useRef<number>(0);

  const totalPoints = Math.floor(samplingRate * timeWindowSeconds);
  const isLive = connectionStatus === 'connected' && mode === 'live';

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const width = rect.width;
      const canvasH = rect.height;

      // Pure white scientific chart background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, canvasH);

      // Fine, subtle grid lines
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      const gridSpacingX = width / (timeWindowSeconds * 2);
      for (let x = 0; x < width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasH);
        ctx.stroke();
      }

      const isAllChannels = channelName === 'ALL';

      if (isAllChannels) {
        // Clinical 8-Channel Stack Montage
        const numCh = CHANNELS_8.length;
        const laneH = canvasH / numCh;

        CHANNELS_8.forEach((ch, idx) => {
          const laneCenterY = idx * laneH + laneH / 2;

          // Subtle zero baseline
          ctx.strokeStyle = '#CBD5E1';
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(0, laneCenterY);
          ctx.lineTo(width, laneCenterY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Lane label
          ctx.fillStyle = '#64748B';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(ch, 10, laneCenterY - 4);

          let data: number[] = [];
          if (isLive) {
            const buf = filterMode === 'filtered' ? getFilteredBuffer(ch) : getRawBuffer(ch);
            data = buf.slice(-totalPoints);
          } else {
            if (fallbackBufferRef.current.length < totalPoints) {
              fallbackBufferRef.current = Array.from({ length: totalPoints }, (_, i) =>
                demoEngine.getNextWaveformPoint(i / samplingRate)
              );
            }
            data = fallbackBufferRef.current;
          }

          if (data.length > 1) {
            ctx.strokeStyle = CHANNEL_COLORS[ch] || '#2563EB';
            ctx.lineWidth = 1.1;
            ctx.beginPath();

            const step = width / (data.length - 1);
            const scale = (laneH * 0.4) / (voltageScale || 50);

            for (let i = 0; i < data.length; i++) {
              const x = i * step;
              const val = data[i];
              const y = laneCenterY - val * scale;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        });
      } else {
        // Single Channel View
        const centerY = canvasH / 2;

        // Zero baseline
        ctx.strokeStyle = '#CBD5E1';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Voltage scale lines
        const scale = (canvasH * 0.4) / (voltageScale || 50);
        ctx.strokeStyle = '#E2E8F0';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, centerY - (voltageScale / 2) * scale);
        ctx.lineTo(width, centerY - (voltageScale / 2) * scale);
        ctx.moveTo(0, centerY + (voltageScale / 2) * scale);
        ctx.lineTo(width, centerY + (voltageScale / 2) * scale);
        ctx.stroke();
        ctx.setLineDash([]);

        // Voltage scale text
        ctx.fillStyle = '#64748B';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`+${voltageScale} µV`, width - 54, centerY - (voltageScale / 2) * scale - 4);
        ctx.fillText(`-${voltageScale} µV`, width - 54, centerY + (voltageScale / 2) * scale + 12);

        let data: number[] = [];
        if (isLive) {
          const buf = filterMode === 'filtered' ? getFilteredBuffer(channelName) : getRawBuffer(channelName);
          data = buf.slice(-totalPoints);
        } else {
          if (demoState.isRunning && !demoState.isPaused && !demoState.eStopLatched) {
            for (let k = 0; k < 3; k++) {
              timeStepRef.current += 1 / samplingRate;
              const nextVal = demoEngine.getNextWaveformPoint(timeStepRef.current);
              fallbackBufferRef.current.push(nextVal);
              if (fallbackBufferRef.current.length > totalPoints) {
                fallbackBufferRef.current.shift();
              }
            }
          }
          data = fallbackBufferRef.current;
        }

        if (data.length > 1) {
          ctx.strokeStyle = '#2563EB'; // Scientific blue waveform trace
          ctx.lineWidth = 1.3;
          ctx.shadowBlur = 0;
          ctx.beginPath();

          const step = width / (data.length - 1);
          for (let i = 0; i < data.length; i++) {
            const x = i * step;
            const val = data[i];
            const y = centerY - val * scale;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Leading edge scanner
          const leadX = width - 1;
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(leadX, 0);
          ctx.lineTo(leadX, canvasH);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isLive,
    channelName,
    filterMode,
    voltageScale,
    samplingRate,
    timeWindowSeconds,
    totalPoints,
    demoState.isRunning,
    demoState.isPaused,
    demoState.eStopLatched,
    getFilteredBuffer,
    getRawBuffer,
  ]);

  return (
    <div className="rounded-[6px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
      {/* Waveform Header & Telemetry Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC] text-[12px] font-mono">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#0F172A]">
            {channelName === 'ALL' ? 'Multichannel Montage' : `Channel ${channelName}`}
          </span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="text-[#475569]">250 Hz</span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="text-[#16A34A] font-medium">Good</span>
        </div>

        {/* Display Badges */}
        <div className="flex items-center gap-3 text-[#475569]">
          <span>
            Time: <strong className="text-[#0F172A] font-semibold">{timeWindowSeconds}s</strong>
          </span>
          <span>
            Scale: <strong className="text-[#0F172A] font-semibold">±{voltageScale} µV</strong>
          </span>
          <span>
            Filter: <strong className="text-[#0F172A] font-semibold">{filterMode === 'filtered' ? '0.5–45 Hz' : 'Raw'}</strong>
          </span>
        </div>
      </div>

      {/* Canvas Display */}
      <div
        className="w-full relative bg-[#FFFFFF]"
        style={{ height: `${height}px` }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Interactive Controls Footer */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-[#E2E8F0] bg-[#F8FAFC] text-[12px] font-mono">
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div className="flex rounded-[4px] bg-[#F1F5F9] p-0.5 border border-[#E2E8F0]">
              <button
                onClick={() => setFilterMode('filtered')}
                className={`px-2.5 py-0.5 rounded-[3px] text-[11px] transition-colors ${
                  filterMode === 'filtered'
                    ? 'bg-[#FFFFFF] text-[#2563EB] font-semibold shadow-subtle'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Filtered
              </button>
              <button
                onClick={() => setFilterMode('raw')}
                className={`px-2.5 py-0.5 rounded-[3px] text-[11px] transition-colors ${
                  filterMode === 'raw'
                    ? 'bg-[#FFFFFF] text-[#D97706] font-semibold shadow-subtle'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Raw
              </button>
            </div>

            {/* Voltage Scale */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0] text-[11px]">
              <span className="text-[#64748B]">Scale:</span>
              {[25, 50, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setVoltageScale(s)}
                  className={`px-1.5 rounded-[2px] transition-colors ${
                    voltageScale === s ? 'text-[#2563EB] font-bold bg-[#FFFFFF] shadow-subtle' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  ±{s}µV
                </button>
              ))}
            </div>
          </div>

          {/* Start / Pause / Reset Controls */}
          <div className="flex items-center gap-1.5">
            {demoState.isRunning && !demoState.isPaused ? (
              <button
                onClick={pauseDemo}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#D97706] text-[11px] font-medium transition-colors"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startDemo}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#16A34A] text-[11px] font-medium transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>Start</span>
              </button>
            )}
            <button
              onClick={resetDemo}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-[11px] font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
