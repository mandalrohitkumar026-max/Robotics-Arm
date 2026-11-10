export type DemoIntent = 'REST' | 'LEFT' | 'RIGHT' | 'GRIP' | 'RELEASE' | 'STOP';

export interface BrainwaveBand {
  name: string;
  range: string;
  value: number; // in uV^2
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface JointAngles {
  J1: number; // Base (0 to 180 or -90 to +90)
  J2: number; // Shoulder
  J3: number; // Elbow
  J4: number; // Wrist
  J5: number; // Gripper (0=Closed, 100=Open)
}

export interface ActivityLog {
  id: string;
  time: string;
  message: string;
  category: 'system' | 'intent' | 'signal' | 'command' | 'safety';
}

export interface DemoState {
  isRunning: boolean;
  isPaused: boolean;
  timeElapsed: number; // seconds
  signalQuality: number; // 98%
  currentIntent: DemoIntent;
  confidence: number; // e.g. 96.4%
  alternativePredictions: Array<{ intent: DemoIntent; probability: number }>;
  brainwaves: Record<string, BrainwaveBand>;
  jointAngles: JointAngles;
  activities: ActivityLog[];
  eStopLatched: boolean;
}

export interface HardwareDevice {
  id: string;
  name: string;
  category: 'eeg' | 'esp32' | 'arm' | 'camera';
  status: 'Not Connected';
  protocol: string;
  description: string;
}

export interface DemoSession {
  id: string;
  sessionId: string;
  date: string;
  duration: string;
  mode: 'SIMULATION';
  signalQuality: string;
  detectedCommands: string;
  status: 'Completed' | 'Archived';
}

export interface CommandMapItem {
  id: string;
  event: string;
  command: string;
  description: string;
}
