import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useDemo } from '../context/DemoContext';
import { useEEG } from '../context/EEGContext';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Activity,
  Brain,
  Hand,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

interface Step {
  id: number;
  label: string;
  cue: string;
  description: string;
  icon: any;
  durationSeconds: number;
}

const CALIBRATION_STEPS: Step[] = [
  {
    id: 1,
    label: 'Prepare',
    cue: 'Electrode Contact & Impedance Check',
    description: 'Ensure all 8 scalp electrodes have impedance < 5 kΩ and the participant is relaxed in a quiet room.',
    icon: Brain,
    durationSeconds: 10
  },
  {
    id: 2,
    label: 'REST',
    cue: 'Rest Baseline (Eyes Open)',
    description: 'Breathe normally and fixate gaze on the center crosshair without moving or swallowing.',
    icon: Activity,
    durationSeconds: 15
  },
  {
    id: 3,
    label: 'LEFT',
    cue: 'Kinesthetic Left Hand Motor Imagery',
    description: 'Mentally imagine squeezing a stress ball with your left palm. Keep physical muscles fully stationary.',
    icon: ArrowLeft,
    durationSeconds: 15
  },
  {
    id: 4,
    label: 'RIGHT',
    cue: 'Kinesthetic Right Hand Motor Imagery',
    description: 'Mentally imagine squeezing with your right hand to activate contralateral C3 sensorimotor desynchronization.',
    icon: ArrowRight,
    durationSeconds: 15
  },
  {
    id: 5,
    label: 'GRIP',
    cue: 'Bilateral Grasp Imagery',
    description: 'Imagine simultaneous forceful grasp closure of both hands to trigger central vertex mu/beta modulation.',
    icon: Hand,
    durationSeconds: 15
  },
  {
    id: 6,
    label: 'RELEASE',
    cue: 'Hand Extension / Release Imagery',
    description: 'Imagine extending all fingers wide outward, opening both palms smoothly.',
    icon: Sparkles,
    durationSeconds: 15
  },
  {
    id: 7,
    label: 'STOP',
    cue: 'Emergency Inhibit Thought Cue',
    description: 'Mentally evoke an immediate cognitive stop command, arresting any imagined motion pattern.',
    icon: ShieldAlert,
    durationSeconds: 15
  },
  {
    id: 8,
    label: 'Review',
    cue: 'Data Integrity & Artifact Audit',
    description: 'Examine collected epoch signal-to-noise ratio, ocular blink counts, and cross-channel coherence.',
    icon: CheckCircle2,
    durationSeconds: 5
  },
  {
    id: 9,
    label: 'Train',
    cue: 'Classifier Retraining & Verification',
    description: 'Run 5-fold cross-validated Random Forest fit on collected calibration trials.',
    icon: Zap,
    durationSeconds: 5
  }
];

export const Calibration: React.FC = () => {
  const { showToast } = useDemo();
  const { quality } = useEEG();
  const signalScore = quality?.quality_score ?? 98.4;

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [recordedSamples, setRecordedSamples] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const activeStep = CALIBRATION_STEPS[currentStepIdx];
  const stepTargetSeconds = activeStep.durationSeconds;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;
          setRecordedSamples((s) => s + 250);
          if (next >= stepTargetSeconds) {
            if (currentStepIdx < CALIBRATION_STEPS.length - 1) {
              setCurrentStepIdx((idx) => idx + 1);
              showToast('Calibration Step Advanced', `Completed ${activeStep.label}. Now recording ${CALIBRATION_STEPS[currentStepIdx + 1].label}.`, 'info');
              return 0;
            } else {
              setIsRunning(false);
              setIsCompleted(true);
              showToast('Calibration Finished', 'All 9 protocol steps completed successfully. Model updated.', 'success');
              return stepTargetSeconds;
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentStepIdx, stepTargetSeconds, activeStep, showToast]);

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
    showToast('Calibration Started', `Recording cue: ${activeStep.label}`, 'info');
  };

  const handlePause = () => {
    setIsRunning(false);
    showToast('Calibration Paused', 'Session timer halted.', 'info');
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStepIdx(0);
    setSecondsElapsed(0);
    setRecordedSamples(0);
    setIsCompleted(false);
    showToast('Calibration Reset', 'Returned to initial step 1 (Prepare).', 'info');
  };

  const handleSkipStep = () => {
    if (currentStepIdx < CALIBRATION_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      setSecondsElapsed(0);
    }
  };

  const progressPercent = Math.min(100, Math.round((secondsElapsed / stepTargetSeconds) * 100));
  const StepIcon = activeStep.icon;

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Subject Calibration Protocol"
        subtitle="Standardized 9-step motor-imagery acquisition protocol for classifier personalization"
        badge="Protocol ISO-13485"
        actions={
          <div className="flex items-center gap-2 text-xs">
            {isRunning ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#D97706] font-medium transition-colors cursor-pointer shadow-subtle"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={isCompleted}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-medium transition-colors cursor-pointer shadow-subtle"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{secondsElapsed > 0 ? 'Resume' : 'Start Protocol'}</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        }
      />

      <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle overflow-x-auto">
        <div className="flex items-center min-w-[700px] justify-between">
          {CALIBRATION_STEPS.map((step, idx) => {
            const isPassed = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => {
                    if (!isRunning) {
                      setCurrentStepIdx(idx);
                      setSecondsElapsed(0);
                    }
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-[6px] ${
                    isCurrent
                      ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]'
                      : isPassed
                      ? 'text-[#16A34A]'
                      : 'text-[#94A3B8] hover:text-[#475569]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white shadow-sm ring-2 ring-[#BFDBFE]'
                        : isPassed
                        ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                        : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <span className="text-[11px] font-semibold whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
                {idx < CALIBRATION_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1.5 transition-colors ${
                      isPassed ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-6 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              ACTIVE TRIAL CUE: STEP {activeStep.id} OF 9
            </span>
            <span className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px] border border-[#E2E8F0]">
              {isRunning ? 'RECORDING' : 'IDLE / PAUSED'}
            </span>
          </div>

          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRunning
                  ? 'bg-[#EFF6FF] text-[#2563EB] ring-4 ring-[#BFDBFE] animate-pulse'
                  : 'bg-[#FFFFFF] text-[#64748B] border border-[#CBD5E1]'
              }`}
            >
              <StepIcon className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {activeStep.cue}
              </h2>
              <p className="text-xs text-[#475569] max-w-md mx-auto mt-2 leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            <div className="w-full max-w-md px-6 pt-2">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#64748B]">Epoch Progress</span>
                <span className="font-semibold text-[#0F172A] tabular-nums">
                  00:{String(secondsElapsed).padStart(2, '0')} / 00:{String(stepTargetSeconds).padStart(2, '0')}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B]">
              Subject instruction: minimize eye blinks during active cue window
            </span>
            <button
              onClick={handleSkipStep}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Skip Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle space-y-3">
            <h3 className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2563EB]" />
              Acquisition Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-mono text-[#64748B] block">RECORDED SAMPLES</span>
                <span className="text-lg font-bold font-mono text-[#0F172A] tabular-nums block mt-0.5">
                  {recordedSamples}
                </span>
                <span className="text-[10px] text-[#16A34A] font-medium">@ 250 Hz FS</span>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-mono text-[#64748B] block">SIGNAL FIDELITY</span>
                <span className="text-lg font-bold font-mono text-[#16A34A] tabular-nums block mt-0.5">
                  {signalScore.toFixed(1)}%
                </span>
                <span className="text-[10px] text-[#64748B]">Impedance &lt; 5kΩ</span>
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Channels Monitored:</span>
                <span className="font-mono font-medium text-[#0F172A]">8 Scalp Leads</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Bandpass Filter:</span>
                <span className="font-mono font-medium text-[#0F172A]">0.5 – 45.0 Hz Butterworth</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Notch Filter:</span>
                <span className="font-mono font-medium text-[#0F172A]">50 / 60 Hz Active</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
            <h4 className="text-xs font-semibold text-[#1E40AF] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              Scientific Calibration Note
            </h4>
            <p className="text-[11px] text-[#1E40AF] leading-relaxed">
              Standard BCI motor-imagery calibration maps contralateral sensorimotor rhythm (SMR) suppression on C3/C4 leads. Completed sessions update the local classifier weights instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
