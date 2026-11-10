# NEUROARM ESP32 & PCA9685 Hardware Controller

This directory contains the production-grade embedded C++ firmware for the physical 4-6 DOF robotic arm.

## Hardware Components Required
1. **ESP32 Development Board** (ESP-WROOM-32 or NodeMCU-32S)
2. **Adafruit PCA9685** 16-Channel 12-Bit I2C PWM Driver Board
3. **5V 5A External Power Supply** (Dedicated for servo motor rails)
4. **4 to 6 Servo Motors** (MG996R metal-gear servos for base/shoulder/elbow, SG90/MG90S for wrist/gripper)
5. **Logic Level Connection** (ESP32 3.3V logic is I2C compatible with PCA9685 VCC @ 3.3V-5V)

## Wiring Diagram

| ESP32 Pin | PCA9685 Pin | Function | Notes |
|-----------|-------------|----------|-------|
| 3V3       | VCC         | Logic Power | Powers PCA9685 chip only |
| GND       | GND         | Ground   | Common GND with servo power supply |
| GPIO 21   | SDA         | I2C Data | Default ESP32 I2C SDA |
| GPIO 22   | SCL         | I2C Clock| Default ESP32 I2C SCL |

### Servo Power Rail (V+ on PCA9685)
- **External 5V+**: Connect to screw terminal **V+** on PCA9685.
- **External GND**: Connect to screw terminal **GND** on PCA9685 and bridge to ESP32 GND.
> [!CAUTION]
> **NEVER power servo motors directly from ESP32 5V or 3.3V pins.** Motor back-EMF and stall currents (>2A) will cause brownouts and potentially damage the microcontroller.

### PCA9685 Servo Channels
- **Channel 0**: Joint 1 - Base Yaw (-170° to +170°)
- **Channel 1**: Joint 2 - Shoulder Pitch (-60° to +120°)
- **Channel 2**: Joint 3 - Elbow Pitch (-150° to +150°)
- **Channel 3**: Joint 4 - Wrist Pitch (-90° to +90°)
- **Channel 4**: Joint 5 - Wrist Roll (-180° to +180°)
- **Channel 5**: Joint 6 - Gripper (0% closed to 100% open)

## Compilation & Uploading

### Option A: Using PlatformIO
```bash
cd esp32
pio run -t upload
pio device monitor -b 115200
```

### Option B: Using Arduino IDE
1. Install ESP32 board support via Boards Manager (`https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`).
2. Install libraries:
   - `Adafruit PWM Servo Driver Library`
   - `ArduinoJson` (v6.x)
3. Open `esp32/src/main.cpp` as an `.ino` sketch and flash to your COM port.
