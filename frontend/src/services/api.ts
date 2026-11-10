/**
 * API Service Layer for NEUROARM REST and WebSocket endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Authentication
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/me'),

  // EEG Controls
  getChannels: () => request('/eeg/channels'),
  triggerIntent: (intent: string, duration: number = 2.5) =>
    request('/eeg/trigger-intent', { method: 'POST', body: JSON.stringify({ intent, duration }) }),
  triggerBlink: () => request('/eeg/trigger-blink', { method: 'POST' }),
  getBlinkStatus: () => request('/eeg/blink-status'),
  updateBlinkConfig: (config: any) => request('/eeg/blink-config', { method: 'POST', body: JSON.stringify(config) }),

  // Signals
  getSpectralAnalysis: (channel: string = 'O1') => request(`/signals/spectral-analysis?channel=${channel}`),

  // Intent
  getCurrentIntent: () => request('/intent/current'),
  getIntentHistory: () => request('/intent/history'),

  // Robotics
  getRobotState: () => request('/robot/state'),
  setManualJoints: (joints: Record<string, number>) =>
    request('/robot/joints', { method: 'POST', body: JSON.stringify({ joints }) }),
  setPresetPose: (pose: string) =>
    request('/robot/pose', { method: 'POST', body: JSON.stringify({ pose }) }),
  executeIntent: (intent: string, confidence: number) =>
    request('/robot/execute-intent', { method: 'POST', body: JSON.stringify({ intent, confidence }) }),
  emergencyStop: () => request('/robot/emergency-stop', { method: 'POST' }),
  resetEmergencyStop: () => request('/robot/reset-emergency-stop', { method: 'POST' }),

  // Hardware
  getHardwareStatus: () => request('/hardware/devices'),
  listPorts: () => request('/hardware/ports'),
  connectHardware: (port?: string, baudrate?: number) =>
    request('/hardware/connect', { method: 'POST', body: JSON.stringify({ port, baudrate }) }),
  disconnectHardware: () => request('/hardware/disconnect', { method: 'POST' }),
  calibrateHardware: () => request('/hardware/calibrate', { method: 'POST' }),

  // Sessions
  getSessions: () => request('/sessions/'),
  startRecording: (data: any) => request('/sessions/start', { method: 'POST', body: JSON.stringify(data) }),
  stopRecording: () => request('/sessions/stop', { method: 'POST' }),

  // ML Lab
  getModels: () => request('/models/'),
  trainModel: (model_type: string, samples_per_class: number = 40) =>
    request('/models/train', { method: 'POST', body: JSON.stringify({ model_type, samples_per_class }) }),
  getMetrics: () => request('/models/metrics'),

  // Safety
  getSafetyStatus: () => request('/safety/status'),
  updateSafetyConfig: (config: any) => request('/safety/config', { method: 'POST', body: JSON.stringify(config) }),
  triggerSafetyEStop: () => request('/safety/emergency-stop', { method: 'POST' }),
  resetSafetyEStop: () => request('/safety/reset-emergency-stop', { method: 'POST' }),

  // Command Mappings
  getMappings: () => request('/mappings/'),
  createMapping: (data: any) => request('/mappings/', { method: 'POST', body: JSON.stringify(data) }),
  updateMapping: (id: string, data: any) => request(`/mappings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMapping: (id: string) => request(`/mappings/${id}`, { method: 'DELETE' }),
  resetMappings: () => request('/mappings/reset-defaults', { method: 'POST' }),

  // Analytics
  getAnalytics: () => request('/analytics/summary'),
};
