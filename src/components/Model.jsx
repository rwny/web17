import { useEffect, useRef, useCallback, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useModelData } from '../hooks/useModelData';
import BuildingLabels from './BuildingLabels';

export default function LoadModel({ onObjectClick, showLabels = true }) {
   console.log('Model component rendering');
   const modelRef = useRef();
   const sceneRef = useRef();

   // Update the path to use src folder instead of public
   const { scene } = useGLTF('./assets/models/ar00.glb');
   const { modelData, isLoading, error } = useModelData('./assets/data/model01.json');
   
   const [objectMappings, setObjectMappings] = useState(new Map());
   const [buildingLabels, setBuildingLabels] = useState([]);
   
   // Store references to objects and materials
   const defaultMaterials = useRef(new Map());
   const lastSelected = useRef(null);
   const isInitialized = useRef(false);
   
   // Define materials once to reuse
   const defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
   });
   
   // Create a brighter highlight material for better visibility
   const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x87CEFA,
      transparent: true,
      opacity: 0.5,
      roughness: 1,
      metalness: 0,
      emissive: 0x0044aa,
      emissiveIntensity: 0.8,
      side: THREE.DoubleSide,
   });
   
   // Extract object ID from name (ar + number)
   const getObjectId = (name) => {
      if (!name) return null;
      console.log("🔍 Extracting ID from object name:", name);
      
      // Match the pattern ar followed by numbers (12, 13, 14, etc.)
      const match = name.match(/ar(\d+)/i);
      
      if (match) {
         // Get just the number part without the "ar" prefix
         const id = match[1];
         console.log(`ID extracted: ${id}`);
         return id;
      }
      
      console.log("No ID found in name");
      return null;
   };
   
   // Function to check if an object is clickable
   const isClickable = useCallback((object) => {
      // Check if the object name starts with 'ar'
      return object.name && object.name.toLowerCase().startsWith('ar');
   }, []);

   // Log model data when it changes
   useEffect(() => {
      if (!isLoading && !error) {
         console.log("📊 Model data ready to use:", modelData);
         console.log("📊 Data keys:", Object.keys(modelData));
      }
      if (error) {
         console.error("❌ Error loading model data:", error);
      }
   }, [modelData, isLoading, error]);

   // Initialize scene once when all resources are loaded
   useEffect(() => {
      if (isLoading || error || !scene || isInitialized.current) {
         return;
      }
      
      console.log("🏗️ Initializing scene with model data");
      
      try {
         // Keep a reference to the original scene
         sceneRef.current = scene;
         
         // Collect building objects for labels
         const buildings = [];
         
         // Process the scene meshes and store materials
         scene.traverse((node) => {
            if (node.isMesh) {
               // Create a unique name if none exists
               if (!node.name) node.name = `Part_${node.uuid.slice(0, 8)}`;
               
               // Store original material properties
               const originalMaterial = node.material.clone();
               defaultMaterials.current.set(node.uuid, originalMaterial);
               
               // Set shadows
               node.castShadow = true;
               node.receiveShadow = true;
               
               // Apply appropriate default material based on clickability
               if (isClickable(node)) {
                  node.material = defaultMaterial.clone();
               } else {
                  const nonClickableMat = defaultMaterial.clone();
                  nonClickableMat.opacity = 0.5;
                  nonClickableMat.color.set(0xdddddd);
                  node.material = nonClickableMat;
               }
               
               // Set material update flag
               node.material.needsUpdate = true;
               
               // Add userData
               const objectId = getObjectId(node.name);
               let objectData = null;
               if (objectId && modelData) {
                  objectData = modelData[objectId];
               }
               
               node.userData = {
                  clickable: isClickable(node),
                  objectId,
                  modelData: objectData
               };
               
               // If this is a clickable building, add to our labels array
               if (isClickable(node)) {
                  // Make sure geometry is ready for calculations
                  if (!node.geometry.boundingBox) {
                    node.geometry.computeBoundingBox();
                  }
                  
                  // Step 1: Get the bounding box dimensions
                  const boundingBox = node.geometry.boundingBox.clone();
                  
                  // Step 2: Create a position for the center top of the bounding box in local space
                  const topCenterLocal = new THREE.Vector3(
                    (boundingBox.min.x + boundingBox.max.x) / 2, // Center X
                    boundingBox.max.y, // Top Y
                    (boundingBox.min.z + boundingBox.max.z) / 2  // Center Z
                  );
                  
                  // Step 3: Convert the local position to world space
                  node.updateWorldMatrix(true, false);
                  const topCenterWorld = topCenterLocal.clone().applyMatrix4(node.matrixWorld);
                  
                  console.log(`Creating label for ${node.name} at position:`, {
                    x: topCenterWorld.x,
                    y: topCenterWorld.y,
                    z: topCenterWorld.z
                  });
                  
                  // Add to buildings array with exact top center position
                  buildings.push({
                    name: node.name,
                    position: {
                      x: topCenterWorld.x,
                      y: topCenterWorld.y,
                      z: topCenterWorld.z
                    },
                    userData: node.userData
                  });
                }
            }
         });
         
         // Update building labels state
         console.log("📍 Building labels created:", buildings.length);
         console.log("Label data:", buildings);
         setBuildingLabels(buildings);
         
         // Set initialization flag
         isInitialized.current = true;
         console.log("✅ Scene initialization complete");
         
      } catch (err) {
         console.error("❌ Error initializing scene:", err);
      }
      
   }, [scene, modelData, isLoading, error, isClickable, getObjectId]);

   const handleClick = useCallback((event) => {
      // We need to prevent event bubbling
      event.stopPropagation();
      
      if (!event.object) return;
      
      console.log("%c📌 Object Click Detected", "background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;");
      
      // Find the actual mesh - sometimes the click is on a parent
      let targetObject = event.object;
      
      // If we clicked on a non-mesh parent object, find a mesh child
      if (!targetObject.isMesh) {
         let meshFound = false;
         targetObject.traverse((child) => {
            if (!meshFound && child.isMesh) {
               targetObject = child;
               meshFound = true;
            }
         });
      }
      
      // If we still don't have a mesh, abort
      if (!targetObject.isMesh) return;
      
      // Check if the object is clickable
      if (!isClickable(targetObject)) {
         console.log("%c⛔ Non-clickable object", "background: #9E9E9E; color: white; padding: 4px 8px; border-radius: 4px;");
         return;
      }
      
      console.log("%c🎯 Selected mesh: " + targetObject.name, "background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px;");
      
      // Reset previous selected object's material
      if (lastSelected.current && lastSelected.current !== targetObject && lastSelected.current.isMesh) {
         const defaultMat = defaultMaterials.current.get(lastSelected.current.uuid);
         if (defaultMat) {
            lastSelected.current.material = defaultMaterial.clone();
            lastSelected.current.material.needsUpdate = true;
         }
      }
      
      // Update current selection
      lastSelected.current = targetObject;
      
      // Apply highlight material
      const highlightMat = highlightMaterial.clone();
      targetObject.material = highlightMat;
      targetObject.material.needsUpdate = true;
      
      // Get object data
      const objectId = getObjectId(targetObject.name);
      let objectData = null;
      if (objectId && modelData) {
         objectData = modelData[objectId];
      }
      
      // Create clean object without circular references
      const cleanObject = {
         name: targetObject.name,
         type: targetObject.type,
         uuid: targetObject.uuid,
         userData: {
            objectId,
            modelData: objectData,
            clickable: true
         },
         position: {
            x: targetObject.position.x,
            y: targetObject.position.y,
            z: targetObject.position.z
         }
      };
      
      // Send object data to parent component
      if (onObjectClick) {
         onObjectClick(cleanObject);
      }
   }, [onObjectClick, modelData, isClickable, getObjectId, highlightMaterial, defaultMaterial]);
   
   // Return the scene with building labels as a separate component
   return (
      <group>
         <primitive 
            object={scene} 
            ref={modelRef}
            onClick={handleClick}
            onPointerMissed={(e) => {
               console.log("Pointer missed");
               e.stopPropagation();
            }}
         />
         
         {/* Using the new BuildingLabels component */}
         <BuildingLabels 
            labels={buildingLabels} 
            showLabels={showLabels}
         />
      </group>
   );
}
