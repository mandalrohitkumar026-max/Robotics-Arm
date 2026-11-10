import React, { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  subLabel?: string;
  icon?: ReactNode;
  valueColor?: string;
  statusBadge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  subLabel,
  icon,
  valueColor = 'text-[#0F172A]',
  statusBadge
}) => {
  return (
    <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
          {label}
        </span>
        {icon && <div className="text-[#2563EB]">{icon}</div>}
      </div>

      <div className="my-2">
        <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${valueColor}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs font-mono text-[#64748B] mt-0.5">
            {subValue}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono border-t border-[#E2E8F0] pt-2 mt-1">
        <span className="text-[#64748B] truncate">{subLabel || 'Continuous Stream'}</span>
        {statusBadge && (
          <span className="text-[#16A34A] font-semibold ml-1">{statusBadge}</span>
        )}
      </div>
    </div>
  );
};
