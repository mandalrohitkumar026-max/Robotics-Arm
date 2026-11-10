import React from 'react';
import { useDemo } from '../context/DemoContext';
import { PageHeader } from '../components/PageHeader';
import { RobotPreview } from '../components/RobotPreview';
import { Home, RotateCcw, OctagonAlert } from 'lucide-react';

export const RoboticArm3D: React.FC = () => {
  const { state, setJoint, resetDemo, triggerEStop, resetEStop } = useDemo();

  const handleHome = () => {
    setJoint('J1', 45);
    setJoint('J2', 62);
    setJoint('J3', 78);
    setJoint('J4', 30);
    setJoint('J5', 75);
  };

  const joints = state.jointAngles || { J1: 45, J2: 62, J3: 78, J4: 30, J5: 75 };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="3D Arm Simulator"
        subtitle="5-DOF articulated manipulator kinematics and telemetry console"
        badge="Simulation Mode"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden p-4 flex flex-col justify-between shadow-subtle">
          <div className="flex items-center justify-between mb-2 text-xs font-mono text-[#64748B]">
            <span className="font-semibold text-[#0F172A] uppercase tracking-wider">3D KINEMATICS VIEWPORT</span>
            <span>Orbit: Drag &bull; Zoom: Scroll</span>
          </div>

          <RobotPreview height={440} showSliders={false} />
        </div>

        <div className="lg:col-span-4 space-y-4 font-mono text-xs">
          <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-4 space-y-3 shadow-subtle">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              ROBOT STATUS
            </span>

            <div className="space-y-2 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Connection</span>
                <span className="text-[#94A3B8] flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                  Offline
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Mode</span>
                <span className="text-[#16A34A] flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Simulation Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Active Intent</span>
                <span className="text-[#2563EB] font-bold">{state.currentIntent}</span>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block pt-1">
              JOINT TELEMETRY
            </span>

            <div className="space-y-1.5 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">J1 Base</span>
                <span className="font-bold text-[#0F172A] tabular-nums">{joints.J1}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">J2 Shoulder</span>
                <span className="font-bold text-[#0F172A] tabular-nums">{joints.J2}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">J3 Elbow</span>
                <span className="font-bold text-[#0F172A] tabular-nums">{joints.J3}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">J4 Wrist</span>
                <span className="font-bold text-[#0F172A] tabular-nums">{joints.J4}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">J5 Gripper</span>
                <span className="font-bold text-[#2563EB] tabular-nums">
                  {joints.J5 > 60 ? 'OPEN' : 'CLAMP'}
                </span>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block pt-1">
              COMMAND LOG
            </span>

            <div className="space-y-1">
              {['LEFT', 'GRIP', 'RELEASE'].map((cmd, idx) => (
                <div key={idx} className="flex items-center justify-between text-[#475569] py-1 border-b border-[#F8FAFC]">
                  <span className="text-[#64748B]">CMD-{idx + 1}</span>
                  <span className="font-bold text-[#0F172A]">{cmd}</span>
                  <span className="text-[#16A34A] text-[10px] bg-[#F0FDF4] px-1.5 py-0.2 rounded border border-[#BBF7D0]">
                    Executed
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] p-3 flex items-center justify-between gap-2 shadow-subtle">
            <button
              onClick={handleHome}
              className="flex-1 py-1.5 px-3 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-subtle"
            >
              <Home className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>HOME</span>
            </button>

            <button
              onClick={resetDemo}
              className="flex-1 py-1.5 px-3 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            {state.eStopLatched ? (
              <button
                onClick={resetEStop}
                className="flex-1 py-1.5 px-3 rounded-[4px] bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-subtle"
              >
                <span>RESET STOP</span>
              </button>
            ) : (
              <button
                onClick={triggerEStop}
                className="flex-1 py-1.5 px-3 rounded-[4px] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <OctagonAlert className="w-3.5 h-3.5" />
                <span>E-STOP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
