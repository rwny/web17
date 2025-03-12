import { OrbitControls, useHelper } from "@react-three/drei"
import { useRef, useEffect } from "react"
import * as THREE from "three"

export default function LightScene({ showSun = true }) {
   // Reference to directional light for helper
   const directionalLightRef = useRef()
   const fillLightRef = useRef()
   
   // Uncomment to visualize light direction and shadow camera
   // useHelper(directionalLightRef, THREE.DirectionalLightHelper, 0.5)
   const shadowMapSize = 2048*6
   
   // Update shadow casting when showSun changes
   useEffect(() => {
      if (directionalLightRef.current) {
         // Only toggle shadow casting, keep intensity the same
         directionalLightRef.current.castShadow = showSun;
      }
      if (fillLightRef.current) {
         // Fill light doesn't cast shadows, so no changes needed
      }
   }, [showSun]);
   
   return(
      <>
         <OrbitControls 
          // Prevent viewing from below ground level
          minPolarAngle={Math.PI / 6} // Restrict more (30 degrees from top)
          maxPolarAngle={Math.PI / 2.1} // Exactly horizontal (90 degrees)
          
          // Improve panning behavior
          enablePan={true}
          panSpeed={0.8} // Slightly slower pan for better control
          
          // Smoother controls overall
          enableDamping={true}
          dampingFactor={0.15} // Increased damping for smoother motion
          rotateSpeed={0.6} // Slightly lower rotate speed
          
          // Mouse button configuration
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
          
          // Prevent zooming too far in or out
          minDistance={20}
          maxDistance={500}
         />

         {/* Keep ambient light consistent */}
         <ambientLight intensity={0.3} />
         
         {/* Base point light that's always on */}
         <pointLight position={[10, 10, 10]} intensity={0.5} />
         
         {/* Directional light with toggleable shadows but constant intensity */}
         <directionalLight 
            ref={directionalLightRef}
            position={[-50, 80, 50]} 
            intensity={1}  // Always keep full intensity 
            castShadow={showSun}  // Only toggle shadow casting
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-camera-far={500}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-bias={-0.0001}
         />
         
         {/* Fill light always on with consistent intensity */}
         <directionalLight
            ref={fillLightRef}
            position={[50, 120, -50]}
            intensity={0.5}  // Keep consistent intensity
            castShadow={false}  // Never casts shadows
         />
            <directionalLight
            ref={fillLightRef}
            position={[50, -120, -50]}
            intensity={0.1}  // Keep consistent intensity
            castShadow={false}  // Never casts shadows
         />
      </>
   )
}