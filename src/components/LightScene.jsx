import { OrbitControls, useHelper } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

export default function LightScene() {
   // Reference to directional light for helper
   const directionalLightRef = useRef()
   
   // Uncomment to visualize light direction and shadow camera
   // useHelper(directionalLightRef, THREE.DirectionalLightHelper, 0.5)
   const shadowMapSize = 2048*4
   
   return(
      <>
         <OrbitControls 
          minPolarAngle={Math.PI / 4} // Minimum angle (30 degrees from top)
          maxPolarAngle={Math.PI / 2.3} // Maximum angle (≈82 degrees from top)
          enableZoom={true}
          enablePan={true}
          dampingFactor={0.1}
          rotateSpeed={0.5}
        />

         {/* Reduced ambient light intensity to make directional shadows more visible */}
         <ambientLight intensity={0.3} />
         
         {/* Reduced intensity of point light */}
         <pointLight position={[10, 10, 10]} intensity={0.5} />
         
         {/* Add directional light with shadows */}
         <directionalLight 
            ref={directionalLightRef}
            position={[-50, 100, 50]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-camera-far={500}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-bias={-0.0001}
         />
         
         {/* Add a second, less intense directional light from another angle for fill */}
         <directionalLight
            position={[50, 50, -50]}
            intensity={0.3}
            castShadow={false}
         />
      </>
   )
}