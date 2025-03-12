import React, { useRef } from 'react';
import * as THREE from 'three';

// Simple person model for third-person camera
export default function PersonModel({ position, rotation }) {
  const group = useRef();
  
  // Using a slightly adjusted position to ensure character stands on the ground
  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* Body - positioned so bottom of legs are at y=0 */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.5, 1.5, 0.3]} />
        <meshStandardMaterial color="#3f51b5" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ffcc80" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[0.35, 1.25, 0]}>
        <boxGeometry args={[0.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#3f51b5" />
      </mesh>
      <mesh position={[-0.35, 1.25, 0]}>
        <boxGeometry args={[0.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#3f51b5" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.15, 0, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      <mesh position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
    </group>
  );
}
