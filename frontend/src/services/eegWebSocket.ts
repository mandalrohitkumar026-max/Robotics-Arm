/**
 * NEUROARM - Live EEG WebSocket Client
 * Connects to ws://localhost:8000/ws/eeg
 * Handles auto-reconnect, message parsing, latency telemetry, and listeners.
 */

export interface EEGFramePacket {
  type: string;
  timestamp: number;
  timestamps: number[];
  raw_signals: Record<string, number[]>;
  filtered_signals: Record<string, number[]>;
  blink: {
    blink_detected: boolean;
    total_blinks: number;
    blink_rate_bpm: number;
    last_blink_timestamp: number;
    last_blink_duration_ms: number;
    threshold_uv: number;
    cooldown_ms: number;
  };
  bands: Record<string, { power: number; percentage: number }>;
  spectral: {
    frequencies: number[];
    psd: number[];
    dominant_freq: number;
    total_power: number;
    spectral_entropy: number;
    theta_beta_ratio: number;
    alpha_beta_ratio: number;
  };
  quality: {
    quality_score: number;
    snr_db: number;
    std_dev: number;
  };
  channel_qualities: Record<string, number>;
  intent: {
    intent: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

type FrameListener = (packet: EEGFramePacket) => void;
type StatusListener = (status: ConnectionStatus) => void;

class EEGWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private status: ConnectionStatus = "disconnected";
  private frameListeners: Set<FrameListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: number | null = null;
  private reconnectIntervalMs: number = 2500;
  private shouldReconnect: boolean = true;

  constructor(url: string = "ws://localhost:8000/ws/eeg") {
    this.url = url;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;
    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.setStatus("connected");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const packet: EEGFramePacket = JSON.parse(event.data);
          this.frameListeners.forEach((listener) => listener(packet));
        } catch (e) {
          console.error("Failed to parse EEG WebSocket packet:", e);
        }
      };

      this.ws.onclose = () => {
        this.setStatus("disconnected");
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.setStatus("error");
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch {
      this.setStatus("error");
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) {
        this.connect();
      }
    }, this.reconnectIntervalMs);
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public onFrame(listener: FrameListener): () => void {
    this.frameListeners.add(listener);
    return () => {
      this.frameListeners.delete(listener);
    };
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }
}

export const eegWebSocketClient = new EEGWebSocketClient();
