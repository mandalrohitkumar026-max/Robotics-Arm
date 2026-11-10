export interface BandPower {
  power: number;
  percentage: number;
}

export interface BandPowerMap {
  Delta: BandPower;
  Theta: BandPower;
  Alpha: BandPower;
  Beta: BandPower;
  Gamma: BandPower;
}

export interface SignalQuality {
  quality_score: number;
  snr_db: number;
  std_dev?: number;
}

export interface BlinkInfo {
  blink_detected: boolean;
  total_blinks: number;
  blink_rate_bpm: number;
  last_blink_timestamp: number;
  last_blink_duration_ms: number;
  threshold_uv: number;
  cooldown_ms: number;
}

export interface IntentPrediction {
  intent: string;
  confidence: number;
  probabilities: Record<string, number>;
  model_type: string;
  is_safe?: boolean;
  safety_message?: string;
}

export interface EEGFramePacket {
  type: string;
  timestamp: number;
  timestamps: number[];
  raw_signals: Record<string, number[]>;
  filtered_signals: Record<string, number[]>;
  blink: BlinkInfo;
  bands: BandPowerMap;
  quality: SignalQuality;
  intent: IntentPrediction;
}
