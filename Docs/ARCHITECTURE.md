# NEUROARM: Architectural & Mathematical Specification

## 1. System Overview & Ethics
NEUROARM is an advanced, research-oriented Human-Computer Interface (HCI) and robotics control platform. The platform operates on the premise of **EEG-based intent recognition** through continuous spectral feature tracking and artifact pattern detection. It explicitly **does not claim to read thoughts or conscious internal monologue**.

```
[ Multichannel EEG (250Hz) ]
           │
           ▼
[ Digital Filtering: 0.5-45Hz Butterworth + 50/60Hz IIR Notch ]
           │
           ├──────────────────────────────┐
           ▼                              ▼
[ Ocular Blink Peak Detector ]    [ Welch PSD & Spectral Band Decomposition ]
  - Prominence threshold            - Delta (0.5 - 4 Hz)
  - Refractory period               - Theta (4 - 8 Hz)
  - Microvolt spike duration        - Alpha (8 - 13 Hz)
                                    - Beta (13 - 30 Hz)
                                    - Gamma (30 - 45 Hz)
                                          │
                                          ▼
                                [ Feature Vector Construction ]
                                  - Relative Band Powers (5 x 8)
                                  - Spectral Entropy
                                  - Hjorth Parameters (Activity, Mobility, Complexity)
                                          │
                                          ▼
                                [ ML Intent Classifier (RF / SVM / 1D-CNN) ]
                                  - Outputs: Softmax probabilities + Confidence
                                          │
                                          ▼
                                [ DETERMINISTIC SAFETY CONTROLLER ]
                                  ├── Gate 1: Confidence ≥ Threshold (80%)
                                  ├── Gate 2: Emergency Stop Override Latched?
                                  ├── Gate 3: Joint Angle Boundaries Enforced
                                  ├── Gate 4: Angular Slew Velocity Limiter (≤45°/s)
                                  └── Gate 5: Telemetry Heartbeat Watchdog
                                          │
                                          ▼
                        [ Kinematics & Hardware Dispatcher ]
                          ├── Three.js 3D Virtual Manipulator
                          └── ESP32 Microcontroller (PCA9685 12-Bit PWM)
```

---

## 2. Signal Processing & Mathematics

### 2.1 Bandpass & Notch Filter Design
EEG frequencies outside the physiological range ($0.5 - 45\text{ Hz}$) are eliminated using a 4th-order zero-phase digital Butterworth filter. Powerline hum at $50\text{ Hz}$ or $60\text{ Hz}$ is suppressed with a 2nd-order IIR Notch filter with quality factor $Q = 30$:
$$H_{\text{notch}}(z) = \frac{1 - 2\cos(\omega_0)z^{-1} + z^{-2}}{1 - 2r\cos(\omega_0)z^{-1} + r^2 z^{-2}}$$

### 2.2 Spectral Power Decomposition (Welch's Method)
Power Spectral Density $S_{xx}(f)$ is computed by segmenting overlapping Hanning-windowed blocks ($N=256$, $50\%$ overlap):
$$P_{\text{band}} = \int_{f_{\text{low}}}^{f_{\text{high}}} S_{xx}(f) \, df$$
$$\text{Relative Power } (\%) = \frac{P_{\text{band}}}{\sum P} \times 100$$

### 2.3 Hjorth Parameters
Three quantitative descriptors of signal dynamic complexity are computed:
1. **Activity** (Variance of amplitude):
   $$\text{Activity} = \sigma_x^2 = \text{Var}(x(t))$$
2. **Mobility** (Mean frequency estimate):
   $$\text{Mobility} = \sqrt{\frac{\text{Var}(x'(t))}{\text{Var}(x(t))}}$$
3. **Complexity** (Frequency bandwidth change):
   $$\text{Complexity} = \frac{\text{Mobility}(x'(t))}{\text{Mobility}(x(t))}$$

---

## 3. Robotics & Kinematic Chain

The arm incorporates 6 degrees of freedom with the following geometric joint limits:
- **J1 (Base Yaw)**: $-170^\circ \le \theta_1 \le +170^\circ$
- **J2 (Shoulder Pitch)**: $-60^\circ \le \theta_2 \le +120^\circ$
- **J3 (Elbow Pitch)**: $-150^\circ \le \theta_3 \le +150^\circ$
- **J4 (Wrist Pitch)**: $-90^\circ \le \theta_4 \le +90^\circ$
- **J5 (Wrist Roll)**: $-180^\circ \le \theta_5 \le +180^\circ$
- **J6 (Gripper)**: $0\% \text{ (Closed)} \le \theta_6 \le 100\% \text{ (Open)}$

---

## 4. Hardware Serialization Protocol
All communication with the ESP32 occurs via newline-delimited JSON payloads over 115,200 baud USB-UART or WebSocket:

### Intent Packet Format
```json
{
  "type": "INTENT_CMD",
  "command": "LEFT",
  "confidence": 0.94,
  "timestamp": 1718012000.12,
  "source": "EEG"
}
```

### Motor Packet Format
```json
{
  "type": "JOINT_MOVE",
  "joint": "J1",
  "angle": 45.0,
  "speed": 30,
  "timestamp": 1718012000.15
}
```
