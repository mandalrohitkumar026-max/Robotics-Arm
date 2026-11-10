import React from 'react';
import { useDemo } from '../context/DemoContext';
import { PageHeader } from '../components/PageHeader';
import {
  ShieldCheck,
  ShieldAlert,
  OctagonAlert,
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';

export const SafetyCenter: React.FC = () => {
  const { state, triggerEStop, resetEStop, confidenceThreshold } = useDemo();

  const principles = [
    { title: 'Deterministic Confidence Floor', desc: `Commands with classified confidence < ${confidenceThreshold}% are discarded at the gating layer before reaching kinematic solver.` },
    { title: 'Asynchronous E-Stop Priority', desc: 'Hardware and software emergency halt events interrupt all active trajectories with sub-5ms latency.' },
    { title: 'Command Rate & Slew Limiting', desc: 'Actuation directives are constrained by refractory periods (≥350ms) to prevent chatter and motor overshoot.' },
    { title: 'Heartbeat Watchdog Interlock', desc: 'Serial packet drop or frame timeout immediately places all joint actuators into safe zero-torque brake mode.' },
    { title: 'Joint Angular Limits Enforcement', desc: 'Software bounds prevent servo articulation beyond mechanical envelope (J1: ±90°, J2: 0–140°, J3: -45–90°).' },
    { title: 'State Confirmation Handshake', desc: 'Actuator positions are continuously verified against target setpoints with tracking error bounds.' }
  ];

  const safetyLog = [
    { time: '15:12:44', event: 'CONFIDENCE_REJECTION', detail: 'Forward intent score 71.4% < 80% threshold', severity: 'Info' },
    { time: '14:48:19', event: 'RATE_LIMIT_GATE', detail: 'Repeated grip trigger within 220ms cooldown', severity: 'Info' },
    { time: '14:15:02', event: 'SYSTEM_ARMED', detail: 'Safety interlock initialized in nominal simulation mode', severity: 'Nominal' }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Safety Center &amp; Interlocks"
        subtitle="Supervisory safety layer ensuring deterministic verification before any EEG command reaches physical or virtual actuators"
        badge={state.eStopLatched ? 'E-STOP LATCHED' : 'INTERLOCK NOMINAL'}
      />

      <div className={`p-5 rounded-[8px] border shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
        state.eStopLatched ? 'bg-[#FEF2F2] border-[#FECACA]' : 'bg-[#FFFFFF] border-[#E2E8F0]'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#64748B] uppercase">
            <Lock className={`w-3.5 h-3.5 ${state.eStopLatched ? 'text-[#DC2626]' : 'text-[#2563EB]'}`} />
            <span>PRIMARY SAFETY INTERLOCK &bull; STATION 01</span>
          </div>
          <h3 className={`text-xl font-bold font-mono tracking-tight ${state.eStopLatched ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>
            {state.eStopLatched ? 'ACTUATOR BUS HALTED (E-STOP ACTIVE)' : 'SAFETY INTERLOCK ARMED & NOMINAL'}
          </h3>
          <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
            Engaging Emergency Stop immediately cuts trajectory setpoint generation, freezes virtual joint coordinates (J1–J5), and sets the command gate to hard reject until manually disengaged.
          </p>
        </div>

        <div>
          {state.eStopLatched ? (
            <button
              onClick={resetEStop}
              className="px-6 py-3 rounded-[6px] bg-[#16A34A] hover:bg-[#15803D] text-white font-mono font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer shadow-subtle"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>DISENGAGE / CLEAR E-STOP</span>
            </button>
          ) : (
            <button
              onClick={triggerEStop}
              className="px-6 py-3 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono font-bold text-xs flex items-center gap-2.5 transition-colors cursor-pointer shadow-subtle"
            >
              <OctagonAlert className="w-4 h-4" />
              <span>TRIGGER EMERGENCY STOP</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
        <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            CRITICAL SUBSYSTEM STATUS
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">Continuous hardware polling</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] text-xs font-mono">
          <div className="p-3.5 space-y-1">
            <div className="text-[11px] text-[#64748B] uppercase">EEG Stream</div>
            <div className="text-sm font-bold text-[#2563EB] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              Stream Active
            </div>
            <div className="text-[10px] text-[#64748B]">Demo synthetic source</div>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="text-[11px] text-[#64748B] uppercase">Confidence Gate</div>
            <div className="text-sm font-bold text-[#16A34A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Enforcing &ge;{confidenceThreshold}%
            </div>
            <div className="text-[10px] text-[#64748B]">Sub-threshold rejected</div>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="text-[11px] text-[#64748B] uppercase">Rate Limiter</div>
            <div className="text-sm font-bold text-[#16A34A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Active (350ms)
            </div>
            <div className="text-[10px] text-[#64748B]">Chatter protection</div>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="text-[11px] text-[#64748B] uppercase">Emergency Stop</div>
            <div className={`text-sm font-bold flex items-center gap-1.5 ${state.eStopLatched ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${state.eStopLatched ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`} />
              {state.eStopLatched ? 'LATCHED' : 'ARMED'}
            </div>
            <div className="text-[10px] text-[#64748B]">Keyboard Space shortcut</div>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="text-[11px] text-[#64748B] uppercase">Hardware Link</div>
            <div className="text-sm font-bold text-[#94A3B8] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
              Standby
            </div>
            <div className="text-[10px] text-[#64748B]">ESP32 UART offline</div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#2563EB]" />
            SUPERVISORY SAFETY PROTOCOLS
          </span>
          <span className="text-[11px] font-mono text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-[4px] border border-[#BFDBFE]">
            ISO/IEC COMPLIANT ARCHITECTURE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          {principles.map((p, idx) => (
            <div key={idx} className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <div className="font-bold text-[#0F172A] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                {p.title}
              </div>
              <p className="text-[11px] text-[#475569] font-sans leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
        <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            SAFETY INTERVENTION &amp; GATE AUDIT LOG
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">Deterministic recording</span>
        </div>

        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-[#F8FAFC]/50 border-b border-[#E2E8F0] text-[#64748B]">
            <tr>
              <th className="py-2.5 px-4 font-semibold">TIMESTAMP</th>
              <th className="py-2.5 px-4 font-semibold">INTERVENTION EVENT</th>
              <th className="py-2.5 px-4 font-semibold">DETAILS</th>
              <th className="py-2.5 px-4 font-semibold text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[#475569]">
            {safetyLog.map((log, i) => (
              <tr key={i} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-2.5 px-4 tabular-nums text-[#64748B]">{log.time}</td>
                <td className="py-2.5 px-4 font-bold text-[#0F172A]">{log.event}</td>
                <td className="py-2.5 px-4 text-[#475569]">{log.detail}</td>
                <td className="py-2.5 px-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-medium ${
                    log.severity === 'Nominal'
                      ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                      : 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                  }`}>
                    {log.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
