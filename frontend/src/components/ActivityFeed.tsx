import React from 'react';
import { useDemo } from '../context/DemoContext';
import { Clock, Cpu, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ActivityFeed: React.FC<{ maxItems?: number }> = ({ maxItems = 6 }) => {
  const { state } = useDemo();
  const items = state.activities.slice(0, maxItems);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'intent':
        return <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />;
      case 'command':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />;
      case 'signal':
        return <Activity className="w-3.5 h-3.5 text-[#2563EB]" />;
      case 'safety':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  return (
    <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
        <h3 className="font-semibold text-xs text-[#0F172A] flex items-center gap-2 font-mono uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#2563EB]" />
          SYSTEM ACTIVITY LOG
        </h3>
        <span className="text-[11px] font-mono text-[#16A34A] flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          LIVE EVENT STREAM
        </span>
      </div>

      <div className="divide-y divide-[#E2E8F0]">
        {items.map((act) => (
          <div key={act.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              {getCategoryIcon(act.category)}
              <span className="text-[#64748B] tabular-nums">{act.time}</span>
              <span className="text-[#0F172A]">{act.message}</span>
            </div>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
              {act.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
