import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useDemo } from '../context/DemoContext';
import { Settings as SettingsIcon, Sliders, Volume2, ShieldCheck, Sun, RefreshCw, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { confidenceThreshold, setConfidenceThreshold, showToast } = useDemo();
  const [thresholdInput, setThresholdInput] = useState(confidenceThreshold);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme] = useState('Scientific Workstation Light (#F8FAFC / #FFFFFF)');
  const [demoSpeed, setDemoSpeed] = useState('Standard (4.5s Intent Cycle)');

  const handleSave = () => {
    setConfidenceThreshold(thresholdInput);
    showToast('Preferences Saved', 'All settings successfully stored in localStorage.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <PageHeader
        title="Platform Preferences &amp; Settings"
        subtitle="Manage simulation parameters, safety thresholds, and localized workstation options"
        badge="Configured"
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors cursor-pointer shadow-subtle"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              Command Safety Threshold
            </span>
            <span className="text-[10px] font-mono text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-[4px] border border-[#BBF7D0]">
              Active Gate
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[#64748B] font-sans">Confidence Floor:</span>
                <span className="text-[#2563EB] font-bold tabular-nums text-sm">{thresholdInput}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="1"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(parseFloat(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1 tabular-nums font-sans">
                <span>60% (Permissive)</span>
                <span>80% (Default)</span>
                <span>95% (Strict)</span>
              </div>
            </div>
            <p className="text-[11px] text-[#475569] font-sans leading-relaxed">
              Predictions below this confidence value are discarded and rejected before reaching motor kinematics.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2563EB]" />
              Simulation Settings
            </span>
            <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0]">
              Cycle Timer
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#475569] block mb-1 text-[11px] uppercase font-mono font-medium">Cycle Speed:</label>
              <select
                value={demoSpeed}
                onChange={(e) => setDemoSpeed(e.target.value)}
                className="w-full px-3 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none text-xs"
              >
                <option value="Standard (4.5s Intent Cycle)">Standard (~4.5s Intent Cycle)</option>
                <option value="Rapid (2.5s Intent Cycle)">Rapid (~2.5s Intent Cycle)</option>
                <option value="Slow (7.0s Intent Cycle)">Slow (~7.0s Intent Cycle)</option>
              </select>
            </div>

            <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[11px]">
              Synchronized via internal event engine for deterministic state propagation across views.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#2563EB]" />
              Workstation Palette
            </span>
            <span className="text-[10px] font-mono text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-[4px] border border-[#BFDBFE]">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#475569] block mb-1 text-[11px] uppercase font-mono font-medium">Active Theme:</label>
              <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] font-medium font-mono">
                {theme}
              </div>
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              Clean white &amp; neutral slate scientific interface designed for medical research workstations and high clarity data visualization.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#2563EB]" />
              Notifications &amp; Audit
            </span>
            <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0]">
              Toast Bus
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#0F172A] font-medium">Floating Toast Alerts</span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#2563EB] cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              Real-time notifications for intent triggers, E-Stop latching, and calibration events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
