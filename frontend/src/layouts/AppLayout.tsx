import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { NavRoute } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../components/ToastContainer';

interface AppLayoutProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  pageTitle: string;
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRoute,
  onRouteChange,
  pageTitle,
  children
}) => {
  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentRoute={currentRoute} onRouteChange={onRouteChange} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <TopBar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F8FAFC]">
          {children}
        </main>
      </div>

      {/* Global Floating Toast Container */}
      <ToastContainer />
    </div>
  );
};
