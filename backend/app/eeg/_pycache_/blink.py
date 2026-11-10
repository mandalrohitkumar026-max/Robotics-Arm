"""
Eye Blink Event Detection using Prominence and Duration Thresholding on Frontopolar EEG.
"""
import time
from typing import Dict, Any, List
import numpy as np
from scipy import signal
from app.config import settings

class BlinkDetector:
    def __init__(self, fs: int = settings.SAMPLING_RATE_HZ):
        self.fs = fs
        self.threshold_uv: float = 75.0          # Voltage threshold in uV
        self.min_duration_ms: float = 120.0      # Min blink spike duration
        self.max_duration_ms: float = 500.0      # Max blink spike duration
        self.cooldown_ms: float = 350.0          # Refractory period
        
        self.total_blinks: int = 0
        self.blink_timestamps: List[float] = []  # History of blink events
        self.last_blink_time: float = 0.0
        self.last_blink_duration_ms: float = 240.0

    def update_settings(self, threshold: float = None, min_dur: float = None, max_dur: float = None, cooldown: float = None):
        if threshold is not None:
            self.threshold_uv = threshold
        if min_dur is not None:
            self.min_duration_ms = min_dur
        if max_dur is not None:
            self.max_duration_ms = max_dur
        if cooldown is not None:
            self.cooldown_ms = cooldown

    def process_buffer(self, fp_data: np.ndarray) -> Dict[str, Any]:
        """
        Process buffer of Fp1/Fp2 signal.
        Returns blink detection event, metrics, and rolling statistics.
        """
        now = time.time()
        blink_detected_now = False

        if len(fp_data) >= 30:
            # Lowpass filter frontopolar data to isolate slow EOG blink deflection
            nyq = 0.5 * self.fs
            b, a = signal.butter(2, 10.0 / nyq, btype='low')
            smoothed = signal.filtfilt(b, a, fp_data, padlen=min(10, len(fp_data)-1))
            
            # Find positive peaks
            min_distance = int((self.cooldown_ms / 1000.0) * self.fs)
            peaks, properties = signal.find_peaks(
                smoothed,
                height=self.threshold_uv,
                distance=max(1, min_distance),
                width=[int((self.min_duration_ms / 1000.0) * self.fs), int((self.max_duration_ms / 1000.0) * self.fs)]
            )

            # Check if a peak occurred near the tail of the buffer (recent event)
            recent_window_samples = int(0.25 * self.fs)  # last 250ms
            for p_idx, peak_pos in enumerate(peaks):
                if peak_pos >= len(fp_data) - recent_window_samples:
                    if (now - self.last_blink_time) * 1000.0 >= self.cooldown_ms:
                        blink_detected_now = True
                        self.total_blinks += 1
                        self.last_blink_time = now
                        if "widths" in properties and len(properties["widths"]) > p_idx:
                            self.last_blink_duration_ms = float((properties["widths"][p_idx] / self.fs) * 1000.0)
                        self.blink_timestamps.append(now)
                        break

        # Trim blink timestamps older than 60 seconds
        cutoff = now - 60.0
        self.blink_timestamps = [t for t in self.blink_timestamps if t >= cutoff]
        blink_rate_bpm = len(self.blink_timestamps)  # blinks per minute

        return {
            "blink_detected": blink_detected_now,
            "total_blinks": self.total_blinks,
            "blink_rate_bpm": blink_rate_bpm,
            "last_blink_timestamp": self.last_blink_time,
            "last_blink_duration_ms": round(self.last_blink_duration_ms, 1),
            "threshold_uv": self.threshold_uv,
            "cooldown_ms": self.cooldown_ms
        }

blink_detector = BlinkDetector()
