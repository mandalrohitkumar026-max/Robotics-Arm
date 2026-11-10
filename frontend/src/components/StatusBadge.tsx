import React from 'react';

interface StatusBadgeProps {
  status: 'nominal' | 'warning' | 'critical' | 'offline' | 'active';
  label: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const statusStyles = {
    nominal: { dot: 'bg-[#16A34A]', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
    active: { dot: 'bg-[#2563EB]', bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]' },
    warning: { dot: 'bg-[#D97706]', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
    critical: { dot: 'bg-[#DC2626]', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#FECACA]' },
    offline: { dot: 'bg-[#94A3B8]', bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', border: 'border-[#E2E8F0]' }
  }[status] || { dot: 'bg-[#94A3B8]', bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', border: 'border-[#E2E8F0]' };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] ${statusStyles.bg} ${statusStyles.border} border font-mono text-xs font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
      <span className={statusStyles.text}>{label}</span>
    </div>
  );
};
