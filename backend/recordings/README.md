# NEUROARM EEG Recordings Archive

This directory stores real-time and historical multi-channel electroencephalographic (EEG) recordings captured from the NEUROARM Brain-Computer Interface platform.

---

## 🔬 Dataset Specification

| Parameter | Specification |
| :--- | :--- |
| **Electrode Montage** | 10–20 International System (8 Channels) |
| **Channel Layout** | `Fp1`, `Fp2` (Frontopolar / EOG), `C3`, `C4` (Sensorimotor / SMR), `P3`, `P4` (Parietal), `O1`, `O2` (Occipital / Alpha) |
| **Sampling Frequency** | $250\text{ Hz}$ (4.0 ms interval) |
| **Amplitude Scale** | Microvolts ($\mu\text{V}$) |
| **Bandwidth** | $0.5 - 45\text{ Hz}$ Zero-phase Butterworth + $50\text{ Hz}$ Notch filter |
| **Format** | Standard Comma-Separated Values (`.csv`) and JSON Metadata (`.json`) |

---

## 📁 File Structure

```
recordings/
├── manifest.json              # Catalog index of all registered sessions
├── README.md                  # Dataset documentation
├── SES-1718012001.csv         # 8-Channel Motor Imagery: LEFT (C4 ERD desynchronization)
├── SES-1718012001.json        # Companion metadata and electrode impedances
├── SES-1718012944.csv         # 8-Channel Motor Imagery: GRIP (Bilateral beta synchronization)
├── SES-1718012944.json
├── NEURO-2026-001.csv         # Rest baseline with spontaneous frontopolar blinks
├── NEURO-2026-001.json
├── NEURO-2026-002.csv         # Motor Imagery: RIGHT (C3 ERD desynchronization)
├── NEURO-2026-002.json
├── NEURO-2026-003.csv         # Motor Imagery: FORWARD motion intent epoch
├── NEURO-2026-003.json
├── NEURO-2026-004.csv         # 9-Step Motor-Imagery Calibration Run
└── NEURO-2026-004.json
```

---

## 📊 CSV Schema

| Column | Type | Description |
| :--- | :--- | :--- |
| `t` | Float | Epoch Unix millisecond timestamp |
| `t_sec` | Float | Relative elapsed seconds within session |
| `Fp1`, `Fp2` | Float | Frontopolar channels in $\mu\text{V}$ (includes ocular blinks) |
| `C3`, `C4` | Float | Sensorimotor cortex channels in $\mu\text{V}$ (motor imagery ERD/ERS) |
| `P3`, `P4` | Float | Parietal channels in $\mu\text{V}$ |
| `O1`, `O2` | Float | Occipital channels in $\mu\text{V}$ (posterior alpha rhythms) |
| `event` | String | Active mental task marker (`REST`, `LEFT`, `RIGHT`, `GRIP`, `RELEASE`, `STOP`) |

---

## ⚡ Loading with Python (Pandas)

```python
import pandas as pd

df = pd.read_csv("SES-1718012001.csv")
print(df.head())
print("Active Channels:", ["Fp1", "Fp2", "C3", "C4", "P3", "P4", "O1", "O2"])
print("Mean C3 Amplitude:", df["C3"].mean(), "uV")
```
