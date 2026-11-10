export interface JointMap {
  J1: number; // Base Yaw (-170 to +170)
  J2: number; // Shoulder Pitch (-60 to +120)
  J3: number; // Elbow Pitch (-150 to +150)
  J4: number; // Wrist Pitch (-90 to +90)
  J5: number; // Wrist Roll (-180 to +180)
  J6: number; // Gripper (0 = Closed to 100 = Open)
}

export interface EndEffector {
  x: number;
  y: number;
  z: number;
}

export interface JointLimit {
  min: number;
  max: number;
  name: string;
  home: number;
}

export interface RobotTelemetry {
  type: string;
  joints: JointMap;
  target_joints: JointMap;
  end_effector: EndEffector;
  active_command: string;
  is_moving: boolean;
  e_stop_active: boolean;
  timestamp: number;
}

export type PresetPose = "HOME" | "REACH" | "PICK" | "REST";
