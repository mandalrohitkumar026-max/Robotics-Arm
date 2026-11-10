import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">
            {title}
          </h1>
          {badge && (
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[13px] text-[#64748B] mt-0.5 max-w-3xl leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
