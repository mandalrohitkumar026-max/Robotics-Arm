import React from 'react';
import type { JointAngles } from '../types/demo';

interface JointStatusProps {
  joints: JointAngles;
  interactive?: boolean;
  onJointChange?: (joint: keyof JointAngles, val: number) => void;
}

export const JointStatus: React.FC<JointStatusProps> = ({ joints, interactive = false, onJointChange }) => {
  const jointConfigs: Array<{ key: keyof JointAngles; name: string; min: number; max: number; unit: string }> = [
    { key: 'J1', name: 'Base', min: 0, max: 180, unit: '°' },
    { key: 'J2', name: 'Shoulder', min: 0, max: 180, unit: '°' },
    { key: 'J3', name: 'Elbow', min: 0, max: 180, unit: '°' },
    { key: 'J4', name: 'Wrist', min: 0, max: 180, unit: '°' },
    { key: 'J5', name: 'Gripper', min: 0, max: 100, unit: '%' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
      {jointConfigs.map(({ key, name, min, max, unit }) => {
        const val = joints[key] || 0;
        const pct = ((val - min) / (max - min)) * 100;

        return (
          <div key={key} className="p-2.5 rounded-[6px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="font-bold text-[#0F172A]">{key}</span>
              <span className="text-[#64748B]">{name}</span>
            </div>

            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-sm font-bold text-[#0F172A] tabular-nums">
                {key === 'J5' ? (val < 30 ? 'CLOSED' : val > 70 ? 'OPEN' : `${val}%`) : `${val}${unit}`}
              </span>
              <span className="text-[10px] text-[#64748B]">[{min}..{max}]</span>
            </div>

            {interactive && onJointChange ? (
              <input
                type="range"
                min={min}
                max={max}
                value={val}
                onChange={(e) => onJointChange(key, parseFloat(e.target.value))}
                className="w-full accent-[#2563EB] h-1.5 bg-[#F1F5F9] rounded cursor-pointer"
              />
            ) : (
              <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
