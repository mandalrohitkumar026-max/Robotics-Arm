import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useDemo } from '../context/DemoContext';
import { Sliders, Plus, Trash2, ArrowRight, RotateCcw, ShieldCheck, Clock } from 'lucide-react';

export interface CommandRule {
  id: string;
  event: string;
  command: string;
  minConfidence: number;
  cooldownMs: number;
  description: string;
}

const DEFAULT_RULES: CommandRule[] = [
  { id: '1', event: 'Single Blink (Frontal)', command: 'GRIP', minConfidence: 85, cooldownMs: 400, description: 'Clamps end-effector claw' },
  { id: '2', event: 'Double Blink (Frontal)', command: 'RELEASE', minConfidence: 85, cooldownMs: 400, description: 'Opens end-effector gripper' },
  { id: '3', event: 'Left Intent (C4 ERD)', command: 'LEFT', minConfidence: 80, cooldownMs: 500, description: 'Rotates base turntable counter-clockwise' },
  { id: '4', event: 'Right Intent (C3 ERD)', command: 'RIGHT', minConfidence: 80, cooldownMs: 500, description: 'Rotates base turntable clockwise' },
  { id: '5', event: 'Forward Intent (Mu Sync)', command: 'FORWARD', minConfidence: 82, cooldownMs: 500, description: 'Articulates shoulder and elbow forward' },
  { id: '6', event: 'Backward Intent (Parietal)', command: 'BACKWARD', minConfidence: 82, cooldownMs: 500, description: 'Retracts shoulder and elbow backward' },
  { id: '7', event: 'Stop Intent (Inhibitory)', command: 'STOP', minConfidence: 75, cooldownMs: 250, description: 'Immediate emergency halt override' },
];

export const CommandMapping: React.FC = () => {
  const { showToast } = useDemo();
  const [rules, setRules] = useState<CommandRule[]>(() => {
    try {
      const saved = localStorage.getItem('neuroarm_command_rules');
      return saved ? JSON.parse(saved) : DEFAULT_RULES;
    } catch {
      return DEFAULT_RULES;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState('Triple Blink');
  const [newCmd, setNewCmd] = useState('HOME');
  const [newConf, setNewConf] = useState(80);
  const [newCooldown, setNewCooldown] = useState(500);
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('neuroarm_command_rules', JSON.stringify(rules));
    } catch {
      // Ignore
    }
  }, [rules]);

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    showToast('Rule Deleted', 'Command routing mapping removed.', 'info');
  };

  const handleReset = () => {
    setRules(DEFAULT_RULES);
    showToast('Reset Complete', 'Default command mappings restored.', 'success');
  };

  const handleAdd = () => {
    if (!newEvent || !newCmd) return;
    const item: CommandRule = {
      id: Math.random().toString(),
      event: newEvent,
      command: newCmd,
      minConfidence: newConf,
      cooldownMs: newCooldown,
      description: newDesc || 'Custom mapping rule'
    };
    setRules(prev => [...prev, item]);
    setShowAddModal(false);
    setNewDesc('');
    showToast('Mapping Created', `${newEvent} mapped to ${newCmd}.`, 'success');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Command Translation Matrix"
        subtitle="Route detected biological EEG patterns and ocular events to discrete robotic actions"
        badge="Mapping Registry"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium transition-colors cursor-pointer shadow-subtle font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mapping Rule</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors cursor-pointer shadow-subtle font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        }
      />

      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase tracking-wide">
            <tr>
              <th className="py-3 px-4 font-semibold">Biological EEG Event</th>
              <th className="py-3 px-4 text-center font-semibold">Translation</th>
              <th className="py-3 px-4 font-semibold">Robotic Action</th>
              <th className="py-3 px-4 font-semibold">Min Confidence</th>
              <th className="py-3 px-4 font-semibold">Cooldown</th>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-4 font-bold text-[#0F172A]">{r.event}</td>
                <td className="py-3 px-4 text-center">
                  <ArrowRight className="w-3.5 h-3.5 mx-auto text-[#2563EB]" />
                </td>
                <td className="py-3 px-4 font-bold">
                  <span className="px-2 py-0.5 rounded-[4px] text-[11px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                    {r.command}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[#16A34A] font-semibold tabular-nums flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                    &ge; {r.minConfidence}%
                  </span>
                </td>
                <td className="py-3 px-4 text-[#64748B] tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {r.cooldownMs} ms
                  </span>
                </td>
                <td className="py-3 px-4 text-[#475569] font-sans">{r.description}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1 rounded-[4px] hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[8px] max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Sliders className="w-4 h-4 text-[#2563EB]" />
              Add Command Routing Rule
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#475569] block mb-1 font-medium">Biological Trigger Event:</label>
                <input
                  type="text"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  placeholder="e.g. Forward Intent, Triple Blink"
                />
              </div>

              <div>
                <label className="text-[#475569] block mb-1 font-medium">Robotic Command Action:</label>
                <input
                  type="text"
                  value={newCmd}
                  onChange={(e) => setNewCmd(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] font-bold font-mono focus:outline-none focus:border-[#2563EB]"
                  placeholder="e.g. FORWARD, HOME, SELECT"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#475569] block mb-1 font-medium">Min Confidence (%):</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={newConf}
                    onChange={(e) => setNewConf(parseInt(e.target.value) || 80)}
                    className="w-full px-3 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] block mb-1 font-medium">Cooldown (ms):</label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="50"
                    value={newCooldown}
                    onChange={(e) => setNewCooldown(parseInt(e.target.value) || 500)}
                    className="w-full px-3 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#475569] block mb-1 font-medium">Description:</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  placeholder="e.g. Articulates elbow forward"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0] text-xs">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 rounded-[6px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium transition-colors cursor-pointer shadow-subtle"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
