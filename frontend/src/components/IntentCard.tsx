import React from 'react';
import { useDemo } from '../context/DemoContext';
import { Cpu, ShieldCheck } from 'lucide-react';

export const IntentCard: React.FC = () => {
  const { state, confidenceThreshold } = useDemo();
  const isAboveThreshold = state.confidence >= confidenceThreshold;

  return (
    <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#0F172A] font-semibold uppercase">
            <Cpu className="w-4 h-4 text-[#2563EB]" />
            <span>AI INTENT PREDICTION</span>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            RF-001
          </span>
        </div>

        <div className="my-2 p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#64748B] uppercase block">
              CURRENT INTENT
            </span>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
              {state.currentIntent}
            </div>
            <span className="text-[11px] text-[#16A34A] flex items-center gap-1 mt-0.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              {isAboveThreshold ? 'Validated (\u2265 ' + confidenceThreshold + '%)' : 'Under Threshold'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-[#64748B] uppercase block">
              CONFIDENCE
            </span>
            <div className={`text-2xl font-bold font-mono tabular-nums ${isAboveThreshold ? 'text-[#2563EB]' : 'text-[#D97706]'}`}>
              {state.confidence.toFixed(1)}%
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">
              Floor: {confidenceThreshold}%
            </span>
          </div>
        </div>

        <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0] mb-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isAboveThreshold ? 'bg-[#2563EB]' : 'bg-[#D97706]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, state.confidence))}%` }}
          />
        </div>

        <div className="space-y-1.5 border-t border-[#E2E8F0] pt-2">
          <span className="text-[11px] font-mono text-[#64748B] uppercase block">
            Alternative Predictions:
          </span>
          {state.alternativePredictions.map((alt, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#64748B]">{alt.intent}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div
                    className="h-full bg-[#2563EB] rounded-full"
                    style={{ width: `${Math.min(100, alt.probability * 8)}%` }}
                  />
                </div>
                <span className="text-[#0F172A] w-12 text-right tabular-nums">{alt.probability.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#E2E8F0] text-[11px] font-mono text-[#64748B] flex items-center justify-between">
        <span>Window: ~4.5s</span>
        <span className="text-[#2563EB] font-medium font-sans">Continuous Inference</span>
      </div>
    </div>
  );
};
