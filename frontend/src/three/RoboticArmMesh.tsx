import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { JointMap } from '../types/robot';

interface RoboticArmMeshProps {
  joints: JointMap;
  isEStopActive?: boolean;
}

export const RoboticArmMesh: React.FC<RoboticArmMeshProps> = ({ joints, isEStopActive }) => {
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;

  const j1Ref = useRef<THREE.Group>(null);
  const j2Ref = useRef<THREE.Group>(null);
  const j3Ref = useRef<THREE.Group>(null);
  const j4Ref = useRef<THREE.Group>(null);
  const j5Ref = useRef<THREE.Group>(null);
  const gripLeftRef = useRef<THREE.Mesh>(null);
  const gripRightRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (j1Ref.current) {
      j1Ref.current.rotation.y = deg2rad(-joints.J1);
    }
    if (j2Ref.current) {
      j2Ref.current.rotation.x = deg2rad(joints.J2 - 30);
    }
    if (j3Ref.current) {
      j3Ref.current.rotation.x = deg2rad(joints.J3 - 60);
    }
    if (j4Ref.current) {
      j4Ref.current.rotation.x = deg2rad(joints.J4 + 20);
    }
    if (j5Ref.current) {
      j5Ref.current.rotation.z = deg2rad(joints.J5);
    }
    const gripOffset = 0.05 + (joints.J6 / 100.0) * 0.20;
    if (gripLeftRef.current) {
      gripLeftRef.current.position.x = -gripOffset;
    }
    if (gripRightRef.current) {
      gripRightRef.current.position.x = gripOffset;
    }
  });

  const bodyMaterial = (
    <meshStandardMaterial
      color="#2B323D"
      metalness={0.8}
      roughness={0.25}
    />
  );

  const jointMaterial = (
    <meshStandardMaterial
      color={isEStopActive ? "#DC2626" : "#1E232A"}
      metalness={0.85}
      roughness={0.2}
    />
  );

  const accentMaterial = (
    <meshStandardMaterial
      color={isEStopActive ? "#DC2626" : "#2563EB"}
      metalness={0.6}
      roughness={0.25}
    />
  );

  const chromeMaterial = (
    <meshStandardMaterial
      color="#CBD5E1"
      metalness={0.9}
      roughness={0.15}
    />
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Base Pedestal / Mounting Plate */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.3, 32]} />
        {jointMaterial}
      </mesh>

      {/* Base Accent Ring */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.04, 32]} />
        {accentMaterial}
      </mesh>

      {/* J1: Base Turntable Group (Rotates Y) */}
      <group ref={j1Ref} position={[0, 0.32, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.85, 0.95, 0.7, 32]} />
          {bodyMaterial}
        </mesh>

        <mesh position={[-0.45, 0.9, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.6]} />
          {bodyMaterial}
        </mesh>
        <mesh position={[0.45, 0.9, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.6]} />
          {bodyMaterial}
        </mesh>

        <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.1, 24]} />
          {jointMaterial}
        </mesh>

        <group ref={j2Ref} position={[0, 1.15, 0]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[0.4, 1.6, 0.45]} />
            {bodyMaterial}
          </mesh>

          <mesh position={[0.21, 0.9, 0]}>
            <boxGeometry args={[0.02, 1.3, 0.2]} />
            {accentMaterial}
          </mesh>
          <mesh position={[-0.21, 0.9, 0]}>
            <boxGeometry args={[0.02, 1.3, 0.2]} />
            {accentMaterial}
          </mesh>

          <mesh position={[0, 0.85, -0.32]} rotation={[0.15, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 1.1, 16]} />
            {chromeMaterial}
          </mesh>

          <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.8, 24]} />
            {jointMaterial}
          </mesh>

          <group ref={j3Ref} position={[0, 1.8, 0]}>
            <mesh position={[0, 0.75, 0]} castShadow>
              <boxGeometry args={[0.32, 1.3, 0.35]} />
              {bodyMaterial}
            </mesh>

            <mesh position={[0, 1.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.6, 24]} />
              {jointMaterial}
            </mesh>

            <group ref={j4Ref} position={[0, 1.45, 0]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.25, 0.7, 24]} />
                {bodyMaterial}
              </mesh>

              <group ref={j5Ref} position={[0, 0.75, 0]}>
                <mesh position={[0, 0.1, 0]} castShadow>
                  <boxGeometry args={[0.5, 0.12, 0.3]} />
                  {jointMaterial}
                </mesh>

                <mesh ref={gripLeftRef} position={[-0.05, 0.32, 0]} castShadow>
                  <boxGeometry args={[0.08, 0.35, 0.18]} />
                  {chromeMaterial}
                </mesh>
                <mesh ref={gripRightRef} position={[0.05, 0.32, 0]} castShadow>
                  <boxGeometry args={[0.08, 0.35, 0.18]} />
                  {chromeMaterial}
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
