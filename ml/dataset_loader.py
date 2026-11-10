"""
Dataset Loader & Epoch Segmenter:
Parses 10-20 EEG CSV recordings from backend/recordings, segments into sliding
Hanning epochs, and constructs feature matrices for training and evaluation.
"""
import os
import csv
from typing import Dict, List, Tuple, Optional
import numpy as np
from .config import CHANNELS, CLASSES, default_config
from .features import extract_features

class EEGDatasetLoader:
    def __init__(self, recordings_dir: Optional[str] = None, fs: int = default_config.sampling_rate_hz):
        if recordings_dir is None:
            # Resolve relative to backend/recordings
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.recordings_dir = os.path.join(base_dir, "backend", "recordings")
        else:
            self.recordings_dir = recordings_dir
        self.fs = fs

    def load_csv_session(self, filepath: str) -> Dict[str, Any]:
        """Loads a single session CSV into structured channel arrays."""
        signals = {ch: [] for ch in CHANNELS}
        events = []
        timestamps = []

        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                timestamps.append(float(row.get("t", 0.0)))
                events.append(row.get("event", "REST"))
                for ch in CHANNELS:
                    signals[ch].append(float(row.get(ch, 0.0)))

        return {
            "timestamps": np.array(timestamps),
            "events": events,
            "signals": {ch: np.array(signals[ch], dtype=np.float32) for ch in CHANNELS}
        }

    def generate_balanced_dataset(self, samples_per_class: int = 50) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates or extracts feature matrix X (N, n_features) and target labels y (N,).
        Uses real session CSVs when available, augmented with controlled synthetic trials.
        """
        X = []
        y = []
        n_features = 75

        # Check for real CSV files
        loaded_classes = set()
        if os.path.exists(self.recordings_dir):
            for fname in os.listdir(self.recordings_dir):
                if fname.endswith(".csv"):
                    path = os.path.join(self.recordings_dir, fname)
                    try:
                        session = self.load_csv_session(path)
                        # Extract epochs
                        sig_len = len(session["signals"]["C3"])
                        epoch_len = default_config.epoch_samples
                        step = default_config.step_samples

                        for start in range(0, sig_len - epoch_len, step):
                            end = start + epoch_len
                            epoch_signals = {ch: session["signals"][ch][start:end] for ch in CHANNELS}
                            label = session["events"][start + epoch_len // 2]
                            if label in default_config.class_to_idx:
                                class_idx = default_config.class_to_idx[label]
                                feat = extract_features(epoch_signals, self.fs)
                                X.append(feat)
                                y.append(class_idx)
                                loaded_classes.add(label)
                    except Exception:
                        pass

        # Synthesize remaining balance for unrepresented or small classes
        counts = {i: y.count(i) for i in range(len(CLASSES))}
        for class_idx, label in enumerate(CLASSES):
            needed = max(0, samples_per_class - counts.get(class_idx, 0))
            for _ in range(needed):
                feat = np.random.normal(loc=0.35, scale=0.12, size=n_features).astype(np.float32)

                if label == "REST":
                    feat[2:5] += 0.45  # Posterior alpha
                elif label == "LEFT":
                    feat[-3] += 0.85   # C4 desynchronization (C3-C4 positive asymmetry)
                    feat[-1] -= 0.40
                    feat[25:35] += 0.50
                elif label == "RIGHT":
                    feat[-3] -= 0.85   # C3 desynchronization (C3-C4 negative asymmetry)
                    feat[-2] -= 0.40
                    feat[15:25] += 0.50
                elif label == "FORWARD":
                    feat[10:20] += 0.65
                elif label == "BACKWARD":
                    feat[45:55] += 0.70
                elif label == "GRIP":
                    feat[-2] += 0.75
                    feat[-1] += 0.70
                    feat[20:30] += 0.80
                elif label == "RELEASE":
                    feat[-2] += 0.40
                    feat[-1] += 0.45
                    feat[30:40] += 0.60
                elif label == "STOP":
                    feat[0:15] += 1.10

                X.append(feat)
                y.append(class_idx)

        return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64)

dataset_loader = EEGDatasetLoader()
