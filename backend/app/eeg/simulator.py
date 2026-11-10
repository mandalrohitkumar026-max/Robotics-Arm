"""
Realistic Multichannel EEG Data Simulator with Neuromorphic Dynamics.
Generates 10-20 system signals with 1/f pink noise, rhythmic alpha waves,
motor imagery desynchronization, and ocular blink artifacts.
"""
import time
import math
import random
from typing import Dict, List, Optional
import numpy as np
from app.config import settings

CHANNELS = settings.EEG_CHANNELS
FS = settings.SAMPLING_RATE_HZ

class EEGSimulator:
    def __init__(self, channels: List[str] = CHANNELS, fs: int = FS):
        self.channels = channels
        self.fs = fs
        self.dt = 1.0 / fs
        self.time_counter = 0.0
        
        # State variables for pink noise (IIR 1/f filter states)
        self.b0 = {ch: 0.0 for ch in channels}
        self.b1 = {ch: 0.0 for ch in channels}
        self.b2 = {ch: 0.0 for ch in channels}
        
        # Active transient state for injected events
        self.active_intent: Optional[str] = "REST"
        self.intent_start_time: float = 0.0
        self.intent_duration: float = 2.0
        
        # Blink artifact states
        self.blink_active: bool = False
        self.blink_start_time: float = 0.0
        self.blink_duration: float = 0.28  # ~280 ms
        self.last_blink_time: float = 0.0

    def trigger_intent(self, intent: str, duration: float = 2.5):
        """Manually or programmatically trigger an intent burst."""
        self.active_intent = intent
        self.intent_start_time = self.time_counter
        self.intent_duration = duration

    def trigger_blink(self):
        """Trigger an ocular blink spike on frontopolar channels."""
        self.blink_active = True
        self.blink_start_time = self.time_counter
        self.last_blink_time = self.time_counter

    def _generate_pink_noise_sample(self, ch: str) -> float:
        """Paul Kellet's filter method for 1/f pink noise."""
        white = random.gauss(0.0, 1.0)
        self.b0[ch] = 0.99886 * self.b0[ch] + white * 0.0555179
        self.b1[ch] = 0.99332 * self.b1[ch] + white * 0.0750759
        self.b2[ch] = 0.96900 * self.b2[ch] + white * 0.1538520
        pink = self.b0[ch] + self.b1[ch] + self.b2[ch] + white * 0.5362
        return pink * 6.5  # ~15-25 uV amplitude baseline

    def generate_sample_chunk(self, n_samples: int = 10) -> Dict[str, Any]:
        """Generate a block of synchronized multichannel samples."""
        timestamps = []
        raw_signals = {ch: [] for ch in self.channels}
        
        for _ in range(n_samples):
            t = self.time_counter
            timestamps.append(round(time.time() * 1000, 2))
            
            # Check intent expiration
            if self.active_intent and (t - self.intent_start_time > self.intent_duration):
                self.active_intent = "REST"
            
            # Natural spontaneous blink occurrence (every 4-7 seconds if idle)
            if not self.blink_active and (t - self.last_blink_time > random.uniform(4.5, 7.5)):
                self.trigger_blink()

            # Blink Bell Curve computation
            blink_uv = 0.0
            if self.blink_active:
                elapsed_blink = t - self.blink_start_time
                if elapsed_blink <= self.blink_duration:
                    # Bell-shaped positive frontopolar spike
                    phase = (elapsed_blink / self.blink_duration) * math.pi
                    blink_uv = 160.0 * (math.sin(phase) ** 2)
                else:
                    self.blink_active = False

            # Brain rhythm components
            # Occipital/Parietal Alpha rhythm (10.2 Hz)
            alpha_wave = 12.0 * math.sin(2 * math.pi * 10.2 * t + 0.3)
            # Frontal Theta rhythm (5.5 Hz)
            theta_wave = 7.0 * math.sin(2 * math.pi * 5.5 * t + 1.1)
            # Sensorimotor Mu/Beta rhythm (18.5 Hz)
            beta_wave = 6.0 * math.sin(2 * math.pi * 18.5 * t + 0.7)

            for ch in self.channels:
                val = self._generate_pink_noise_sample(ch)
                
                # Channel specific topology
                if ch in ["O1", "O2"]:
                    # Strong posterior alpha
                    val += alpha_wave * 1.5
                elif ch in ["P3", "P4"]:
                    val += alpha_wave * 0.9 + theta_wave * 0.5
                elif ch in ["Fp1", "Fp2"]:
                    # Frontal theta and prominent blink artifact
                    val += theta_wave * 1.2
                    val += blink_uv * (1.0 if ch == "Fp1" else 0.92)
                elif ch in ["C3", "C4"]:
                    # Sensorimotor cortex: Motor imagery produces ERD (Event-Related Desynchronization)
                    if self.active_intent == "LEFT":
                        # Right motor cortex (C4) desynchronizes, C3 maintains beta
                        val += beta_wave * (0.3 if ch == "C4" else 1.8)
                    elif self.active_intent == "RIGHT":
                        # Left motor cortex (C3) desynchronizes
                        val += beta_wave * (1.8 if ch == "C4" else 0.3)
                    elif self.active_intent in ["FORWARD", "BACKWARD", "GRIP", "RELEASE"]:
                        # Bilateral beta burst / synchronization
                        val += beta_wave * 2.2
                    else:
                        val += beta_wave * 0.8
                
                # 50Hz subtle powerline interference (+- 1.5 uV)
                val += 1.5 * math.sin(2 * math.pi * settings.NOTCH_FREQ_HZ * t)
                raw_signals[ch].append(round(val, 2))

            self.time_counter += self.dt

        return {
            "timestamps": timestamps,
            "signals": raw_signals,
            "active_intent": self.active_intent,
            "blink_active": self.blink_active
        }

simulator = EEGSimulator()
