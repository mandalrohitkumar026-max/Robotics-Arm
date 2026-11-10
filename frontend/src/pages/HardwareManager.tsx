import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { useDemo } from '../context/DemoContext';

interface DeviceItem {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Offline';
  connection: string;
  protocol: string;
}

const DEVICES: DeviceItem[] = [
  {
    id: 'eeg',
    name: 'EEG Biopotential System',
    type: 'Biopotential Ingestion',
    status: 'Active',
    connection: 'Internal Loop',
    protocol: 'Internal 250 Hz Stream'
  },
  {
    id: 'esp32',
    name: 'ESP32 Control Bridge',
    type: 'Microcontroller Bridge',
    status: 'Offline',
    connection: 'Not connected',
    protocol: 'USB Serial (115200 baud)'
  },
  {
    id: 'arm',
    name: '5-DOF Robotic Arm (PCA9685)',
    type: 'Servo PWM Actuator',
    status: 'Offline',
    connection: 'Not connected',
    protocol: 'I2C Bus 0x40'
  },
  {
    id: 'camera',
    name: 'Workspace Vision Sensor',
    type: 'Computer Vision',
    status: 'Offline',
    connection: 'Not connected',
    protocol: 'RTSP Stream'
  }
];

export const HardwareManager: React.FC = () => {
  const { showToast } = useDemo();

  const handleAction = (action: string, devName: string) => {
    showToast(
      `${action} Requested`,
      `${action} action on ${devName} is reserved for future hardware integration milestones.`,
      'info'
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Hardware Devices &amp; Interfaces"
        subtitle="Physical acquisition nodes, microcontroller communication channels, and robotic actuators"
        badge="Bus Topology"
      />

      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span className="font-semibold text-[#0F172A] uppercase tracking-wider">CONFIGURED HARDWARE PERIPHERALS</span>
          <span>4 Devices Registered</span>
        </div>

        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-[#F8FAFC]/50 border-b border-[#E2E8F0] text-[#64748B] text-[11px]">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Device</th>
              <th className="py-2.5 px-4 font-semibold">Subsystem</th>
              <th className="py-2.5 px-4 font-semibold">Interface Port</th>
              <th className="py-2.5 px-4 font-semibold">Protocol</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {DEVICES.map((d) => (
              <tr key={d.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-4 font-bold text-[#0F172A]">{d.name}</td>
                <td className="py-3 px-4 text-[#475569] font-sans">{d.type}</td>
                <td className="py-3 px-4 text-[#475569]">{d.connection}</td>
                <td className="py-3 px-4 text-[#64748B] text-[11px]">{d.protocol}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-[4px] ${
                      d.status === 'Active'
                        ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                        : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        d.status === 'Active' ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'
                      }`}
                    />
                    {d.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 font-sans">
                    <button
                      onClick={() => handleAction('Connect', d.name)}
                      className="px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-[11px] font-medium transition-colors cursor-pointer shadow-subtle"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => handleAction('Configure', d.name)}
                      className="px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => handleAction('Test', d.name)}
                      className="px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Test
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
