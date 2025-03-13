import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'; // Remove OrthographicCamera import
import * as THREE from 'three'; // Add THREE import
import './App.css'
import LoadModel from './components/Model.jsx'
import BuildingDetailView from './components/BuildingDetailView.jsx'
import LightScene from './components/LightScene.jsx'
import CameraControls from './components/CameraControls.jsx'
import Sidebar from './components/Sidebar.jsx'
import ToggleSceneControl from './components/ToggleSceneControl.jsx'
import LoadingBar from './components/LoadingBar.jsx'
import Header from './components/Header.jsx'
import SidebarDetail from './components/SidebarDetail.jsx'

// Camera reset component - modified to be more flexible
function CameraReset({ resetPosition = [-105, 85, 25], shouldReset = false, viewMode }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (shouldReset && viewMode === "overall") {
      console.log("%c📷 Resetting camera to overview position", "background: #009688; color: white; padding: 4px 8px; border-radius: 4px;");
      camera.position.set(resetPosition[0], resetPosition[1], resetPosition[2]);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
    // We don't reset for detail view - it's handled by BuildingDetailView
  }, [shouldReset, camera, resetPosition, viewMode]);
  
  return null;
}

function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showSun, setShowSun] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraMode, setCameraMode] = useState("perspective"); // Changed from "orbit" to "perspective"
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState("overall"); // "overall" or "detail"
  const [detailBuildingId, setDetailBuildingId] = useState(null);
  const [resetCamera, setResetCamera] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showEscapeHint, setShowEscapeHint] = useState(false);

  // Add state to track window size for orthographic camera
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleObjectClick = useCallback((object) => {
    // Check if we received a valid object
    if (!object) {
      console.error("handleObjectClick called with null/undefined object");
      return;
    }
    
    // Check if this is a room in building detail view
    if (object.userData?.inDetailView) {
      console.log("%c🚪 Room clicked in detail view", "background: #9C27B0; color: white; padding: 4px 8px; border-radius: 4px;");
      setIsTransitioning(true);
      setSelectedRoom(object);
      
      // Clear transition state after update completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
      return;
    }
    
    // Regular building click in overview mode
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
    // Do nothing - camera mode switching is disabled
    console.log("Camera mode switching is currently disabled");
  }, []);

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

  // New handler for switching to detailed building view - using updated naming convention
  const handleViewBuildingDetail = useCallback((buildingId) => {
    console.log(`%c🏢 Switching to detailed view of building ${buildingId}`, 
      `background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;`);
    
    // Trigger camera reset
    setResetCamera(true);
    
    setDetailBuildingId(buildingId);
    setViewMode("detail");
    
    // Clear reset flag after a moment
    setTimeout(() => setResetCamera(false), 100);
  }, []);

  // Handler to return to the overall view
  const handleReturnToOverview = useCallback(() => {
    console.log("%c🔍 Returning to overall view", 
      `background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px;`);
    
    // Trigger camera reset
    setResetCamera(true);
    
    setViewMode("overall");
    setDetailBuildingId(null);
    
    // Clear reset flag after a moment
    setTimeout(() => setResetCamera(false), 100);
  }, []);

  // Reset selected room when going back to overview
  useEffect(() => {
    if (viewMode === "overall") {
      setSelectedRoom(null);
    }
  }, [viewMode]);

  // Handle escape key press to clear selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        console.log("%c🔄 Escape key pressed - clearing selection", 
          "background: #FF5722; color: white; padding: 4px 8px; border-radius: 4px;");
        
        // Clear selected object in overview mode
        setSelectedObject(null);
        
        // Clear selected room in detail view
        setSelectedRoom(null);
        
        // Clear active room label in BuildingDetailView by triggering state reset
        if (viewMode === "detail") {
          // Force a small re-render to clear any active labels in child components
          setIsTransitioning(true);
          setTimeout(() => setIsTransitioning(false), 10);
        }

        // Show escape hint
        setShowEscapeHint(true);
        setTimeout(() => setShowEscapeHint(false), 3000);
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode]); // Only re-add if viewMode changes

  // Show ESC key hint when an object is selected - pass to ToggleSceneControl instead
  useEffect(() => {
    if (selectedObject || selectedRoom) {
      setShowEscapeHint(true);
      // Hide the hint after 3 seconds
      const timer = setTimeout(() => setShowEscapeHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedObject, selectedRoom]);

  // Determine if we should show content based on loading progress
  const showContent = isModelLoaded;

  // Add state to store camera settings with better defaults
  const [cameraSettings, setCameraSettings] = useState({
    position: [-105, 85, 25],
    target: [0, 0, 0],
    zoom: 5
  });

  // Improve orthographic camera settings
  const orthographicSettings = useRef({
    zoom: 20, // Increased base zoom level
    frustumSize: 300, // Increased frustum size for better visibility
    near: 0.1,  // Much closer near plane
    far: 10000   // Much further far plane to ensure all objects are visible
  });

  // Handle camera updates
  const handleCameraUpdate = useCallback((camera) => {
    try {
      // Calculate camera target
      const target = new THREE.Vector3();
      camera.getWorldDirection(target);
      target.multiplyScalar(-100).add(camera.position); // Extend in opposite direction
      
      setCameraSettings({
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [target.x, target.y, target.z],
        zoom: camera.zoom || 5
      });
      
      if (debugMode) {
        console.log("Camera updated:", {
          position: camera.position.toArray(),
          target: target.toArray(),
          zoom: camera.zoom,
          mode: cameraMode
        });
      }
    } catch (error) {
      console.error("Error updating camera settings:", error);
    }
  }, [cameraMode, debugMode]);

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
      
      {/* The 3D scene - with only perspective camera */}
      <Canvas
        ref={canvasRef}
        onClick={clearSelection}
        style={{ 
          touchAction: 'none',
          visibility: showContent ? 'visible' : 'hidden' // Hide canvas when loading
        }}
        shadows
        camera={{ position: [-105, 85, 25], fov: 50 }} // Set default camera
      >
        {/* Only use PerspectiveCamera */}
        <PerspectiveCamera 
          makeDefault
          position={cameraSettings.position} 
          fov={50}
          near={1}
          far={10000} // Much further far plane
        />
        
        <CameraReset 
          resetPosition={[-105, 85, 25]} 
          shouldReset={resetCamera} 
          viewMode={viewMode} 
        />
        <CameraControls mode="perspective" />
        
        {/* Render different content based on the current view mode */}
        {viewMode === "overall" ? (
          <LoadModel 
            onObjectClick={handleObjectClick} 
            showLabels={showLabels} 
            debug={debugMode}
            onLoadingProgress={handleLoadingProgress} 
          />
        ) : (
          <BuildingDetailView
            buildingId={detailBuildingId}
            debug={debugMode}
            onObjectClick={handleObjectClick}
          />
        )}
        <LightScene showSun={showSun} />
      </Canvas>
      
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
          showEscapeHint={showEscapeHint} // Pass the hint state to ToggleSceneControl
        />
      )}
      
      {/* Only show appropriate sidebar when content is loaded */}
      {showContent && viewMode === "overall" && (
        <Sidebar 
          selectedObject={selectedObject} 
          isTransitioning={isTransitioning}
          onViewBuildingDetail={handleViewBuildingDetail}
          currentViewMode={viewMode}
        />
      )}
      
      {/* Detail view sidebar */}
      {showContent && viewMode === "detail" && (
        <SidebarDetail 
          selectedRoom={selectedRoom}
          buildingId={detailBuildingId} 
          isTransitioning={isTransitioning}
          onReturnToOverview={handleReturnToOverview}
        />
      )}
    </>
  )
}

export default App