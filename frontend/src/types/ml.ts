export interface MLMetrics {
  model_type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  classes: string[];
  confusion_matrix: number[][];
  sample_count: number;
}

export interface EEGSession {
  id?: string;
  session_id: string;
  user_id: string;
  label: string;
  duration_seconds: number;
  samples_count: number;
  signal_quality: string;
  created_at: string;
}

export interface CommandMapping {
  id: string;
  trigger: string;
  command: string;
  description?: string;
  enabled: boolean;
}
