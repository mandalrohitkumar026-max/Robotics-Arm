import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import { RoboticArmMesh } from './RoboticArmMesh';
import { useRobot } from '../contexts/RobotContext';
import { RotateCcw, Crosshair } from 'lucide-react';

interface ArmCanvasProps {
  interactive?: boolean;
  className?: string;
  showOverlay?: boolean;
}

export const ArmCanvas: React.FC<ArmCanvasProps> = ({
  interactive = true,
  className = "w-full h-full min-h-[360px]",
  showOverlay = true
}) => {
  const { joints, isEStopActive, endEffector, activeCommand, resetToHome } = useRobot();
  const controlsRef = useRef<any>(null);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className={`relative rounded-[8px] overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] shadow-subtle ${className}`}>
      <Canvas
        camera={{ position: [3.8, 3.2, 4.5], fov: 45 }}
        shadows
        className="w-full h-full"
      >
        <color attach="background" args={['#F8FAFC']} />
        
        {/* Crisp industrial daylight studio lighting */}
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.3}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, 3, -4]} intensity={0.4} color="#E2E8F0" />
        <pointLight position={[3, 4, -2]} intensity={0.4} color="#CBD5E1" />

        {/* 6-DOF Robotic Arm Model */}
        <RoboticArmMesh joints={joints} isEStopActive={isEStopActive} />

        {/* Soft realistic ground shadow */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.3}
          scale={10}
          blur={2.0}
          far={4}
        />

        {/* Scientific Laboratory Floor Grid */}
        <Grid
          position={[0, -0.01, 0]}
          args={[14, 14]}
          cellSize={0.5}
          cellThickness={0.8}
          cellColor="#CBD5E1"
          sectionSize={2.0}
          sectionThickness={1.2}
          sectionColor="#94A3B8"
          fadeDistance={12}
        />

        {interactive && (
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2 + 0.05}
            minDistance={1.8}
            maxDistance={8.5}
          />
        )}
      </Canvas>

      {/* Floating HUD Telemetry Overlay */}
      {showOverlay && (
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none font-mono">
          <div className="flex items-center gap-2 bg-[#FFFFFF]/90 backdrop-blur-xs px-2.5 py-1.5 rounded-[4px] border border-[#E2E8F0] shadow-subtle text-xs text-[#0F172A]">
            <Crosshair className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>TCP [mm]: X:{endEffector.x} Y:{endEffector.y} Z:{endEffector.z}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#FFFFFF]/90 backdrop-blur-xs px-2.5 py-1 rounded-[4px] border border-[#E2E8F0] shadow-subtle text-[11px] text-[#64748B]">
            <span>STATE: <strong className={isEStopActive ? "text-[#DC2626]" : "text-[#16A34A]"}>{activeCommand}</strong></span>
          </div>
        </div>
      )}

      {/* Top-Right Quick Camera Reset */}
      {interactive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono">
          <button
            onClick={handleResetCamera}
            title="Reset Camera Angle"
            className="p-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] shadow-subtle transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetToHome}
            title="Reset Arm to Home Pose"
            className="text-[11px] px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-semibold shadow-subtle transition-colors cursor-pointer"
          >
            HOME
          </button>
        </div>
      )}
    </div>
  );
};
