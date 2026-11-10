import React from 'react';
import { useDemo } from '../context/DemoContext';
import type { HardwareDevice } from '../types/demo';
import { Radio, Cpu, Boxes, Camera } from 'lucide-react';

interface HardwareCardProps {
  device: HardwareDevice;
}

export const HardwareCard: React.FC<HardwareCardProps> = ({ device }) => {
  const { showHardwareNotice } = useDemo();

  const getIcon = () => {
    switch (device.category) {
      case 'eeg':
        return <Radio className="w-4 h-4 text-[#2563EB]" />;
      case 'esp32':
        return <Cpu className="w-4 h-4 text-[#2563EB]" />;
      case 'arm':
        return <Boxes className="w-4 h-4 text-[#16A34A]" />;
      case 'camera':
        return <Camera className="w-4 h-4 text-[#D97706]" />;
    }
  };

  return (
    <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between hover:border-[#CBD5E1] transition-all font-sans">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
            {getIcon()}
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0] font-mono text-[11px] text-[#64748B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
            Not Connected
          </span>
        </div>

        <h3 className="font-semibold text-sm text-[#0F172A]">
          {device.name}
        </h3>
        <p className="text-xs text-[#64748B] mt-1 mb-3 leading-relaxed">
          {device.description}
        </p>

        <div className="space-y-1.5 text-xs font-mono bg-[#F8FAFC] p-2.5 rounded-[6px] border border-[#E2E8F0] mb-3">
          <div className="flex justify-between text-[#64748B]">
            <span>Interface:</span>
            <span className="text-[#0F172A] font-medium">{device.protocol}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Target Milestone:</span>
            <span className="text-[#2563EB] font-semibold">Future Phase</span>
          </div>
        </div>
      </div>

      <button
        onClick={showHardwareNotice}
        className="w-full py-2 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer"
      >
        Connect Device
      </button>
    </div>
  );
};
