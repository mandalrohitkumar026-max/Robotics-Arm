"""
Neuroscience Signals & Spectral Analytics Endpoints.
"""
from fastapi import APIRouter
import numpy as np
from app.eeg.simulator import simulator
from app.eeg.spectrum import spectral_analyzer
from app.eeg.filters import eeg_filter

router = APIRouter(prefix="/signals", tags=["Signals"])

@router.get("/spectral-analysis")
def get_spectral_analysis(channel: str = "O1"):
    # Generate representative recent buffer from simulator
    chunk = simulator.generate_sample_chunk(n_samples=256)
    raw = np.array(chunk["signals"].get(channel, chunk["signals"]["O1"]))
    filtered = eeg_filter.apply_filter(raw)
    
    analysis = spectral_analyzer.compute_band_powers(filtered)
    quality = eeg_filter.compute_signal_quality(filtered)
    
    return {
        "channel": channel,
        "spectral": analysis,
        "quality": quality,
        "disclaimer": "EEG frequency bands are signal-processing features. They should not be interpreted as direct measurements of a person's thoughts or emotions."
    }
