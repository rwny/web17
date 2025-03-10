import { OrbitControls } from "@react-three/drei"
export default function LightScene() {
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

         <ambientLight intensity={0.5} />
         <pointLight position={[10, 10, 10]} />
      </>
   )
}