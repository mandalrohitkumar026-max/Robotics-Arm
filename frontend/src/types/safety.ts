export interface SafetyLog {
  timestamp: number;
  level: "INFO" | "WARNING" | "CRITICAL";
  event: string;
  reason?: string;
  details?: string;
}

export interface SubsystemStatus {
  eeg: string;
  ai_intent: string;
  esp32_bridge: string;
  arm_kinematics: string;
}

export interface SafetyStatus {
  emergency_stop_latched: boolean;
  confidence_threshold: number;
  max_angular_velocity: number;
  command_timeout_ms: number;
  subsystems: SubsystemStatus;
  recent_logs: SafetyLog[];
}
