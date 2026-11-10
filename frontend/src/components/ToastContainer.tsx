import React from 'react';
import { useDemo } from '../context/DemoContext';
import { Info, AlertTriangle, CheckCircle2, X, OctagonAlert } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useDemo();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none font-sans">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-[8px] border shadow-subtle flex items-start gap-3 bg-[#FFFFFF] transition-all ${
            t.type === 'error'
              ? 'border-l-4 border-l-[#DC2626] border-[#E2E8F0] text-[#0F172A]'
              : t.type === 'success'
              ? 'border-l-4 border-l-[#16A34A] border-[#E2E8F0] text-[#0F172A]'
              : t.type === 'warning'
              ? 'border-l-4 border-l-[#D97706] border-[#E2E8F0] text-[#0F172A]'
              : 'border-l-4 border-l-[#2563EB] border-[#E2E8F0] text-[#0F172A]'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === 'error' && <OctagonAlert className="w-4 h-4 text-[#DC2626]" />}
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#D97706]" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-[#2563EB]" />}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-xs text-[#0F172A]">{t.title}</h5>
            <p className="text-xs text-[#64748B] mt-0.5 leading-snug">{t.message}</p>
          </div>

          <button
            onClick={() => dismissToast(t.id)}
            className="text-[#94A3B8] hover:text-[#0F172A] shrink-0 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
