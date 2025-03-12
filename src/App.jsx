import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import './App.css'
import LoadModel from './components/Model.jsx'
import LightScene from './components/LightScene.jsx'
import CameraControls from './components/CameraControls.jsx'
import Sidebar from './components/Sidebar.jsx'
import ToggleSceneControl from './components/ToggleSceneControl.jsx'
import LoadingBar from './components/LoadingBar.jsx'
import Header from './components/Header.jsx'

function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showSun, setShowSun] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraMode, setCameraMode] = useState("orbit");
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

  const handleToggleLabels = useCallback((show) => {
    console.log(`%c${show ? "✅ Showing" : "❌ Hiding"} building labels`, 
      `background: ${show ? "#4CAF50" : "#f44336"}; color: white; padding: 4px 8px; border-radius: 4px;`);
    setShowLabels(show);
  }, []);

  const handleToggleSun = useCallback((show) => {
    console.log(`%c${show ? "☀️ Enabling" : "🌑 Disabling"} sun and shadows`, 
      `background: ${show ? "#FF9800" : "#616161"}; color: white; padding: 4px 8px; border-radius: 4px;`);
    setShowSun(show);
  }, []);
  
  const handleToggleDebug = useCallback((show) => {
    console.log(`%c${show ? "🐞 Enabling" : "✨ Disabling"} debug mode`, 
      `background: ${show ? "#9C27B0" : "#607D8B"}; color: white; padding: 4px 8px; border-radius: 4px;`);
    setDebugMode(show);
  }, []);

  const handleToggleCameraMode = useCallback((mode) => {
    // Modified to only cycle between orbit and third-person modes
    let nextMode;
    
    if (mode === "next") {
      if (cameraMode === "orbit") nextMode = "thirdperson";
      else nextMode = "orbit";
    } else {
      // If first-person is explicitly requested, use third-person instead
      nextMode = mode === "firstperson" ? "thirdperson" : mode;
    }
    
    console.log(`%cSwitching to ${
      nextMode === "thirdperson" ? "🎮 Third-Person" : "🔄 Orbit"
    } camera mode`, 
    `background: ${
      nextMode === "thirdperson" ? "#9C27B0" : "#009688"
    }; color: white; padding: 4px 8px; border-radius: 4px;`);
    
    setCameraMode(nextMode);
  }, [cameraMode]);

  // Track loading progress
  const handleLoadingProgress = useCallback((progress) => {
    setLoadingProgress(progress);
    if (progress >= 100) {
      // Add a small delay before hiding the loading bar
      setTimeout(() => {
        setIsModelLoaded(true);
      }, 500);
    }
  }, []);

  // Determine if we should show content based on loading progress
  const showContent = isModelLoaded;

  return (
    <>
      {/* Only show loading bar when not fully loaded */}
      {!isModelLoaded && <LoadingBar progress={loadingProgress} />}
      
      {/* Black overlay that hides everything until loading is complete */}
      {!showContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          zIndex: 900
        }} />
      )}
      
      {/* The 3D scene */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [-105, 85, 25], fov: 50 }}
        onClick={clearSelection}
        style={{ 
          touchAction: 'none',
          visibility: showContent ? 'visible' : 'hidden' // Hide canvas when loading
        }}
        shadows
      >
        <CameraControls mode={cameraMode} />
        
        <LoadModel 
          onObjectClick={handleObjectClick} 
          showLabels={showLabels} 
          debug={debugMode}
          onLoadingProgress={handleLoadingProgress}
        />
        <LightScene showSun={showSun} />
      </Canvas>
      
      {/* Keep only the third-person camera instructions */}
      {showContent && cameraMode === "thirdperson" && (
        <div className="camera-instructions">
          <p>Third-Person Mode: WASD to move, Click & drag to rotate camera</p>
          <p>Shift to run, Press C to change camera mode</p>
        </div>
      )}
      
      {/* Faculty header (show when content is loaded) */}
      {showContent && <Header />}
      
      {/* Only show controls when content is loaded */}
      {showContent && (
        <ToggleSceneControl 
          onToggleLabels={handleToggleLabels}
          onToggleSun={handleToggleSun}
          onToggleDebug={handleToggleDebug}
          onToggleCameraMode={handleToggleCameraMode}
          cameraMode={cameraMode}
        />
      )}
      
      {/* Only show sidebar when content is loaded */}
      {showContent && (
        <Sidebar 
          selectedObject={selectedObject} 
          isTransitioning={isTransitioning}
        />
      )}
    </>
  )
}

export default App