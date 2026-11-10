import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { eegWebSocketClient } from "../services/eegWebSocket";
import type { ConnectionStatus, EEGFramePacket } from "../services/eegWebSocket";

export interface BandPower {
  power: number;
  percentage: number;
}

export interface SpectralData {
  frequencies: number[];
  psd: number[];
  dominant_freq: number;
  total_power: number;
  spectral_entropy: number;
  theta_beta_ratio: number;
  alpha_beta_ratio: number;
}

export interface BlinkStatus {
  is_blinking: boolean;
  total_blinks: number;
  blink_rate_bpm: number;
  last_blink_duration_ms: number;
  threshold_uv: number;
  cooldown_ms: number;
}

export interface EEGQuality {
  quality_score: number;
  snr_db: number;
  std_dev: number;
}

export interface EEGContextType {
  connectionStatus: ConnectionStatus;
  mode: "live" | "demo";
  setMode: (mode: "live" | "demo") => void;
  channels: string[];
  selectedChannel: string;
  setSelectedChannel: (ch: string) => void;
  filterMode: "raw" | "filtered";
  setFilterMode: (mode: "raw" | "filtered") => void;
  notchFreq: 50 | 60;
  setNotchFreq: (freq: 50 | 60) => void;
  voltageScale: number;
  setVoltageScale: (scale: number) => void;
  timeWindowSec: number;
  setTimeWindowSec: (sec: number) => void;
  
  // Waveform buffer getters
  getRawBuffer: (ch: string) => number[];
  getFilteredBuffer: (ch: string) => number[];
  
  // Real-time telemetry
  bands: Record<string, BandPower>;
  spectral: SpectralData;
  blink: BlinkStatus;
  quality: EEGQuality;
  channelQualities: Record<string, number>;
  latestPacket: EEGFramePacket | null;
  
  // Actions
  triggerBlink: () => Promise<void>;
  triggerIntent: (intent: string) => Promise<void>;
  updateFilterConfig: (lowcut: number, highcut: number, notch: number) => Promise<void>;
}

const EEGContext = createContext<EEGContextType | undefined>(undefined);

const CHANNELS = ["Fp1", "Fp2", "C3", "C4", "P3", "P4", "O1", "O2"];
const MAX_BUFFER_SIZE = 2500; // 10 seconds @ 250Hz

export const EEGProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [filterMode, setFilterMode] = useState<"raw" | "filtered">("filtered");
  const [notchFreq, setNotchFreqState] = useState<50 | 60>(50);
  const [voltageScale, setVoltageScale] = useState<number>(50); // +/- 50uV
  const [timeWindowSec, setTimeWindowSec] = useState<number>(5); // 5 seconds
  const [latestPacket, setLatestPacket] = useState<EEGFramePacket | null>(null);

  // Circular buffers for raw & filtered signals
  const rawBuffers = useRef<Record<string, number[]>>({
    Fp1: [], Fp2: [], C3: [], C4: [], P3: [], P4: [], O1: [], O2: []
  });
  const filteredBuffers = useRef<Record<string, number[]>>({
    Fp1: [], Fp2: [], C3: [], C4: [], P3: [], P4: [], O1: [], O2: []
  });

  // Telemetry states
  const [bands, setBands] = useState<Record<string, BandPower>>({
    Delta: { power: 12.4, percentage: 28.5 },
    Theta: { power: 6.8, percentage: 15.6 },
    Alpha: { power: 14.2, percentage: 32.6 },
    Beta: { power: 7.5, percentage: 17.2 },
    Gamma: { power: 2.7, percentage: 6.1 },
  });

  const [spectral, setSpectral] = useState<SpectralData>({
    frequencies: [1, 2, 4, 8, 10, 12, 16, 20, 25, 30, 40],
    psd: [0.4, 0.8, 0.6, 1.2, 1.8, 1.3, 0.7, 0.4, 0.3, 0.2, 0.1],
    dominant_freq: 10.2,
    total_power: 43.6,
    spectral_entropy: 0.842,
    theta_beta_ratio: 1.15,
    alpha_beta_ratio: 1.89,
  });

  const [blink, setBlink] = useState<BlinkStatus>({
    is_blinking: false,
    total_blinks: 0,
    blink_rate_bpm: 14,
    last_blink_duration_ms: 240,
    threshold_uv: 75.0,
    cooldown_ms: 350.0,
  });

  const [quality, setQuality] = useState<EEGQuality>({
    quality_score: 95.0,
    snr_db: 18.5,
    std_dev: 12.4,
  });

  const [channelQualities, setChannelQualities] = useState<Record<string, number>>({
    Fp1: 96, Fp2: 95, C3: 98, C4: 97, P3: 94, P4: 95, O1: 99, O2: 98,
  });

  // Initialize and connect WebSocket
  useEffect(() => {
    eegWebSocketClient.connect();
    const unsubStatus = eegWebSocketClient.onStatusChange((status) => {
      setConnectionStatus(status);
      if (status === "connected") {
        setMode("live");
      }
    });

    const unsubFrame = eegWebSocketClient.onFrame((packet) => {
      setLatestPacket(packet);

      // Append samples to circular buffers
      CHANNELS.forEach((ch) => {
        if (packet.raw_signals[ch]) {
          rawBuffers.current[ch].push(...packet.raw_signals[ch]);
          if (rawBuffers.current[ch].length > MAX_BUFFER_SIZE) {
            rawBuffers.current[ch].splice(0, rawBuffers.current[ch].length - MAX_BUFFER_SIZE);
          }
        }
        if (packet.filtered_signals[ch]) {
          filteredBuffers.current[ch].push(...packet.filtered_signals[ch]);
          if (filteredBuffers.current[ch].length > MAX_BUFFER_SIZE) {
            filteredBuffers.current[ch].splice(0, filteredBuffers.current[ch].length - MAX_BUFFER_SIZE);
          }
        }
      });

      // Update telemetry
      if (packet.bands) setBands(packet.bands);
      if (packet.spectral) setSpectral(packet.spectral);
      if (packet.blink) {
        setBlink({
          is_blinking: packet.blink.blink_detected,
          total_blinks: packet.blink.total_blinks,
          blink_rate_bpm: packet.blink.blink_rate_bpm,
          last_blink_duration_ms: packet.blink.last_blink_duration_ms,
          threshold_uv: packet.blink.threshold_uv,
          cooldown_ms: packet.blink.cooldown_ms,
        });
      }
      if (packet.quality) setQuality(packet.quality);
      if (packet.channel_qualities) setChannelQualities(packet.channel_qualities);
    });

    return () => {
      unsubStatus();
      unsubFrame();
    };
  }, []);

  const getRawBuffer = useCallback((ch: string) => {
    return rawBuffers.current[ch] || [];
  }, []);

  const getFilteredBuffer = useCallback((ch: string) => {
    return filteredBuffers.current[ch] || [];
  }, []);

  const setNotchFreq = useCallback(async (freq: 50 | 60) => {
    setNotchFreqState(freq);
    try {
      await fetch("http://localhost:8000/api/eeg/filter-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notch_freq: freq }),
      });
    } catch (e) {
      console.error("Failed to update notch frequency:", e);
    }
  }, []);

  const updateFilterConfig = useCallback(async (lowcut: number, highcut: number, notch: number) => {
    try {
      await fetch("http://localhost:8000/api/eeg/filter-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lowcut, highcut, notch_freq: notch }),
      });
    } catch (e) {
      console.error("Failed to update filter config:", e);
    }
  }, []);

  const triggerBlink = useCallback(async () => {
    try {
      await fetch("http://localhost:8000/api/eeg/trigger-blink", { method: "POST" });
    } catch (e) {
      console.error("Failed to trigger blink:", e);
    }
  }, []);

  const triggerIntent = useCallback(async (intent: string) => {
    try {
      await fetch("http://localhost:8000/api/eeg/trigger-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, duration: 2.5 }),
      });
    } catch (e) {
      console.error("Failed to trigger intent:", e);
    }
  }, []);

  return (
    <EEGContext.Provider
      value={{
        connectionStatus,
        mode,
        setMode,
        channels: CHANNELS,
        selectedChannel,
        setSelectedChannel,
        filterMode,
        setFilterMode,
        notchFreq,
        setNotchFreq,
        voltageScale,
        setVoltageScale,
        timeWindowSec,
        setTimeWindowSec,
        getRawBuffer,
        getFilteredBuffer,
        bands,
        spectral,
        blink,
        quality,
        channelQualities,
        latestPacket,
        triggerBlink,
        triggerIntent,
        updateFilterConfig,
      }}
    >
      {children}
    </EEGContext.Provider>
  );
};

export const useEEG = (): EEGContextType => {
  const context = useContext(EEGContext);
  if (!context) {
    throw new Error("useEEG must be used within an EEGProvider");
  }
  return context;
};
