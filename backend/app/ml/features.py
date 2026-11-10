"""
EEG Feature Extraction Pipeline:
Relative band powers, Spectral Entropy, Hjorth Parameters (Activity, Mobility, Complexity),
and Sensorimotor Rhythms (SMR) ERD/ERS Asymmetry between C3 and C4.
"""
import math
from typing import Dict, List, Any, Tuple
import numpy as np
from scipy import signal
from app.config import settings

BANDS = {
    "Delta": (0.5, 4.0),
    "Theta": (4.0, 8.0),
    "Alpha": (8.0, 13.0),
    "Beta": (13.0, 30.0),
    "Gamma": (30.0, 45.0)
}

CHANNELS = settings.EEG_CHANNELS

def compute_hjorth_parameters(data: np.ndarray) -> Dict[str, float]:
    """Hjorth Activity, Mobility, and Complexity."""
    if len(data) < 4:
        return {"activity": 1.0, "mobility": 1.0, "complexity": 1.0}
    
    # 1. Activity = variance
    activity = float(np.var(data))
    
    # 2. Mobility = sqrt(var(d1) / var(d0))
    d1 = np.diff(data)
    var_d1 = np.var(d1)
    mobility = math.sqrt(var_d1 / max(1e-9, activity))
    
    # 3. Complexity = mobility(d1) / mobility(d0)
    d2 = np.diff(d1)
    var_d2 = np.var(d2)
    mob_d1 = math.sqrt(var_d2 / max(1e-9, var_d1))
    complexity = mob_d1 / max(1e-9, mobility)
    
    return {
        "activity": round(activity, 3),
        "mobility": round(mobility, 3),
        "complexity": round(complexity, 3)
    }

def compute_spectral_entropy(psd: np.ndarray) -> float:
    """Normalized Shannon spectral entropy."""
    total_power = np.sum(psd)
    if total_power <= 0:
        return 0.0
    prob = psd / total_power
    prob = prob[prob > 0]
    entropy = -np.sum(prob * np.log2(prob))
    norm_entropy = entropy / np.log2(len(psd)) if len(psd) > 1 else 0.0
    return round(float(norm_entropy), 3)

def get_feature_names(channels: List[str] = None) -> List[str]:
    """Return descriptive names for all extracted features."""
    channels = channels or CHANNELS
    names = []
    for ch in channels:
        for b in BANDS.keys():
            names.append(f"{ch}_{b}_RelPower")
        names.append(f"{ch}_ThetaBeta_Ratio")
        names.append(f"{ch}_AlphaBeta_Ratio")
        names.append(f"{ch}_Hjorth_Activity")
        names.append(f"{ch}_Hjorth_Mobility")
        names.append(f"{ch}_Hjorth_Complexity")
        names.append(f"{ch}_Spectral_Entropy")
    names.extend(["SMR_C3_C4_Asymmetry", "SMR_C3_Beta_ERD", "SMR_C4_Beta_ERD"])
    return names

def extract_eeg_features(multichannel_data: Dict[str, Any], fs: int = settings.SAMPLING_RATE_HZ) -> np.ndarray:
    """
    Extract a dense 1D feature vector from multichannel signals:
    - Relative band powers for each channel (5 bands * 8 channels = 40)
    - Channel ratios: Theta/Beta, Alpha/Beta (2 * 8 = 16)
    - Hjorth parameters (3 * 8 = 24)
    - Spectral entropy (1 * 8 = 8)
    - SMR asymmetry index & C3/C4 ERD powers (3 features)
    Total dimensions: 91 features
    """
    feature_list = []
    channel_powers: Dict[str, Dict[str, float]] = {}
    
    for ch in CHANNELS:
        data = multichannel_data.get(ch, [])
        arr = np.array(data)
        if len(arr) < 32:
            feature_list.extend([0.0] * 11)
            channel_powers[ch] = {b: 0.2 for b in BANDS}
            continue
            
        # Welch PSD
        nperseg = min(len(arr), 128)
        freqs, psd = signal.welch(arr, fs, nperseg=nperseg)
        freq_res = freqs[1] - freqs[0]
        total_p = np.sum(psd) * freq_res
        
        powers = {}
        for band_name, (low, high) in BANDS.items():
            idx = np.logical_and(freqs >= low, freqs <= high)
            p = float(np.sum(psd[idx]) * freq_res)
            powers[band_name] = p / max(1e-6, total_p)
            feature_list.append(powers[band_name])
        channel_powers[ch] = powers
            
        # Ratios
        theta_beta = powers["Theta"] / max(1e-4, powers["Beta"])
        alpha_beta = powers["Alpha"] / max(1e-4, powers["Beta"])
        feature_list.append(min(10.0, theta_beta))
        feature_list.append(min(10.0, alpha_beta))
        
        # Hjorth
        hjorth = compute_hjorth_parameters(arr)
        feature_list.append(min(500.0, hjorth["activity"]))
        feature_list.append(min(10.0, hjorth["mobility"]))
        feature_list.append(min(10.0, hjorth["complexity"]))
        
        # Entropy
        feature_list.append(compute_spectral_entropy(psd))

    # Sensorimotor Asymmetry & ERD/ERS
    c3_beta = channel_powers.get("C3", {}).get("Beta", 0.2)
    c4_beta = channel_powers.get("C4", {}).get("Beta", 0.2)
    smr_asymmetry = (c3_beta - c4_beta) / max(1e-5, (c3_beta + c4_beta))
    
    feature_list.append(float(np.clip(smr_asymmetry, -1.0, 1.0)))
    feature_list.append(float(c3_beta))
    feature_list.append(float(c4_beta))
        
    return np.array(feature_list, dtype=np.float32)
