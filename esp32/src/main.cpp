/**
 * NEUROARM Embedded Firmware
 * Platform: ESP32 (WROOM-32 / NodeMCU-32S)
 * Hardware: Adafruit PCA9685 16-Channel 12-Bit I2C PWM Driver + 6x Servos (MG996R/SG90)
 * 
 * Commands received via USB Serial or WiFi WebSocket:
 *  - {"command": "LEFT", "confidence": 0.94, "timestamp": 1700000000, "source": "EEG"}
 *  - {"joint": "J1", "angle": 45, "speed": 30}
 *  - {"type": "ESTOP"}
 *  - {"type": "HEARTBEAT"}
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <ArduinoJson.h>

// I2C pins for ESP32
#define I2C_SDA 21
#define I2C_SCL 22

// PCA9685 PWM Settings
#define SERVOMIN  120 // ~550 us (0 degrees)
#define SERVOMAX  490 // ~2400 us (180 degrees)
#define USMIN     600
#define USMAX     2400
#define SERVO_FREQ 50 // Analog/Digital servos run at 50 Hz

// LED Status Indicator
#define STATUS_LED 2

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

// Servo Channel Mapping on PCA9685
const int PIN_J1_BASE     = 0;
const int PIN_J2_SHOULDER = 1;
const int PIN_J3_ELBOW    = 2;
const int PIN_J4_WPITCH   = 3;
const int PIN_J5_WROLL    = 4;
const int PIN_J6_GRIPPER  = 5;

// Current and Target Joint Angles
float curJ1 = 90.0, targetJ1 = 90.0;
float curJ2 = 90.0, targetJ2 = 90.0;
float curJ3 = 90.0, targetJ3 = 90.0;
float curJ4 = 90.0, targetJ4 = 90.0;
float curJ5 = 90.0, targetJ5 = 90.0;
float curJ6 = 50.0, targetJ6 = 50.0;

bool eStopActive = false;
unsigned long lastHeartbeat = 0;
const unsigned long WATCHDOG_TIMEOUT_MS = 2000;

// Convert degree (0-180) to 12-bit PCA9685 tick (0-4095)
int angleToPulse(float angle) {
  angle = constrain(angle, 0.0f, 180.0f);
  return map(angle, 0, 180, SERVOMIN, SERVOMAX);
}

void writeServo(int channel, float angle) {
  if (eStopActive) return;
  int pulse = angleToPulse(angle);
  pwm.setPWM(channel, 0, pulse);
}

void triggerEmergencyStop() {
  eStopActive = true;
  digitalWrite(STATUS_LED, LOW);
  // Freeze servos in position
  Serial.println("{\"status\":\"ESTOP_TRIGGERED\",\"message\":\"Hard emergency stop engaged!\"}");
}

void clearEmergencyStop() {
  eStopActive = false;
  digitalWrite(STATUS_LED, HIGH);
  Serial.println("{\"status\":\"ESTOP_CLEARED\",\"message\":\"System resumed.\" }");
}

void processCommandJson(const char* jsonBuffer) {
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, jsonBuffer);
  if (err) return;

  lastHeartbeat = millis();

  // Emergency stop command
  const char* type = doc["type"];
  if (type && strcmp(type, "ESTOP") == 0) {
    triggerEmergencyStop();
    return;
  }
  if (type && strcmp(type, "CLEAR_ESTOP") == 0) {
    clearEmergencyStop();
    return;
  }

  // Joint specific move packet: {"joint":"J1", "angle":45, "speed":30}
  if (doc.containsKey("joint") && doc.containsKey("angle")) {
    const char* j = doc["joint"];
    float angle = doc["angle"];
    
    // Map -170..+170 or -90..+90 to servo standard 0..180
    if (strcmp(j, "J1") == 0) targetJ1 = constrain(angle + 90.0f, 0.0f, 180.0f);
    else if (strcmp(j, "J2") == 0) targetJ2 = constrain(angle + 90.0f, 0.0f, 180.0f);
    else if (strcmp(j, "J3") == 0) targetJ3 = constrain(angle + 90.0f, 0.0f, 180.0f);
    else if (strcmp(j, "J4") == 0) targetJ4 = constrain(angle + 90.0f, 0.0f, 180.0f);
    else if (strcmp(j, "J5") == 0) targetJ5 = constrain(angle + 90.0f, 0.0f, 180.0f);
    else if (strcmp(j, "J6") == 0) targetJ6 = constrain(angle * 1.8f, 0.0f, 180.0f); // 0-100% to 0-180
    return;
  }

  // EEG intent command: {"command":"LEFT", "confidence":0.94}
  if (doc.containsKey("command")) {
    const char* cmd = doc["command"];
    float confidence = doc["confidence"] | 0.0f;

    if (confidence < 0.75f) {
      Serial.println("{\"warning\":\"REJECTED_LOW_CONFIDENCE\"}");
      return;
    }

    if (strcmp(cmd, "STOP") == 0 || strcmp(cmd, "EMERGENCY STOP") == 0) {
      triggerEmergencyStop();
    } else if (strcmp(cmd, "LEFT") == 0 || strcmp(cmd, "ROTATE LEFT") == 0) {
      targetJ1 = constrain(targetJ1 - 8.0f, 10.0f, 170.0f);
    } else if (strcmp(cmd, "RIGHT") == 0 || strcmp(cmd, "ROTATE RIGHT") == 0) {
      targetJ1 = constrain(targetJ1 + 8.0f, 10.0f, 170.0f);
    } else if (strcmp(cmd, "FORWARD") == 0 || strcmp(cmd, "MOVE FORWARD") == 0) {
      targetJ2 = constrain(targetJ2 + 6.0f, 20.0f, 160.0f);
      targetJ3 = constrain(targetJ3 - 4.0f, 20.0f, 160.0f);
    } else if (strcmp(cmd, "BACKWARD") == 0 || strcmp(cmd, "MOVE BACKWARD") == 0) {
      targetJ2 = constrain(targetJ2 - 6.0f, 20.0f, 160.0f);
      targetJ3 = constrain(targetJ3 + 4.0f, 20.0f, 160.0f);
    } else if (strcmp(cmd, "GRIP") == 0 || strcmp(cmd, "CLOSE GRIPPER") == 0) {
      targetJ6 = 20.0f; // Gripper close
    } else if (strcmp(cmd, "RELEASE") == 0 || strcmp(cmd, "OPEN GRIPPER") == 0) {
      targetJ6 = 140.0f; // Gripper open
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, HIGH);

  Wire.begin(I2C_SDA, I2C_SCL);
  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(SERVO_FREQ);

  // Set home positions
  writeServo(PIN_J1_BASE, curJ1);
  writeServo(PIN_J2_SHOULDER, curJ2);
  writeServo(PIN_J3_ELBOW, curJ3);
  writeServo(PIN_J4_WPITCH, curJ4);
  writeServo(PIN_J5_WROLL, curJ5);
  writeServo(PIN_J6_GRIPPER, curJ6);

  lastHeartbeat = millis();
  Serial.println("{\"status\":\"INITIALIZED\",\"firmware\":\"v2.4.0-neuroarm\",\"pca9685\":true}");
}

// Slew rate interpolation loop for smooth motor motion
void updateServosSmoothly() {
  if (eStopActive) return;

  const float step = 1.8f; // Max degrees per 20ms step
  
  if (abs(targetJ1 - curJ1) > 0.5f) { curJ1 += (targetJ1 > curJ1 ? step : -step); writeServo(PIN_J1_BASE, curJ1); }
  if (abs(targetJ2 - curJ2) > 0.5f) { curJ2 += (targetJ2 > curJ2 ? step : -step); writeServo(PIN_J2_SHOULDER, curJ2); }
  if (abs(targetJ3 - curJ3) > 0.5f) { curJ3 += (targetJ3 > curJ3 ? step : -step); writeServo(PIN_J3_ELBOW, curJ3); }
  if (abs(targetJ4 - curJ4) > 0.5f) { curJ4 += (targetJ4 > curJ4 ? step : -step); writeServo(PIN_J4_WPITCH, curJ4); }
  if (abs(targetJ5 - curJ5) > 0.5f) { curJ5 += (targetJ5 > curJ5 ? step : -step); writeServo(PIN_J5_WROLL, curJ5); }
  if (abs(targetJ6 - curJ6) > 0.5f) { curJ6 += (targetJ6 > curJ6 ? step : -step); writeServo(PIN_J6_GRIPPER, curJ6); }
}

void loop() {
  // Read Serial Stream
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input.length() > 0) {
      processCommandJson(input.c_str());
    }
  }

  // Safety Watchdog Check
  if (!eStopActive && (millis() - lastHeartbeat > WATCHDOG_TIMEOUT_MS)) {
    // Soft freeze if telemetry heartbeat drops
    targetJ1 = curJ1;
    targetJ2 = curJ2;
    targetJ3 = curJ3;
    targetJ4 = curJ4;
    targetJ5 = curJ5;
    targetJ6 = curJ6;
  }

  updateServosSmoothly();
  delay(20);
}
