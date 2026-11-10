import React, { useRef, useEffect } from 'react';
import { useEEG } from '../contexts/EEGContext';

interface WaveformCanvasProps {
  channels?: string[];
  height?: number;
  showLabels?: boolean;
}

const CHANNEL_COLORS: Record<string, string> = {
  Fp1: '#2563EB',
  Fp2: '#0284C7',
  C3: '#0D9488',
  C4: '#16A34A',
  P3: '#D97706',
  P4: '#EA580C',
  O1: '#7C3AED',
  O2: '#4F46E5'
};

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  channels,
  height = 320,
  showLabels = true
}) => {
  const { rawBuffer, filteredBuffer, displayMode, selectedChannels, isPaused, blinkInfo } = useEEG();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeChannels = channels || selectedChannels;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const canvasHeight = rect.height;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, canvasHeight);

    // Draw Subtle Grid Lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    if (activeChannels.length === 0) return;

    const channelHeight = canvasHeight / activeChannels.length;
    const activeData = displayMode === 'filtered' ? filteredBuffer : rawBuffer;

    activeChannels.forEach((ch, idx) => {
      const centerY = channelHeight * idx + channelHeight / 2;
      const buffer = activeData[ch] || [];

      // Horizontal baseline
      ctx.strokeStyle = '#CBD5E1';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Channel Label
      if (showLabels) {
        ctx.fillStyle = CHANNEL_COLORS[ch] || '#475569';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillText(ch, 12, centerY - 6);
      }

      // Draw EEG Waveform
      if (buffer.length > 1) {
        ctx.strokeStyle = CHANNEL_COLORS[ch] || '#2563EB';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const step = width / (buffer.length - 1);
        const scale = channelHeight / 110; // Scaling ~ ±50 uV range

        for (let i = 0; i < buffer.length; i++) {
          const x = i * step;
          // Clamp for display inside channel lane
          const val = Math.max(-65, Math.min(65, buffer[i]));
          const y = centerY - val * scale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Highlight recent blink deflection on Fp1/Fp2 if active
        if ((ch === 'Fp1' || ch === 'Fp2') && blinkInfo.blink_detected) {
          ctx.fillStyle = 'rgba(220, 38, 38, 0.12)';
          ctx.fillRect(width - 55, centerY - channelHeight / 2, 55, channelHeight);
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('BLINK', width - 48, centerY + 14);
        }
      }
    });

    // Vertical sweep indicator line if live
    if (!isPaused) {
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width - 2, 0);
      ctx.lineTo(width - 2, canvasHeight);
      ctx.stroke();
    }
  }, [rawBuffer, filteredBuffer, activeChannels, displayMode, isPaused, height, blinkInfo]);

  return (
    <div className="relative w-full rounded-[8px] overflow-hidden border border-[#E2E8F0] bg-[#FFFFFF] shadow-subtle">
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px` }}
      />
      {/* Microvolt Scale Legend */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[10px] font-mono text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0] pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
        <span>±50 µV / lane</span>
      </div>
    </div>
  );
};
