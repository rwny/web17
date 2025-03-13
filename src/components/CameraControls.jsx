import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Simplified to always use perspective mode
export default function CameraControls() {
  const { camera } = useThree();
  const orbitControlsRef = useRef();

  // Store controls reference in camera for access by other components
  useEffect(() => {
    if (orbitControlsRef.current) {
      camera.userData.controls = orbitControlsRef.current;
    }
    
    return () => {
      // Clean up when unmounted
      if (camera.userData.controls) {
        delete camera.userData.controls;
      }
    };
  }, [camera]);

  return (
    <OrbitControls
      ref={orbitControlsRef}
      camera={camera}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2}
      enablePan={true}
      panSpeed={0.8}
      enableDamping={true}
      dampingFactor={0.15}
      rotateSpeed={0.6}
      zoomSpeed={1}
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
