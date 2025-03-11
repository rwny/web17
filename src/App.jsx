import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './App.css'
import LoadModel from './components/Model.jsx'
import LightScene from './components/LightScene.jsx'
import Sidebar from './components/Sidebar.jsx'

function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef(null);

  const handleObjectClick = useCallback((object) => {
    // Check if we received a valid object
    if (!object) {
      console.error("handleObjectClick called with null/undefined object");
      return;
    }
    
    console.log("%c🔄 App received object click", "background: #673AB7; color: white; padding: 4px 8px; border-radius: 4px;");
    console.log("Object received:", {
      name: object.name,
      type: object.type,
      uuid: object.uuid,
      position: object.position,
      userData: object.userData
    });
    
    // Use functional updates to guarantee we're working with the latest state
    setIsTransitioning(true);
    setSelectedObject(object);
    
    // Clear transition state after update completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
    
  }, []);

  const clearSelection = useCallback((e) => {
    // Only clear selection on direct canvas clicks, not bubbled events
    if (e.target === e.currentTarget) {
      console.log("%c❌ Clearing selection", "background: #F44336; color: white; padding: 4px 8px; border-radius: 4px;");
      setSelectedObject(null);
    } else {
      console.log("Ignoring event - not direct canvas click");
    }
  }, []);
  
  // Debug logging when selectedObject changes
  useEffect(() => {
    console.log("%c📊 App selectedObject state updated", "background: #009688; color: white; padding: 4px 8px; border-radius: 4px;");
    console.log("New state:", selectedObject);
  }, [selectedObject]);

  return (
    <>
      <Canvas
        ref={canvasRef}
        camera={{ position: [-105, 85, 25], fov: 50 }}
        onClick={clearSelection}
        style={{ touchAction: 'none' }}
        shadows
      >
        <OrbitControls enableDamping dampingFactor={0.25} />
        <LoadModel onObjectClick={handleObjectClick} />
        <LightScene />
      </Canvas>
      <Sidebar 
        selectedObject={selectedObject} 
        isTransitioning={isTransitioning}
      />
    </>
  )
}

export default App