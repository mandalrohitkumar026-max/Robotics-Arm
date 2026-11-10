import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useDemo } from '../context/DemoContext';
import { JointStatus } from './JointStatus';
import { RotateCcw } from 'lucide-react';

interface ArmModelProps {
  j1: number;
  j2: number;
  j3: number;
  j4: number;
  j5: number;
}

const ArmModel: React.FC<ArmModelProps> = ({ j1, j2, j3, j4, j5 }) => {
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const clawLRef = useRef<THREE.Mesh>(null);
  const clawRRef = useRef<THREE.Mesh>(null);

  const rad = (deg: number) => (deg * Math.PI) / 180;

  useFrame(() => {
    if (baseRef.current) baseRef.current.rotation.y = rad(j1 - 90);
    if (shoulderRef.current) shoulderRef.current.rotation.x = rad(j2 - 60);
    if (elbowRef.current) elbowRef.current.rotation.x = rad(j3 - 75);
    if (wristRef.current) wristRef.current.rotation.x = rad(j4 - 30);

    const gripOffset = 0.06 + (j5 / 100) * 0.16;
    if (clawLRef.current) clawLRef.current.position.x = -gripOffset;
    if (clawRRef.current) clawRRef.current.position.x = gripOffset;
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Heavy Base Plate - Industrial Dark Cast Steel */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.0, 1.2, 0.2, 32]} />
        <meshStandardMaterial color="#1E232A" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* J1 Turntable */}
      <group ref={baseRef} position={[0, 0.2, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.7, 0.8, 0.5, 24]} />
          <meshStandardMaterial color="#2B323D" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.05, 24]} />
          <meshStandardMaterial color="#374151" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* J2 Shoulder */}
        <group ref={shoulderRef} position={[0, 0.65, 0]}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.35, 1.3, 0.35]} />
            <meshStandardMaterial color="#2B323D" metalness={0.8} roughness={0.25} />
          </mesh>

          {/* J3 Elbow */}
          <group ref={elbowRef} position={[0, 1.35, 0]}>
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.28, 1.1, 0.28]} />
              <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.25} />
            </mesh>

            {/* J4 Wrist */}
            <group ref={wristRef} position={[0, 1.15, 0]}>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
                <meshStandardMaterial color="#1E232A" metalness={0.85} roughness={0.2} />
              </mesh>

              {/* J5 Gripper */}
              <group position={[0, 0.35, 0]}>
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[0.45, 0.1, 0.2]} />
                  <meshStandardMaterial color="#2B323D" metalness={0.75} roughness={0.3} />
                </mesh>
                <mesh ref={clawLRef} position={[-0.14, 0.22, 0]}>
                  <boxGeometry args={[0.06, 0.26, 0.12]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.15} />
                </mesh>
                <mesh ref={clawRRef} position={[0.14, 0.22, 0]}>
                  <boxGeometry args={[0.06, 0.26, 0.12]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.15} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

export const RobotPreview: React.FC<{ height?: number; showSliders?: boolean }> = ({
  height = 320,
  showSliders = true
}) => {
  const { state, setJoint } = useDemo();
  const controlsRef = useRef<any>(null);

  return (
    <div className="space-y-3 font-mono">
      {/* 3D Canvas Viewport */}
      <div
        style={{ height: `${height}px` }}
        className="relative w-full rounded-[8px] overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] shadow-subtle"
      >
        <Canvas camera={{ position: [3.2, 2.4, 3.8], fov: 45 }} shadows>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 4]} intensity={1.5} />
          <pointLight position={[-4, 3, -3]} color="#E2E8F0" intensity={0.5} />

          <ArmModel
            j1={state.jointAngles.J1}
            j2={state.jointAngles.J2}
            j3={state.jointAngles.J3}
            j4={state.jointAngles.J4}
            j5={state.jointAngles.J5}
          />

          <ContactShadows position={[0, -0.6, 0]} opacity={0.3} scale={6} blur={2.5} />
          <Grid position={[0, -0.6, 0]} args={[10, 10]} cellColor="#CBD5E1" sectionColor="#94A3B8" />
          <OrbitControls ref={controlsRef} enablePan={false} minDistance={2} maxDistance={7} />
        </Canvas>

        {/* Viewport Reset Camera Button */}
        <button
          onClick={() => controlsRef.current?.reset()}
          title="Reset Camera View"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] transition-colors shadow-subtle cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="absolute top-2.5 left-2.5 pointer-events-none text-[10px] text-[#64748B] bg-[#FFFFFF]/90 px-2.5 py-1 rounded-[4px] border border-[#E2E8F0] shadow-subtle flex items-center gap-1.5 font-sans">
          <span>Kinematic State:</span>
          <span className="text-[#2563EB] font-bold font-mono">{state.currentIntent}</span>
        </div>
      </div>

      {/* Joint Values Breakdown */}
      {showSliders && (
        <JointStatus
          joints={state.jointAngles}
          interactive={false}
          onJointChange={setJoint}
        />
      )}
    </div>
  );
};
