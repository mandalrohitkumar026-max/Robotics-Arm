# Physical Wiring & Hardware Schematics: ESP32 + PCA9685

This schematic outlines connecting the **ESP32 microcontroller**, the **Adafruit PCA9685 16-channel 12-bit PWM servo driver**, and **4 to 6 servo motors**.

## 1. Pin Interconnections

```
+--------------------+                       +---------------------------+
|    ESP32 Board     |                       |   PCA9685 16-Ch PWM Board |
|                    |                       |                           |
|       3V3  ────────┼───────────────────────┼──> VCC (Chip Logic Power) |
|       GND  ────────┼───────────────┬───────┼──> GND (Signal Ground)    |
|   GPIO 21 (SDA) ───┼───────────────┼───────┼──> SDA (I2C Data)         |
|   GPIO 22 (SCL) ───┼───────────────┼───────┼──> SCL (I2C Clock)        |
+--------------------+               │       |                           |
                                     │       |    [External Power Block] |
                                     │       |    V+  <─── +5V (5A PSU)  |
+--------------------+               │       |    GND <─── GND (5A PSU)  |
| 5V 5A Power Supply |               │       +---------------------------+
|                    |               │                     │
|   +5V Terminal ────┼───────────────┼─────────────────────┘ (Motor Rail)
|   GND Terminal ────┼───────────────┘
+--------------------+
```

> [!CAUTION]
> Common Ground: You MUST connect the GND from your external 5V power supply to both the PCA9685 screw terminal GND and the ESP32 GND pin to ensure a shared electrical reference.

---

## 2. Servo Channel Map

| Channel | Joint Name | Physical Function | Default Home Pulse | Motion Range |
|---|---|---|---|---|
| **CH 0** | **J1 Base** | Turntable Yaw | 1500 µs (90°) | 600 - 2400 µs (-170° to +170°) |
| **CH 1** | **J2 Shoulder** | Main Arm Pitch | 1500 µs (90°) | 750 - 2250 µs (-60° to +120°) |
| **CH 2** | **J3 Elbow** | Forearm Pitch | 1500 µs (90°) | 650 - 2350 µs (-150° to +150°) |
| **CH 3** | **J4 Wrist Pitch**| End Gimbal Pitch | 1500 µs (90°) | 800 - 2200 µs (-90° to +90°) |
| **CH 4** | **J5 Wrist Roll** | Flange Continuous Roll | 1500 µs (90°) | 600 - 2400 µs (-180° to +180°) |
| **CH 5** | **J6 Gripper** | Dual Claw Clamp | 1200 µs (50%) | 900 µs (Clamped) - 2100 µs (Open) |

---

## 3. Power Sizing & Decoupling
- 6x MG996R standard metal gear servos can draw up to **1.5A to 2.5A each at stall**.
- Recommended power supply: **5V 6A to 10A regulated switching DC supply**.
- Add a $1000\mu\text{F}$ 16V electrolytic capacitor directly across the PCA9685 capacitor solder pads to absorb high inductive flyback currents during abrupt joint decelerations.
