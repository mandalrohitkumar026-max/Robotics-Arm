import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { demoEngine } from '../services/demoEngine';
import type { DemoState, JointAngles } from '../types/demo';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface DemoContextType {
  state: DemoState;
  startDemo: () => void;
  pauseDemo: () => void;
  resetDemo: () => void;
  triggerEStop: () => void;
  resetEStop: () => void;
  setJoint: (joint: keyof JointAngles, angle: number) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  showHardwareNotice: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DemoState>(demoEngine.getState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confidence threshold persisted in localStorage
  const [confidenceThreshold, setThresholdState] = useState<number>(() => {
    const saved = localStorage.getItem('neuroarm_confidence_threshold');
    return saved ? parseFloat(saved) : 80;
  });

  const setConfidenceThreshold = (val: number) => {
    setThresholdState(val);
    localStorage.setItem('neuroarm_confidence_threshold', val.toString());
    showToast('Settings Updated', `Confidence threshold set to ${val}%`, 'info');
  };

  useEffect(() => {
    const unsubscribe = demoEngine.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showHardwareNotice = () => {
    showToast(
      'Hardware Module Notice',
      'Hardware integration will be available in a future MVP. System is running in Demo Mode.',
      'info'
    );
  };

  const startDemo = () => {
    demoEngine.start();
    showToast('Simulation Active', 'Demo EEG and robotics engine running.', 'success');
  };

  const pauseDemo = () => {
    demoEngine.pause();
    showToast('Simulation Paused', 'Demo stream paused.', 'info');
  };

  const resetDemo = () => {
    demoEngine.reset();
    showToast('Simulation Reset', 'Demo state reset to baseline.', 'info');
  };

  const triggerEStop = () => {
    demoEngine.triggerEmergencyStop();
    showToast('EMERGENCY STOP', 'Simulation halted immediately.', 'error');
  };

  const resetEStop = () => {
    demoEngine.resetEmergencyStop();
    showToast('E-Stop Cleared', 'Motion simulation resumed.', 'success');
  };

  const setJoint = (joint: keyof JointAngles, angle: number) => {
    demoEngine.setManualJoint(joint, angle);
  };

  return (
    <DemoContext.Provider
      value={{
        state,
        startDemo,
        pauseDemo,
        resetDemo,
        triggerEStop,
        resetEStop,
        setJoint,
        confidenceThreshold,
        setConfidenceThreshold,
        toasts,
        showToast,
        dismissToast,
        showHardwareNotice
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within a DemoProvider');
  return context;
};
