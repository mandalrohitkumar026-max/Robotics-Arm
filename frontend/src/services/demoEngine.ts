import type { DemoState, DemoIntent, JointAngles, ActivityLog, BrainwaveBand } from '../types/demo';

const INITIAL_JOINTS: JointAngles = {
  J1: 45, // Base
  J2: 62, // Shoulder
  J3: 78, // Elbow
  J4: 30, // Wrist
  J5: 75  // Gripper (0-100)
};

const DEFAULT_BRAINWAVES: Record<string, BrainwaveBand> = {
  Delta: { name: 'DELTA', range: '0.5–4 Hz', value: 14.2, percentage: 32.5, trend: 'stable', color: '#3B82F6' },
  Theta: { name: 'THETA', range: '4–8 Hz', value: 6.8, percentage: 15.6, trend: 'down', color: '#10B981' },
  Alpha: { name: 'ALPHA', range: '8–13 Hz', value: 12.5, percentage: 28.7, trend: 'up', color: '#00F0FF' },
  Beta: { name: 'BETA', range: '13–30 Hz', value: 7.2, percentage: 16.5, trend: 'up', color: '#F59E0B' },
  Gamma: { name: 'GAMMA', range: '>30 Hz', value: 2.9, percentage: 6.7, trend: 'stable', color: '#EC4899' },
};

type StateListener = (state: DemoState) => void;

class DemoEngine {
  private state: DemoState;
  private listeners: Set<StateListener> = new Set();
  private timer: number | null = null;
  private waveformSampleIndex: number = 0;
  private lastIntentChangeTime: number = 0;
  private readonly possibleIntents: DemoIntent[] = ['REST', 'LEFT', 'RIGHT', 'GRIP', 'RELEASE', 'STOP'];

  constructor() {
    this.state = {
      isRunning: true,
      isPaused: false,
      timeElapsed: 0,
      signalQuality: 98,
      currentIntent: 'REST',
      confidence: 96.4,
      alternativePredictions: [
        { intent: 'LEFT', probability: 1.8 },
        { intent: 'RIGHT', probability: 0.9 },
        { intent: 'GRIP', probability: 0.5 },
        { intent: 'STOP', probability: 0.4 },
      ],
      brainwaves: { ...DEFAULT_BRAINWAVES },
      jointAngles: { ...INITIAL_JOINTS },
      activities: [
        { id: '1', time: this.formatTime(Date.now() - 9000), message: 'Demo EEG session started', category: 'system' },
        { id: '2', time: this.formatTime(Date.now() - 7000), message: 'Signal quality: GOOD (98%)', category: 'signal' },
        { id: '3', time: this.formatTime(Date.now() - 4000), message: 'Intent detected: REST', category: 'intent' },
        { id: '4', time: this.formatTime(Date.now() - 3000), message: 'Confidence: 96.4%', category: 'intent' },
        { id: '5', time: this.formatTime(Date.now() - 1000), message: 'Simulation command executed: IDLE', category: 'command' }
      ],
      eStopLatched: false
    };

    this.startLoop();
  }

  private formatTime(timestamp: number): string {
    const d = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  public getState(): DemoState {
    return { ...this.state };
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  public start() {
    if (!this.state.isRunning || this.state.isPaused) {
      this.state.isRunning = true;
      this.state.isPaused = false;
      this.addActivity('Demo simulation resumed', 'system');
      this.notify();
    }
  }

  public pause() {
    this.state.isPaused = true;
    this.addActivity('Demo simulation paused by user', 'system');
    this.notify();
  }

  public reset() {
    this.state.timeElapsed = 0;
    this.state.jointAngles = { ...INITIAL_JOINTS };
    this.state.currentIntent = 'REST';
    this.state.confidence = 96.4;
    this.state.eStopLatched = false;
    this.addActivity('Demo session reset to initial state', 'system');
    this.notify();
  }

  public triggerEmergencyStop() {
    this.state.eStopLatched = true;
    this.addActivity('EMERGENCY STOP ENGAGED: Simulation halted', 'safety');
    this.notify();
  }

  public resetEmergencyStop() {
    this.state.eStopLatched = false;
    this.addActivity('Emergency Stop cleared: Simulation unlocked', 'safety');
    this.notify();
  }

  public setManualJoint(joint: keyof JointAngles, angle: number) {
    if (this.state.eStopLatched) return;
    this.state.jointAngles[joint] = angle;
    this.notify();
  }

  public addActivity(message: string, category: ActivityLog['category'] = 'system') {
    const entry: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: this.formatTime(Date.now()),
      message,
      category
    };
    this.state.activities = [entry, ...this.state.activities.slice(0, 24)];
    this.notify();
  }

  // Generate continuous scientific EEG waveform points
  public getNextWaveformPoint(t: number): number {
    // Neuromorphic signal composition:
    // Base 10.2 Hz alpha sine + 5.5 Hz theta + slight pink noise + 0.5Hz baseline drift
    const alpha = 14 * Math.sin(2 * Math.PI * 10.2 * t);
    const theta = 6 * Math.sin(2 * Math.PI * 5.5 * t + 1.2);
    const drift = 4 * Math.sin(2 * Math.PI * 0.4 * t);
    const noise = (Math.random() - 0.5) * 6;

    // Simulate occasional eye blink peak on Fp1 every ~6-8 seconds
    const blinkCycle = t % 7.0;
    let blinkSpike = 0;
    if (blinkCycle < 0.28) {
      const phase = (blinkCycle / 0.28) * Math.PI;
      blinkSpike = 55 * Math.sin(phase);
    }

    return Math.round((alpha + theta + drift + noise + blinkSpike) * 10) / 10;
  }

  private startLoop() {
    this.timer = window.setInterval(() => {
      if (!this.state.isRunning || this.state.isPaused) return;

      this.state.timeElapsed += 0.1;
      this.waveformSampleIndex++;

      // Every 4.5 seconds, advance the demo intent prediction cycle
      const now = Date.now();
      if (!this.state.eStopLatched && now - this.lastIntentChangeTime > 4500) {
        this.lastIntentChangeTime = now;
        this.stepDemoCycle();
      }

      // Slightly fluctuate brainwaves for natural scientific telemetry
      this.fluctuateBrainwaves();

      this.notify();
    }, 100);
  }

  private stepDemoCycle() {
    // Select next simulated intent
    const currentIndex = this.possibleIntents.indexOf(this.state.currentIntent);
    const nextIntent = this.possibleIntents[(currentIndex + 1) % this.possibleIntents.length];
    
    // Generate realistic high confidence (91.0% to 96.8%)
    const conf = Math.round((91.0 + Math.random() * 5.8) * 10) / 10;

    // Generate alternative probabilities that sum to (100 - conf)
    const remaining = 100 - conf;
    const otherIntents = this.possibleIntents.filter(i => i !== nextIntent);
    const p1 = Math.round((remaining * 0.55) * 10) / 10;
    const p2 = Math.round((remaining * 0.25) * 10) / 10;
    const p3 = Math.round((remaining * 0.12) * 10) / 10;
    const p4 = Math.round((remaining - (p1 + p2 + p3)) * 10) / 10;

    this.state.currentIntent = nextIntent;
    this.state.confidence = conf;
    this.state.alternativePredictions = [
      { intent: otherIntents[0], probability: p1 },
      { intent: otherIntents[1], probability: p2 },
      { intent: otherIntents[2], probability: p3 },
      { intent: otherIntents[3], probability: p4 },
    ];

    this.addActivity(`Intent detected: ${nextIntent}`, 'intent');
    this.addActivity(`Confidence: ${conf}%`, 'intent');

    // Move robot joints based on simulated command
    this.executeSimulatedMotion(nextIntent);
  }

  private executeSimulatedMotion(intent: DemoIntent) {
    if (this.state.eStopLatched) return;

    const j = { ...this.state.jointAngles };
    switch (intent) {
      case 'LEFT':
        j.J1 = Math.max(0, j.J1 - 15);
        this.addActivity('Simulation command executed: ROTATE LEFT (J1: ' + j.J1 + '°)', 'command');
        break;
      case 'RIGHT':
        j.J1 = Math.min(180, j.J1 + 15);
        this.addActivity('Simulation command executed: ROTATE RIGHT (J1: ' + j.J1 + '°)', 'command');
        break;
      case 'GRIP':
        j.J5 = 20; // Closed clamp
        this.addActivity('Simulation command executed: GRIP (J5: CLOSED)', 'command');
        break;
      case 'RELEASE':
        j.J5 = 85; // Open
        this.addActivity('Simulation command executed: RELEASE (J5: OPEN)', 'command');
        break;
      case 'STOP':
        this.addActivity('Simulation command executed: HOLD POSITION', 'command');
        break;
      case 'REST':
      default:
        // Gently return towards home
        j.J2 = 62;
        j.J3 = 78;
        break;
    }
    this.state.jointAngles = j;
  }

  private fluctuateBrainwaves() {
    Object.keys(this.state.brainwaves).forEach(k => {
      const bw = this.state.brainwaves[k];
      const delta = (Math.random() - 0.5) * 0.4;
      bw.value = Math.max(0.5, Math.round((bw.value + delta) * 10) / 10);
      bw.trend = delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'stable';
    });
  }
}

export const demoEngine = new DemoEngine();
