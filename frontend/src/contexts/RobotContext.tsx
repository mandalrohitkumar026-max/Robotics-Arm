import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import type { JointMap, EndEffector, RobotTelemetry, PresetPose } from '../types/robot';
import { WS_BASE_URL, api } from '../services/api';

const HOME_JOINTS: JointMap = {
  J1: 0.0,
  J2: 30.0,
  J3: 60.0,
  J4: -20.0,
  J5: 0.0,
  J6: 50.0
};

const PRESET_POSES: Record<PresetPose, JointMap> = {
  HOME: { J1: 0.0, J2: 30.0, J3: 60.0, J4: -20.0, J5: 0.0, J6: 50.0 },
  REACH: { J1: 0.0, J2: 65.0, J3: 25.0, J4: -10.0, J5: 0.0, J6: 80.0 },
  PICK: { J1: 25.0, J2: 75.0, J3: 45.0, J4: -30.0, J5: 15.0, J6: 10.0 },
  REST: { J1: 0.0, J2: 0.0, J3: 110.0, J4: -40.0, J5: 0.0, J6: 0.0 }
};

interface RobotContextType {
  isConnected: boolean;
  joints: JointMap;
  targetJoints: JointMap;
  endEffector: EndEffector;
  activeCommand: string;
  isMoving: boolean;
  isEStopActive: boolean;
  setJoint: (joint: keyof JointMap, angle: number) => void;
  setAllJoints: (joints: Partial<JointMap>) => void;
  setPose: (pose: PresetPose) => void;
  emergencyStop: () => Promise<void>;
  resetEmergencyStop: () => Promise<void>;
  resetToHome: () => void;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export const RobotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [joints, setJoints] = useState<JointMap>(HOME_JOINTS);
  const [targetJoints, setTargetJoints] = useState<JointMap>(HOME_JOINTS);
  const [endEffector, setEndEffector] = useState<EndEffector>({ x: 210.5, y: 0.0, z: 185.2 });
  const [activeCommand, setActiveCommand] = useState<string>("IDLE");
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isEStopActive, setIsEStopActive] = useState<boolean>(false);

  const curJointsRef = useRef<JointMap>(HOME_JOINTS);
  const targetJointsRef = useRef<JointMap>(HOME_JOINTS);
  const eStopRef = useRef<boolean>(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackTimer: number | null = null;
    let isCancelled = false;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_BASE_URL}/ws/robot`);
        ws.onopen = () => {
          if (!isCancelled) {
            setIsConnected(true);
            if (fallbackTimer) clearInterval(fallbackTimer);
          }
        };

        ws.onmessage = (event) => {
          try {
            const data: RobotTelemetry = JSON.parse(event.data);
            if (data.joints) {
              curJointsRef.current = data.joints;
              setJoints(data.joints);
            }
            if (data.target_joints) {
              targetJointsRef.current = data.target_joints;
              setTargetJoints(data.target_joints);
            }
            if (data.end_effector) setEndEffector(data.end_effector);
            if (data.active_command) setActiveCommand(data.active_command);
            setIsMoving(data.is_moving);
            setIsEStopActive(data.e_stop_active);
            eStopRef.current = data.e_stop_active;
          } catch (e) {
            console.error("Robot WS parse error", e);
          }
        };

        ws.onclose = () => {
          if (!isCancelled) {
            setIsConnected(false);
            startClientSideKinematics();
          }
        };

        ws.onerror = () => {
          if (ws) ws.close();
        };
      } catch {
        startClientSideKinematics();
      }
    };

    // Client-side smooth kinematics interpolator if offline
    const startClientSideKinematics = () => {
      if (fallbackTimer) return;
      fallbackTimer = window.setInterval(() => {
        if (eStopRef.current) return;
        const cur = { ...curJointsRef.current };
        const tgt = targetJointsRef.current;
        let moved = false;

        (['J1', 'J2', 'J3', 'J4', 'J5', 'J6'] as (keyof JointMap)[]).forEach(j => {
          const diff = tgt[j] - cur[j];
          if (Math.abs(diff) > 0.2) {
            cur[j] += diff * 0.15; // Smooth exponential decay
            moved = true;
          } else {
            cur[j] = tgt[j];
          }
        });

        if (moved) {
          curJointsRef.current = cur;
          setJoints({ ...cur });
          setIsMoving(true);
        } else {
          setIsMoving(false);
        }
      }, 40);
    };

    connectWebSocket();

    return () => {
      isCancelled = true;
      if (ws) ws.close();
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, []);

  const setJoint = (joint: keyof JointMap, angle: number) => {
    if (isEStopActive) return;
    const newTgt = { ...targetJointsRef.current, [joint]: angle };
    targetJointsRef.current = newTgt;
    setTargetJoints(newTgt);
    setActiveCommand("MANUAL_CONTROL");
    api.setManualJoints(newTgt).catch(() => {});
  };

  const setAllJoints = (newJoints: Partial<JointMap>) => {
    if (isEStopActive) return;
    const merged = { ...targetJointsRef.current, ...newJoints };
    targetJointsRef.current = merged;
    setTargetJoints(merged);
    api.setManualJoints(merged).catch(() => {});
  };

  const setPose = (pose: PresetPose) => {
    if (isEStopActive) return;
    const tgt = PRESET_POSES[pose];
    if (tgt) {
      targetJointsRef.current = { ...tgt };
      setTargetJoints({ ...tgt });
      setActiveCommand(`GOTO_${pose}`);
      api.setPresetPose(pose).catch(() => {});
    }
  };

  const resetToHome = () => {
    setPose("HOME");
  };

  const emergencyStop = async () => {
    setIsEStopActive(true);
    eStopRef.current = true;
    targetJointsRef.current = { ...curJointsRef.current };
    setTargetJoints({ ...curJointsRef.current });
    setActiveCommand("EMERGENCY_STOP");
    try {
      await api.emergencyStop();
    } catch {}
  };

  const resetEmergencyStop = async () => {
    setIsEStopActive(false);
    eStopRef.current = false;
    setActiveCommand("IDLE");
    try {
      await api.resetEmergencyStop();
    } catch {}
  };

  return (
    <RobotContext.Provider
      value={{
        isConnected,
        joints,
        targetJoints,
        endEffector,
        activeCommand,
        isMoving,
        isEStopActive,
        setJoint,
        setAllJoints,
        setPose,
        emergencyStop,
        resetEmergencyStop,
        resetToHome
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};

export const useRobot = () => {
  const context = useContext(RobotContext);
  if (!context) throw new Error("useRobot must be used within a RobotProvider");
  return context;
};
