import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function CameraControls() {
  const { camera } = useThree();
  const orbitControlsRef = useRef();

  return (
    <OrbitControls
      ref={orbitControlsRef}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2}
      enablePan={true}
      panSpeed={0.8}
      enableDamping={true}
      dampingFactor={0.15}
      rotateSpeed={0.6}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      minDistance={20}
      maxDistance={500}
    />
  );
}
