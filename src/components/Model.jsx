import { useEffect, useRef, useCallback, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useModelData } from '../hooks/useModelData';

export default function LoadModel({ onObjectClick }) {
   console.log('Model component rendering');
   const modelRef = useRef();
   const { scene } = useGLTF('./src/assets/models/ar00.glb');
   // Update the path to use src folder instead of public
   const { modelData, isLoading, error } = useModelData('./src/assets/data/model01.json');
   const [objectMappings, setObjectMappings] = useState(new Map());
   
   // Store references to objects and materials
   const defaultMaterials = useRef(new Map());
   const lastSelected = useRef(null);
   
   // Define materials once to reuse
   const defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.2,
   });
   
   const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.8,
      emissive: 0x113355,
      emissiveIntensity: 0.5
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
   const isClickable = (object) => {
      // Check if the object name starts with 'ar'
      return object.name && object.name.toLowerCase().startsWith('ar');
   };

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

   useEffect(() => {
      if (isLoading || error || !scene) {
         console.log("⏳ Waiting for resources to load:", { 
            dataLoading: isLoading, 
            dataError: error, 
            sceneReady: !!scene 
         });
         return;
      }
      
      console.log("🏗️ Setting up model with data:", modelData);
      console.log("🏗️ Model data keys:", Object.keys(modelData));
      
      // Create a map to store object to data mappings for debugging
      const mappings = new Map();
      
      // Compute bounding boxes for all geometries
      scene.traverse((node) => {
         if (node.isMesh && node.geometry) {
            if (!node.geometry.boundingBox) {
               node.geometry.computeBoundingBox();
            }
         }
      });
      
      // Apply default material to all meshes
      let index = 0;
      scene.traverse((node) => {
         if (node.isMesh) {
            // Create a unique name if none exists
            if (!node.name) node.name = `Part_${index}`;
            
            console.log(`🎯 Processing mesh: ${node.name}`);
            
            // Store a reference to the default material for this mesh
            const clonedDefaultMaterial = defaultMaterial.clone();
            defaultMaterials.current.set(node.uuid, clonedDefaultMaterial);
            
            // Apply the default material
            node.material = clonedDefaultMaterial;
            
            // Ensure the mesh casts and receives shadows
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Add clickable property to userData
            const clickable = isClickable(node);
            console.log(`Clickable: ${clickable}`);
            
            // Extract ID from name and get associated data
            const objectId = getObjectId(node.name);
            console.log(`Object ID: ${objectId || "none"}`);
            
            // Find the data for this object
            let objectData = null;
            if (objectId && modelData) {
               objectData = modelData[objectId];
               console.log(`📎 Data found for ID ${objectId}:`, objectData || "No matching data");
            }
            
            // Store mapping for debugging
            mappings.set(node.name, {
               id: objectId,
               hasData: !!objectData,
               dataKeys: objectData ? Object.keys(objectData) : []
            });
            
            // Add data to userData
            node.userData = {
               clickable,
               objectId,
               modelData: objectData
            };
            
            // Apply a slightly different material for non-clickable objects
            if (!clickable) {
               node.material.opacity = 0.5;
               node.material.color.set(0xdddddd);
            }
            
            index++;
         }
      });
      
      console.log("📑 Object to data mappings:", Object.fromEntries(mappings));
      setObjectMappings(mappings);
      
   }, [scene, modelData, isLoading, error]);

   const handleClick = useCallback((event) => {
      // We need to prevent event bubbling
      event.stopPropagation();
      
      // Check if we have a valid event object
      if (!event.object) {
         console.error("No object in click event");
         return;
      }
      
      console.log("%c📌 Object Click Detected", "background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;");
      console.log("Event details:", {
         object: event.object.name,
         type: event.object.type
      });
      
      // Find the actual mesh - sometimes the click is on a parent
      let targetObject = event.object;
      
      // If we clicked on a non-mesh parent object, find a mesh child
      if (!targetObject.isMesh) {
         console.log("Finding mesh child for non-mesh parent:", targetObject.name || targetObject.type);
         let meshFound = false;
         targetObject.traverse((child) => {
            if (!meshFound && child.isMesh) {
               console.log("Found mesh child:", child.name || child.type);
               targetObject = child;
               meshFound = true;
            }
         });
      }
      
      // If we still don't have a mesh, abort
      if (!targetObject.isMesh) {
         console.error("Could not find a mesh in the clicked object hierarchy");
         return;
      }
      
      // Check if the object is clickable
      if (!isClickable(targetObject)) {
         console.log("%c⛔ Non-clickable object", "background: #9E9E9E; color: white; padding: 4px 8px; border-radius: 4px;");
         console.log("Object name:", targetObject.name);
         return;
      }
      
      console.log("%c🎯 Selected mesh", "background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px;");
      
      // Get object ID and associated data
      const objectId = getObjectId(targetObject.name);
      console.log("Looking for data with ID:", objectId);
      
      // Try to find data for this object ID
      let objectData = null;
      if (objectId && modelData) {
         objectData = modelData[objectId];
         if (objectData) {
            console.log("✅ Found matching data for ID:", objectId, objectData);
         } else {
            console.warn("❓ No matching data found for ID:", objectId);
            console.log("Available IDs:", Object.keys(modelData));
         }
      }
      
      console.log("%c📄 Object Data", "background: #FF5722; color: white; padding: 4px 8px; border-radius: 4px;");
      console.log("Object name:", targetObject.name);
      console.log("Object ID:", objectId);
      console.log("Model data keys:", Object.keys(modelData));
      console.log("Fetch attempt:", objectId ? `modelData[${objectId}]` : "No ID to fetch");
      console.log("Object data found:", objectData);
      
      // Debug mapping
      if (objectMappings.has(targetObject.name)) {
         console.log("Mapping info:", objectMappings.get(targetObject.name));
      }
      
      // Reset previous selected object's material
      if (lastSelected.current) {
         const defaultMat = defaultMaterials.current.get(lastSelected.current.uuid);
         if (defaultMat) {
            console.log("Resetting material for previous object:", lastSelected.current.name);
            lastSelected.current.material = defaultMat;
         }
      }
      
      // Update current selection
      lastSelected.current = targetObject;
      
      // Apply highlight material
      console.log("Applying highlight material to:", targetObject.name);
      targetObject.material = highlightMaterial.clone();
      
      // Create a clean object to pass to parent - THREE.js objects have circular references
      const cleanObject = {
         name: targetObject.name,
         type: targetObject.type,
         uuid: targetObject.uuid,
         userData: {
            objectId,  // This is the ID extracted from the object name
            modelData: objectData,
            clickable: true
         },
         position: {
            x: targetObject.position.x,
            y: targetObject.position.y,
            z: targetObject.position.z
         }
      };
      
      console.log("%c📤 Sending object data to parent", "background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;");
      console.log("Clean object:", cleanObject);
      console.log("userData:", cleanObject.userData);
      
      // Use a timeout to ensure the event completes before passing data
      setTimeout(() => {
         if (onObjectClick) {
            console.log("Calling parent onObjectClick handler");
            onObjectClick(cleanObject);
         }
      }, 0);
   }, [onObjectClick, highlightMaterial, modelData, objectMappings]);

   return (
      <primitive 
         object={scene} 
         ref={modelRef}
         onClick={handleClick}
         onPointerMissed={(e) => {
            console.log("Pointer missed");
            e.stopPropagation();
         }}
      />
   );
}
