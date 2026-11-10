"""
Feature Engineering Pipeline for EEG Biopotentials:
Extracts relative spectral band powers, Hjorth parameters, spectral entropy,
and sensorimotor rhythm (SMR) C3/C4 asymmetry metrics.
"""
from typing import Dict, List, Any
import numpy as np
from scipy.signal import welch
from .config import CHANNELS, CANONICAL_BANDS, default_config

def compute_bandpower(signal: np.ndarray, fs: int, band: tuple) -> float:
    """Computes bandpower in specified frequency range using Welch's PSD."""
    if len(signal) < 16:
        return 0.0
    nperseg = min(len(signal), 128)
    freqs, psd = welch(signal, fs=fs, nperseg=nperseg)
    idx_band = np.logical_and(freqs >= band[0], freqs <= band[1])
    band_power = float(np.trapezoid(psd[idx_band], freqs[idx_band])) if np.any(idx_band) else 0.0
    return max(0.0, band_power)

def compute_spectral_entropy(signal: np.ndarray, fs: int) -> float:
    """Computes normalized Shannon spectral entropy of power spectrum."""
    if len(signal) < 16:
        return 0.5
    nperseg = min(len(signal), 128)
    _, psd = welch(signal, fs=fs, nperseg=nperseg)
    total_power = np.sum(psd)
    if total_power <= 0:
        return 0.0
    norm_psd = psd / total_power
    norm_psd = norm_psd[norm_psd > 0]
    entropy = -np.sum(norm_psd * np.log2(norm_psd))
    max_entropy = np.log2(len(psd))
    return float(entropy / max_entropy) if max_entropy > 0 else 0.0

def compute_hjorth_parameters(signal: np.ndarray) -> tuple:
    """
    Computes Hjorth parameters:
    - Activity: Signal variance (amplitude power)
    - Mobility: Estimate of mean frequency
    - Complexity: Estimate of bandwidth change
    """
    if len(signal) < 4:
        return 0.0, 0.0, 0.0

    var_0 = np.var(signal)
    if var_0 <= 1e-9:
        return 0.0, 0.0, 0.0

    d1 = np.diff(signal)
    var_1 = np.var(d1)
    if var_1 <= 1e-9:
        return float(var_0), 0.0, 0.0

    d2 = np.diff(d1)
    var_2 = np.var(d2)

    activity = float(var_0)
    mobility = float(np.sqrt(var_1 / var_0))
    complexity = float(np.sqrt(var_2 / var_1) / mobility) if mobility > 0 else 0.0

    return activity, mobility, complexity

def get_feature_names() -> List[str]:
    """Returns ordered list of all feature names in feature vector."""
    names = []
    # 1. Band powers (8 channels * 5 bands = 40)
    for ch in CHANNELS:
        for band_name in CANONICAL_BANDS.keys():
            names.append(f"{ch}_{band_name}_RelPower")

    # 2. Hjorth parameters (8 channels * 3 = 24)
    for ch in CHANNELS:
        names.append(f"{ch}_Hjorth_Activity")
        names.append(f"{ch}_Hjorth_Mobility")
        names.append(f"{ch}_Hjorth_Complexity")

    # 3. Spectral entropy (8 channels = 8)
    for ch in CHANNELS:
        names.append(f"{ch}_Spectral_Entropy")

    # 4. Neuromorphic differential indices (3)
    names.append("SMR_C3_C4_Asymmetry")
    names.append("Frontal_Theta_Beta_Ratio")
    names.append("Occipital_Alpha_Beta_Ratio")

    return names

def extract_features(signals: Dict[str, List[float]], fs: int = default_config.sampling_rate_hz) -> np.ndarray:
    """
    Extracts complete 75-dimensional feature vector from multichannel signals dictionary.
    """
    feature_vector = []
    band_powers = {ch: {} for ch in CHANNELS}

    # 1. Band Powers
    for ch in CHANNELS:
        sig = np.array(signals.get(ch, [0.0]), dtype=np.float64)
        total_p = 0.0
        ch_powers = {}
        for b_name, b_range in CANONICAL_BANDS.items():
            p = compute_bandpower(sig, fs, b_range)
            ch_powers[b_name] = p
            total_p += p

        for b_name in CANONICAL_BANDS.keys():
            rel_power = (ch_powers[b_name] / total_p) if total_p > 0 else 0.2
            band_powers[ch][b_name] = rel_power
            feature_vector.append(rel_power)

    # 2. Hjorth parameters
    for ch in CHANNELS:
        sig = np.array(signals.get(ch, [0.0]), dtype=np.float64)
        act, mob, comp = compute_hjorth_parameters(sig)
        feature_vector.extend([act, mob, comp])

    # 3. Spectral entropy
    for ch in CHANNELS:
        sig = np.array(signals.get(ch, [0.0]), dtype=np.float64)
        feature_vector.append(compute_spectral_entropy(sig, fs))

    # 4. Neuromorphic Ratios & SMR Asymmetry
    c3_beta = band_powers.get("C3", {}).get("Beta", 0.2)
    c4_beta = band_powers.get("C4", {}).get("Beta", 0.2)
    beta_sum = c3_beta + c4_beta
    smr_asymmetry = float((c3_beta - c4_beta) / beta_sum) if beta_sum > 0 else 0.0
    feature_vector.append(smr_asymmetry)

    fp1_theta = band_powers.get("Fp1", {}).get("Theta", 0.2)
    fp1_beta = band_powers.get("Fp1", {}).get("Beta", 0.2)
    tbr = float(fp1_theta / fp1_beta) if fp1_beta > 0 else 1.0
    feature_vector.append(tbr)

    o1_alpha = band_powers.get("O1", {}).get("Alpha", 0.2)
    o1_beta = band_powers.get("O1", {}).get("Beta", 0.2)
    abr = float(o1_alpha / o1_beta) if o1_beta > 0 else 1.0
    feature_vector.append(abr)

    return np.array(feature_vector, dtype=np.float32)
