import numpy as np
from app.eeg.filters import EEGFilter

def test_butterworth_bandpass():
    flt = EEGFilter(fs=250, lowcut=0.5, highcut=45.0, notch_freq=50.0)
    t = np.linspace(0, 1.0, 250, endpoint=False)
    # 10Hz signal (passband) + 0.1Hz drift (stopband) + 70Hz noise (stopband)
    sig = np.sin(2 * np.pi * 10 * t) + 2.0 * np.sin(2 * np.pi * 0.1 * t) + 2.0 * np.sin(2 * np.pi * 70 * t)
    filtered = flt.apply_filter(sig)
    
    assert len(filtered) == len(sig)
    # The low-frequency drift and high frequency noise should be attenuated
    assert np.std(filtered) < np.std(sig)

def test_signal_quality_metric():
    flt = EEGFilter(fs=250)
    normal_sig = np.random.normal(0, 15, 250)
    metrics = flt.compute_signal_quality(normal_sig)
    assert "quality_score" in metrics
    assert metrics["quality_score"] > 50.0
