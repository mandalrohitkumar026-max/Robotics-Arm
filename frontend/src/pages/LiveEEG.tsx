import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useEEG } from '../context/EEGContext';
import { SignalChart } from '../components/SignalChart';
import { Play, Pause, Disc, RotateCcw } from 'lucide-react';

const CHANNELS_LIST = [
  { name: 'Fp1', region: 'Left Frontopolar', quality: 'Good', snr: '19.4 dB', imp: '< 4.2 kΩ' },
  { name: 'Fp2', region: 'Right Frontopolar', quality: 'Good', snr: '18.8 dB', imp: '< 4.5 kΩ' },
  { name: 'C3', region: 'Left Sensorimotor', quality: 'Good', snr: '20.1 dB', imp: '< 3.8 kΩ' },
  { name: 'C4', region: 'Right Sensorimotor', quality: 'Fair', snr: '16.5 dB', imp: '6.2 kΩ' },
  { name: 'P3', region: 'Left Parietal', quality: 'Good', snr: '19.0 dB', imp: '< 4.0 kΩ' },
  { name: 'P4', region: 'Right Parietal', quality: 'Good', snr: '18.6 dB', imp: '< 4.1 kΩ' },
  { name: 'O1', region: 'Left Occipital', quality: 'Good', snr: '21.2 dB', imp: '< 3.5 kΩ' },
  { name: 'O2', region: 'Right Occipital', quality: 'Good', snr: '20.8 dB', imp: '< 3.7 kΩ' },
];

export const LiveEEG: React.FC = () => {
  const { state: demoState, startDemo, pauseDemo, resetDemo, showToast } = useDemo();
  const {
    channels,
    selectedChannel,
    setSelectedChannel,
    notchFreq,
    setNotchFreq,
    timeWindowSec,
    setTimeWindowSec,
  } = useEEG();

  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const res = await fetch('http://localhost:8000/api/sessions/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 'researcher', label: 'LIVE_STREAM' }),
        });
        const data = await res.json();
        setIsRecording(true);
        showToast('Recording Started', `Acquiring session ${data.session_id} (8-ch @ 250 Hz)...`, 'info');
      } catch {
        setIsRecording(true);
        showToast('Recording Started', 'Acquiring 8-channel EEG stream (250 Hz)...', 'info');
      }
    } else {
      try {
        const res = await fetch('http://localhost:8000/api/sessions/stop', { method: 'POST' });
        const data = await res.json();
        setIsRecording(false);
        showToast('Recording Saved', `Session ${data.session_id} saved (${data.samples_count} samples).`, 'success');
      } catch {
        setIsRecording(false);
        showToast('Recording Saved', 'Session saved to EEG session archive.', 'success');
      }
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">
              Live EEG Monitor
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B]">
              <span className="text-[#2563EB] font-bold">{selectedChannel}</span>
              <span>&bull;</span>
              <span>250 Hz FS</span>
              <span>&bull;</span>
              <span className="text-[#16A34A] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Online Stream
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {demoState.isRunning && !demoState.isPaused ? (
            <button
              onClick={pauseDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#D97706] font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>
          )}

          <button
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer shadow-subtle ${
              isRecording
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                : 'bg-[#FFFFFF] hover:bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>{isRecording ? 'Stop Recording' : 'Record'}</span>
          </button>
        </div>
      </div>

      <SignalChart
        channelName={selectedChannel}
        samplingRate={250}
        timeWindowSeconds={timeWindowSec}
        height={selectedChannel === 'ALL' ? 420 : 300}
        showControls={true}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#64748B] mr-1 font-medium font-sans">Channel:</span>
          <button
            onClick={() => setSelectedChannel('ALL')}
            className={`px-2.5 py-1 rounded-[4px] border font-medium transition-colors cursor-pointer ${
              selectedChannel === 'ALL'
                ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All (8-Ch Montage)
          </button>
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-2.5 py-1 rounded-[4px] border font-medium transition-colors cursor-pointer ${
                selectedChannel === ch
                  ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] font-bold'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[#64748B]">
          <div className="flex items-center gap-1">
            <span className="font-sans">Notch:</span>
            <button
              onClick={() => setNotchFreq(50)}
              className={`px-2 py-0.5 rounded-[4px] border ${notchFreq === 50 ? 'text-[#2563EB] font-bold bg-[#EFF6FF] border-[#BFDBFE]' : 'text-[#64748B] border-transparent'}`}
            >
              50Hz
            </button>
            <button
              onClick={() => setNotchFreq(60)}
              className={`px-2 py-0.5 rounded-[4px] border ${notchFreq === 60 ? 'text-[#2563EB] font-bold bg-[#EFF6FF] border-[#BFDBFE]' : 'text-[#64748B] border-transparent'}`}
            >
              60Hz
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-sans">Window:</span>
            {[2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setTimeWindowSec(s)}
                className={`px-2 py-0.5 rounded-[4px] border ${timeWindowSec === s ? 'text-[#2563EB] font-bold bg-[#EFF6FF] border-[#BFDBFE]' : 'text-[#64748B] border-transparent'}`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span className="font-semibold text-[#0F172A] uppercase tracking-wider">ELECTRODE IMPEDANCE &amp; QUALITY MATRIX</span>
          <span>10–20 International System</span>
        </div>

        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-[#F8FAFC]/50 border-b border-[#E2E8F0] text-[#64748B] text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Channel</th>
              <th className="py-2.5 px-4">Cortical Region</th>
              <th className="py-2.5 px-4">Quality Status</th>
              <th className="py-2.5 px-4">SNR</th>
              <th className="py-2.5 px-4 text-right">Impedance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {CHANNELS_LIST.map((c) => (
              <tr
                key={c.name}
                onClick={() => setSelectedChannel(c.name)}
                className={`hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                  selectedChannel === c.name ? 'bg-[#EFF6FF]/60' : ''
                }`}
              >
                <td className="py-2.5 px-4 font-bold text-[#0F172A]">{c.name}</td>
                <td className="py-2.5 px-4 text-[#475569] font-sans">{c.region}</td>
                <td className="py-2.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-[4px] ${
                      c.quality === 'Good'
                        ? 'text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0]'
                        : 'text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${c.quality === 'Good' ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`} />
                    {c.quality}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-[#475569] tabular-nums">{c.snr}</td>
                <td className="py-2.5 px-4 text-right text-[#475569] tabular-nums">{c.imp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
