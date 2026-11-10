import React from 'react';
import type { JointMap } from '../types/robot';

interface JointAngleIndicatorProps {
  joints: JointMap;
  onChangeJoint?: (joint: keyof JointMap, val: number) => void;
  interactive?: boolean;
}

const JOINT_SPECS: Record<keyof JointMap, { name: string; min: number; max: number; unit: string }> = {
  J1: { name: 'Base Yaw', min: -170, max: 170, unit: '°' },
  J2: { name: 'Shoulder Pitch', min: -60, max: 120, unit: '°' },
  J3: { name: 'Elbow Pitch', min: -150, max: 150, unit: '°' },
  J4: { name: 'Wrist Pitch', min: -90, max: 90, unit: '°' },
  J5: { name: 'Wrist Roll', min: -180, max: 180, unit: '°' },
  J6: { name: 'Gripper', min: 0, max: 100, unit: '%' },
};

export const JointAngleIndicator: React.FC<JointAngleIndicatorProps> = ({
  joints,
  onChangeJoint,
  interactive = false
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 font-mono">
      {(Object.keys(JOINT_SPECS) as (keyof JointMap)[]).map((j) => {
        const spec = JOINT_SPECS[j];
        const val = joints[j] || 0;
        const normalizedPct = ((val - spec.min) / (spec.max - spec.min)) * 100;

        return (
          <div key={j} className="p-3 rounded-[6px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#2563EB]">{j}</span>
              <span className="text-[10px] text-[#64748B] font-sans">{spec.name}</span>
            </div>

            <div className="flex items-baseline justify-between my-1">
              <span className="text-base font-bold text-[#0F172A] tabular-nums">
                {j === 'J6' ? (val < 20 ? 'CLOSED' : val > 80 ? 'OPEN' : `${val.toFixed(0)}%`) : `${val.toFixed(1)}${spec.unit}`}
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                [{spec.min} to {spec.max}]
              </span>
            </div>

            {interactive && onChangeJoint ? (
              <input
                type="range"
                min={spec.min}
                max={spec.max}
                step={1}
                value={val}
                onChange={(e) => onChangeJoint(j, parseFloat(e.target.value))}
                className="w-full accent-[#2563EB] h-1.5 bg-[#F1F5F9] rounded-[4px] cursor-pointer"
              />
            ) : (
              <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden border border-[#E2E8F0]">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-150"
                  style={{ width: `${Math.min(100, Math.max(0, normalizedPct))}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
