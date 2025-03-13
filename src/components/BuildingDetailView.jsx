import React, { useState, useEffect, useRef } from 'react';
import { Html } from "@react-three/drei";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useThree } from '@react-three/fiber';

export default function BuildingDetailView({ buildingId, debug = false, onObjectClick }) {
  const modelRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoadFailed, setModelLoadFailed] = useState(false);
  const lastSelected = useRef(null);
  const loaderRef = useRef(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const modelLoaded = useRef(false); // Add this to track if model is already loaded
  
  // Define a palette of 10 light colors for rooms
  const colorPalette = [
    new THREE.Color(0xAED6F1), // Light blue
    new THREE.Color(0xD5F5E3), // Light green
    new THREE.Color(0xFADBD8), // Light red
    new THREE.Color(0xF9E79F), // Light yellow
    new THREE.Color(0xD2B4DE), // Light purple
    new THREE.Color(0xF5CBA7), // Light orange
    new THREE.Color(0xEBDEF0), // Lavender
    new THREE.Color(0xE8DAEF), // Thistle
    new THREE.Color(0xCFF5E7), // Mint
    new THREE.Color(0xFFE5D8)  // Peach
  ];
  
  // Get a random color from the palette
  const getRandomColor = () => {
    const index = Math.floor(Math.random() * colorPalette.length);
    return colorPalette[index];
  };
  
  // Materials defined as refs to avoid recreation on each render
  const defaultMaterial = useRef(new THREE.MeshStandardMaterial({
    color: getRandomColor(),
    roughness: 0.7,
    metalness: 0.2,
    transparent: true,
    opacity: 0.5,
  }));
  
  const highlightMaterial = useRef(new THREE.MeshStandardMaterial({
    color: 0x87cefa,
    transparent: true,
    opacity: 0.7,
    emissive: 0x0044aa,
    emissiveIntensity: 1
  }));
  
  // Path to the detailed building model - Use relative path for local compatibility
  const modelPath = `./assets/models/buildingDetail/ar${buildingId}.glb`;

  // Format room name for display
  const formatRoomName = (name) => {
    if (!name) return "Unknown Room";
    return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Create a simple placeholder cube
  const createPlaceholderCube = () => {
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(10, 8, 10);
    const material = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e,
      roughness: 0.7,
      metalness: 0.2,
      transparent: true,
      opacity: 0.8,
    });
    
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 4;
    // Disable shadows for the placeholder too
    cube.castShadow = false;
    cube.receiveShadow = false;
    cube.name = `placeholder_ar${buildingId}`;
    cube.userData = { 
      buildingId,
      clickable: true,
      inDetailView: true
    };
    
    group.add(cube);
    return group;
  };

  // Handle click on rooms/objects
  const handleClick = React.useCallback((event) => {
    event.stopPropagation();
    
    if (!event.object || !event.object.isMesh) return;
    
    // Find the actual mesh
    let targetObject = event.object;
    
    // Log detailed information about the clicked object
    console.group("%c🔍 Room Click Details", "background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;");
    console.log("Room name:", targetObject.name);
    console.log("Room UUID:", targetObject.uuid);
    console.log("Room position:", {
      x: targetObject.position.x.toFixed(2),
      y: targetObject.position.y.toFixed(2),
      z: targetObject.position.z.toFixed(2)
    });
    console.log("Room userData:", targetObject.userData);
    console.log("Click point:", {
      x: event.point.x.toFixed(2),
      y: event.point.y.toFixed(2),
      z: event.point.z.toFixed(2)
    });
    console.log("Room geometry type:", targetObject.geometry.type);
    console.log("Room material:", targetObject.material);
    console.groupEnd();
    
    // Reset previous selected object's material
    if (lastSelected.current && lastSelected.current !== targetObject && lastSelected.current.isMesh) {
      lastSelected.current.material = defaultMaterial.current.clone();
      lastSelected.current.material.needsUpdate = true;
    }
    
    // Update current selection
    lastSelected.current = targetObject;
    
    // Apply highlight material
    targetObject.material = highlightMaterial.current.clone();
    targetObject.material.needsUpdate = true;
    
    // Update the active room for label display
    // Use the click point rather than the object position for better label placement
    const roomID = targetObject.name;
    
    // Set active room with click point position
    setActiveRoom({
      name: roomID,
      // Use the click point from the event for more precise label placement
      position: event.point.clone().add(new THREE.Vector3(0, 0.5, 0)) // Slightly above click point
    });
    
    // Send object data to parent component
    if (onObjectClick) {
      const cleanObject = {
        name: targetObject.name,
        type: "room",
        uuid: targetObject.uuid,
        userData: {
          roomID: targetObject.name, // Changed from roomName to roomID
          buildingId: buildingId,
          roomType: targetObject.userData?.roomType || "Unknown",
          floor: targetObject.userData?.floor || "Unknown",
          capacity: targetObject.userData?.capacity || "Unknown",
          inDetailView: true
        },
        position: {
          x: targetObject.position.x,
          y: targetObject.position.y,
          z: targetObject.position.z
        }
      };
      
      onObjectClick(cleanObject);
    }
  }, [buildingId, onObjectClick]);

  // Get access to the camera and other Three.js objects
  const { camera } = useThree();

  // Load the model or create a placeholder
  useEffect(() => {
    // Clean up function for removing objects and disposing resources
    const cleanupRef = () => {
      if (modelRef.current) {
        while (modelRef.current.children.length > 0) {
          const child = modelRef.current.children[0];
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
          modelRef.current.remove(child);
        }
      }
    };
    
    // If model is already loaded, don't show loading indicator again
    if (modelLoaded.current) {
      setIsLoading(false);
      return;
    }
    
    // Clean up before loading new model
    cleanupRef();
    setIsLoading(true);
    setModelLoadFailed(false);
    
    // Create loader
    loaderRef.current = new GLTFLoader();

    console.log(`Attempting to load model from: ${modelPath}`);
    
    // Add better error handling with try-catch
    try {
      // Load the model
      loaderRef.current.load(
        modelPath,
        // Success callback
        (gltf) => {
          console.log(`Successfully loaded model: ${modelPath}`);
          if (!modelRef.current) return;
          
          const modelScene = gltf.scene.clone();
          
          // Process all meshes
          modelScene.traverse((node) => {
            if (node.isMesh) {
              // Disable shadows for building detail view
              node.castShadow = false;
              node.receiveShadow = false;
              
              // Set userData
              node.userData = {
                ...node.userData,
                roomName: node.name,
                buildingId: buildingId,
                clickable: true,
                inDetailView: true
              };
              
              // Set material with color from our palette
              node.material = new THREE.MeshStandardMaterial({
                color: getRandomColor(),
                transparent: true,
                opacity: 0.5,
                roughness: 0.7,
                metalness: 0.2
              });
              
              node.material.needsUpdate = true;
            }
          });
          
          // Calculate bounding box of entire model
          const boundingBox = new THREE.Box3().setFromObject(modelScene);
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          
          // Get model dimensions for debugging
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          
          if (debug) {
            console.log(`Model bounding box:`, {
              min: boundingBox.min,
              max: boundingBox.max,
              size: size,
              center: center
            });
          }
          
          // Center the model in X-Z plane (keep Y as is to maintain correct floor level)
          modelScene.position.x = -center.x;
          modelScene.position.z = -center.z;
          // Y position might need adjustment based on your specific models
          // modelScene.position.y = -boundingBox.min.y; // Option to place bottom at y=0
          
          // Add to scene
          modelRef.current.add(modelScene);
          setIsLoading(false);
          modelLoaded.current = true; // Mark as loaded
          
          // Calculate optimal camera position based on model size
          adjustCameraToFitModel(boundingBox, size);
          
          // Create a bounding box helper in debug mode
          if (debug) {
            const boxHelper = new THREE.Box3Helper(boundingBox, 0xff0000);
            modelRef.current.add(boxHelper);
          }
        },
        // Progress callback
        (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          console.log(`Loading model ${percent}% (${progress.loaded}/${progress.total})`);
        },
        // Error callback with improved error reporting
        (error) => {
          console.error(`Error loading model: ${modelPath}`, error);
          console.error("Full error details:", {
            message: error.message,
            stack: error.stack,
            target: error.target,
            type: error.type
          });
          
          // On error, use placeholder
          if (modelRef.current) {
            console.log("Using placeholder model due to loading failure");
            const placeholder = createPlaceholderCube();
            
            // Also disable shadows for the placeholder cube
            placeholder.traverse((node) => {
              if (node.isMesh) {
                node.castShadow = false;
                node.receiveShadow = false;
              }
            });
            
            modelRef.current.add(placeholder);
          }
          setModelLoadFailed(true);
          setIsLoading(false);
          modelLoaded.current = true; // Mark as loaded even if it's a placeholder
        }
      );
    } catch (err) {
      console.error("Exception trying to load model:", err);
      // Handle the exception case
      if (modelRef.current) {
        const placeholder = createPlaceholderCube();
        modelRef.current.add(placeholder);
      }
      setModelLoadFailed(true);
      setIsLoading(false);
      modelLoaded.current = true;
    }
    
    // Cleanup function
    return () => {
      loaderRef.current = null;
      cleanupRef();
      lastSelected.current = null;
      // Don't reset modelLoaded.current to preserve the loaded state
    };
  }, [buildingId, debug, modelPath, camera]);

  // Function to adjust camera position based on model size
  const adjustCameraToFitModel = (boundingBox, size) => {
    if (!camera) return;
    
    // Calculate the model's largest dimension to determine camera distance
    const maxDimension = Math.max(size.x, size.z);
    const modelHeight = size.y;
    
    // Calculate a suitable distance based on the model's size
    const distanceFactor = 1.5; 
    const distance = Math.max(maxDimension, modelHeight) * distanceFactor;
    
    // Calculate camera position - start with a 45-degree angle view
    const cameraX = -distance * 0.7;
    const cameraY = distance * 0.7;
    const cameraZ = distance * 0.7;
    
    // Update camera position and target
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    
    if (debug) {
      console.log("Adjusted camera position:", {
        position: camera.position,
        distance: distance,
        maxDimension: maxDimension,
        modelHeight: modelHeight
      });
    }
  };

  // Add a handler to clear selection on ESC key (as a backup to App-level handler)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lastSelected.current) {
        console.log("%c🔄 Escape key pressed in Building Detail View", 
          "background: #FF5722; color: white; padding: 4px 8px; border-radius: 4px;");
          
        // Reset material of selected object
        if (lastSelected.current && lastSelected.current.isMesh) {
          lastSelected.current.material = defaultMaterial.current.clone();
          lastSelected.current.material.needsUpdate = true;
        }
        
        // Clear selection reference
        lastSelected.current = null;
        
        // Clear active room
        setActiveRoom(null);
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <group ref={modelRef} position={[0, 0, 0]} onClick={handleClick}>
      {/* Loading indicator - Only show during initial loading, not during camera mode changes */}
      {isLoading && !modelLoaded.current && (
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[5, 5, 5]} />
          <meshBasicMaterial color="#cccccc" wireframe />
        </mesh>
      )}
      
      {/* Placeholder text label when model fails to load */}
      {modelLoadFailed && (
        <Html position={[0, 12, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            userSelect: 'none',
            pointerEvents: 'none',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Building AR{buildingId}
            <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '3px' }}>
              (Model not available)
            </div>
          </div>
        </Html>
      )}
      
      {/* Active room label - now positioned at click point with roomID */}
      {activeRoom && (
        <Html
          position={[activeRoom.position.x, activeRoom.position.y, activeRoom.position.z]}
          center
          occlude={false}
          style={{
            padding: '4px 8px',
            backgroundColor: 'rgba(0, 30, 60, 0.8)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            fontWeight: 'bold',
            // Add a subtle shadow for better visibility
            textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {/* Display as roomID instead of formatted name */}
          {activeRoom.name}
        </Html>
      )}
      
      {/* Debug helpers */}
      {debug && (
        <>
          <axesHelper args={[10]} />
          <gridHelper args={[20, 20, 0x444444, 0x888888]} />
        </>
      )}
    </group>
  );
}
