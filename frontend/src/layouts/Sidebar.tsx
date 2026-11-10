import React from 'react';
import { useDemo } from '../context/DemoContext';

export type NavRoute =
  | '/dashboard'
  | '/eeg'
  | '/signals'
  | '/intent'
  | '/robot'
  | '/hardware'
  | '/sessions'
  | '/ml'
  | '/calibration'
  | '/analytics'
  | '/commands'
  | '/safety'
  | '/settings';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
}

interface NavGroup {
  category: string;
  items: Array<{
    route: NavRoute;
    label: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    category: 'WORKSPACE',
    items: [
      { route: '/dashboard', label: 'Dashboard' },
      { route: '/eeg', label: 'EEG Monitor' },
      { route: '/signals', label: 'Brain Signals' },
      { route: '/intent', label: 'Intent Recognition' },
    ],
  },
  {
    category: 'ROBOTICS',
    items: [
      { route: '/robot', label: '3D Robot' },
      { route: '/commands', label: 'Command Mapping' },
      { route: '/hardware', label: 'Hardware' },
    ],
  },
  {
    category: 'RESEARCH',
    items: [
      { route: '/ml', label: 'ML Lab' },
      { route: '/calibration', label: 'Calibration' },
      { route: '/sessions', label: 'Sessions' },
      { route: '/analytics', label: 'Analytics' },
    ],
  },
  {
    category: 'SYSTEM',
    items: [
      { route: '/safety', label: 'Safety Center' },
      { route: '/settings', label: 'Settings' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onRouteChange }) => {
  const { state } = useDemo();

  return (
    <aside className="w-[230px] bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 font-sans z-40">
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
            <h1 className="font-mono font-bold text-sm tracking-wide text-[#0F172A]">
              NEUROARM
            </h1>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5 font-medium tracking-tight">
            EEG &bull; BCI &bull; Robotics
          </p>
        </div>

        {/* Navigation Groups */}
        <nav className="p-2.5 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.category} className="space-y-0.5">
              <span className="px-2.5 text-[10px] font-mono font-semibold tracking-wider text-[#64748B] uppercase block mb-1">
                {group.category}
              </span>
              {group.items.map((item) => {
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => onRouteChange(item.route)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors flex items-center justify-between border-l-2 ${
                      isActive
                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.route === '/safety' && state.eStopLatched && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Status Indicator */}
      <div className="p-3.5 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="text-[#475569] font-medium">Demo Mode</span>
        </div>
        <span className="text-[#64748B]">v1.0</span>
      </div>
    </aside>
  );
};
