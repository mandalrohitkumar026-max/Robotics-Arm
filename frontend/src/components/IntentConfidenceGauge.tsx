import React from 'react';
import type { IntentPrediction } from '../types/eeg';
import { useEEG } from '../context/EEGContext';
import { ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

interface IntentConfidenceGaugeProps {
  prediction: IntentPrediction;
  threshold?: number;
  allowManualTrigger?: boolean;
}

export const IntentConfidenceGauge: React.FC<IntentConfidenceGaugeProps> = ({
  prediction,
  threshold = 80.0,
  allowManualTrigger = true
}) => {
  const { triggerIntent } = useEEG();
  const isSafe = prediction.confidence >= threshold;
  const isStop = prediction.intent === 'STOP';

  const sortedAlts = Object.entries(prediction.probabilities || {})
    .filter(([cmd]) => cmd !== prediction.intent)
    .slice(0, 3);

  const availableCommands = ["REST", "LEFT", "RIGHT", "FORWARD", "BACKWARD", "GRIP", "RELEASE", "STOP"];

  return (
    <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
          <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
            CLASSIFIED INTENT
          </span>
          <span className="text-xs font-mono text-[#64748B]">
            Model: <span className="text-[#2563EB] font-medium">{prediction.model_type}</span>
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#F8FAFC] p-3.5 rounded-[6px] border border-[#E2E8F0] mb-3">
          <div>
            <div className="text-2xl font-bold font-mono tracking-wide text-[#0F172A]">
              {prediction.intent}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {isSafe || isStop ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ACCEPTED (&ge; {threshold}%)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  GATED (&lt; {threshold}%)
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold font-mono tabular-nums ${isSafe || isStop ? "text-[#2563EB]" : "text-[#D97706]"}`}>
              {prediction.confidence.toFixed(1)}%
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">Probability</span>
          </div>
        </div>

        <div className="relative mb-3">
          <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isSafe || isStop ? 'bg-[#2563EB]' : 'bg-[#D97706]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, prediction.confidence))}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <span className="text-[11px] font-mono text-[#64748B] uppercase">
            Alternative Predictions:
          </span>
          {sortedAlts.map(([cmd, prob]) => (
            <div key={cmd} className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#64748B]">{cmd}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div
                    className="h-full bg-[#2563EB] rounded-full"
                    style={{ width: `${prob}%` }}
                  />
                </div>
                <span className="text-[#0F172A] w-10 text-right tabular-nums">{prob.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {allowManualTrigger && (
        <div className="pt-2.5 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono text-[#64748B]">
            <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Simulate Intent Cue:</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {availableCommands.map(cmd => (
              <button
                key={cmd}
                onClick={() => triggerIntent(cmd)}
                className={`text-[11px] font-mono py-1 rounded-[4px] border transition-all cursor-pointer ${
                  prediction.intent === cmd
                    ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] font-bold'
                    : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
