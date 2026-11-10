import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useDemo } from '../context/DemoContext';
import {
  Search,
  Download,
  Eye,
  X,
  FileSpreadsheet,
  FileCode,
  HardDrive,
  Activity,
  Layers,
  CheckCircle2,
  Table
} from 'lucide-react';

interface SessionRow {
  id: string;
  session: string;
  date: string;
  duration: string;
  channels: number;
  quality: string;
  events: number;
  mode: 'Recorded' | 'Calibrated' | 'Simulation';
  file_csv?: string;
}

const DEFAULT_SESSIONS: SessionRow[] = [
  {
    id: '1',
    session: 'NEURO-2026-004',
    date: '01 Oct 2026',
    duration: '04:12',
    channels: 8,
    quality: '98.5%',
    events: 26,
    mode: 'Calibrated',
    file_csv: 'NEURO-2026-004.csv'
  },
  {
    id: '2',
    session: 'NEURO-2026-003',
    date: '01 Oct 2026',
    duration: '06:15',
    channels: 8,
    quality: '96.2%',
    events: 42,
    mode: 'Recorded',
    file_csv: 'NEURO-2026-003.csv'
  },
  {
    id: '3',
    session: 'NEURO-2026-002',
    date: '30 Sep 2026',
    duration: '12:00',
    channels: 8,
    quality: '99.1%',
    events: 89,
    mode: 'Recorded',
    file_csv: 'NEURO-2026-002.csv'
  },
  {
    id: '4',
    session: 'NEURO-2026-001',
    date: '29 Sep 2026',
    duration: '08:45',
    channels: 8,
    quality: '94.0%',
    events: 55,
    mode: 'Simulation',
    file_csv: 'NEURO-2026-001.csv'
  },
  {
    id: '5',
    session: 'SES-1718012001',
    date: '28 Sep 2026',
    duration: '01:00',
    channels: 8,
    quality: '98.2%',
    events: 24,
    mode: 'Recorded',
    file_csv: 'SES-1718012001.csv'
  },
  {
    id: '6',
    session: 'SES-1718012944',
    date: '29 Sep 2026',
    duration: '00:45',
    channels: 8,
    quality: '94.7%',
    events: 18,
    mode: 'Recorded',
    file_csv: 'SES-1718012944.csv'
  }
];

export const Sessions: React.FC = () => {
  const { showToast } = useDemo();
  const [sessions, setSessions] = useState<SessionRow[]>(DEFAULT_SESSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [activePreviewSession, setActivePreviewSession] = useState<SessionRow | null>(null);
  const [previewData, setPreviewData] = useState<{ columns: string[]; samples: any[] } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [filesCount, setFilesCount] = useState<number>(6);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/sessions/');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const liveItems: SessionRow[] = data.map((s: any, idx: number) => ({
              id: `live-${idx}`,
              session: s.session_id || `NEURO-2026-${100 + idx}`,
              date: (s.created_at || '').substring(0, 10) || '01 Oct 2026',
              duration: `${Math.floor((s.duration_seconds || 0) / 60)}:${String(Math.floor((s.duration_seconds || 0) % 60)).padStart(2, '0')}`,
              channels: (s.channels || []).length || 8,
              quality: s.signal_quality || '97.4%',
              events: Math.floor((s.samples_count || 100) / 25),
              mode: (s.mode as any) || 'Recorded',
              file_csv: s.file_csv || `${s.session_id}.csv`
            }));
            setSessions(liveItems);
          }
        }
      } catch {
        // Keep defaults
      }

      // Check backend files count
      try {
        const resFiles = await fetch('http://localhost:8000/api/sessions/files');
        if (resFiles.ok) {
          const fileInfo = await resFiles.json();
          if (fileInfo.files_count) {
            setFilesCount(fileInfo.files_count);
          }
        }
      } catch {
        // ignore
      }
    };

    fetchLiveSessions();
  }, []);

  const handleDownloadCsv = async (sessionId: string) => {
    showToast('Download Initiated', `Downloading ${sessionId}.csv from backend/recordings...`, 'info');
    try {
      const downloadUrl = `http://localhost:8000/api/sessions/${sessionId}/download`;
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('File not found');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sessionId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Download Completed', `${sessionId}.csv saved successfully.`, 'success');
    } catch (err) {
      // Fallback: direct window location
      window.open(`http://localhost:8000/api/sessions/${sessionId}/download`, '_blank');
    }
  };

  const handleView = async (s: SessionRow) => {
    setActivePreviewSession(s);
    setLoadingPreview(true);
    setPreviewData(null);
    try {
      const res = await fetch(`http://localhost:8000/api/sessions/${s.session}/preview?limit=12`);
      if (res.ok) {
        const data = await res.json();
        setPreviewData({ columns: data.columns || [], samples: data.samples || [] });
      }
    } catch {
      // preview error handled
    } finally {
      setLoadingPreview(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.session.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.date.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'ALL' || s.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const getStatusBadge = (mode: string) => {
    switch (mode) {
      case 'Calibrated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-[4px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            Calibrated
          </span>
        );
      case 'Recorded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-[4px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Recorded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-[4px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            Simulation
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Recorded Sessions Archive"
        subtitle="Historical multi-channel EEG telemetry recordings, event markers, and calibrated baselines"
        badge="Session Data Bank"
        actions={
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleDownloadCsv(filteredSessions[0]?.session || 'SES-1718012001')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium transition-colors cursor-pointer shadow-subtle"
            >
              <Download className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Download Active CSV</span>
            </button>
          </div>
        }
      />

      {/* Storage Information Banner */}
      <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[#0F172A] flex items-center gap-2">
              <span>PHYSICAL STORAGE: <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#2563EB] font-mono text-[11px]">backend/recordings/</code></span>
              <span className="inline-flex items-center gap-1 text-[10px] text-[#16A34A] font-medium bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                <CheckCircle2 className="w-3 h-3" />
                Active ({filesCount} files)
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">
              Standard 10-20 Montage (8 Channels: Fp1, Fp2, C3, C4, P3, P4, O1, O2) &bull; 250 Hz FS &bull; Microvolts (µV)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#64748B]">Formats:</span>
          <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-mono text-[#0F172A]">.CSV</span>
          <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-mono text-[#0F172A]">.JSON</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by session ID or date..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#64748B] text-[11px] font-medium">Filter Status:</span>
          {(['ALL', 'Calibrated', 'Recorded', 'Simulation'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-[4px] border font-medium text-[11px] transition-colors cursor-pointer ${
                filterMode === mode
                  ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Professional Data Table */}
      <div className="rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-hidden">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase tracking-wide">
            <tr>
              <th className="py-3 px-4 font-semibold">Session ID</th>
              <th className="py-3 px-4 font-semibold">Recorded Date</th>
              <th className="py-3 px-4 font-semibold">Duration</th>
              <th className="py-3 px-4 font-semibold">Channels</th>
              <th className="py-3 px-4 font-semibold">Signal Quality</th>
              <th className="py-3 px-4 font-semibold">Event Count</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredSessions.map((s) => (
              <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-4 font-bold text-[#0F172A]">{s.session}</td>
                <td className="py-3 px-4 text-[#475569]">{s.date}</td>
                <td className="py-3 px-4 text-[#475569] tabular-nums">{s.duration}</td>
                <td className="py-3 px-4 text-[#475569] tabular-nums">{s.channels} Leads</td>
                <td className="py-3 px-4 text-[#16A34A] font-semibold tabular-nums">{s.quality}</td>
                <td className="py-3 px-4 text-[#475569] tabular-nums">{s.events} markers</td>
                <td className="py-3 px-4 font-sans">{getStatusBadge(s.mode)}</td>
                <td className="py-3 px-4 text-right font-sans">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleView(s)}
                      title="Inspect EEG Samples"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-[11px] font-medium transition-colors cursor-pointer shadow-subtle"
                    >
                      <Eye className="w-3 h-3 text-[#2563EB]" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownloadCsv(s.session)}
                      title="Download Raw CSV"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#2563EB] text-[11px] font-medium transition-colors cursor-pointer shadow-subtle"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSessions.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-[#64748B] font-sans">
                  No sessions match the current search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sample Preview Modal */}
      {activePreviewSession && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[8px] shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[4px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#0F172A] font-mono">
                    SAMPLE PREVIEW: {activePreviewSession.session}.csv
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    First 12 telemetry samples from <code>backend/recordings/{activePreviewSession.session}.csv</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewSession(null)}
                className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-auto">
              {loadingPreview ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  Loading samples from disk...
                </div>
              ) : previewData && previewData.samples.length > 0 ? (
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-[6px]">
                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                      <tr>
                        {previewData.columns.map((col) => (
                          <th key={col} className="py-2 px-3 font-semibold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {previewData.samples.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#F8FAFC]">
                          {previewData.columns.map((col) => (
                            <td key={col} className="py-1.5 px-3 whitespace-nowrap text-[#0F172A] tabular-nums">
                              {col === 'event' ? (
                                <span className="px-1.5 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-bold text-[10px]">
                                  {row[col]}
                                </span>
                              ) : (
                                row[col]
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[#64748B]">
                  No preview rows available. You can download the full CSV file directly below.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#64748B]">
                Format: 250 Hz FS, 8 leads, µV scale
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePreviewSession(null)}
                  className="px-3 py-1.5 rounded-[4px] bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadCsv(activePreviewSession.session)}
                  className="px-3.5 py-1.5 rounded-[4px] bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-subtle"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
