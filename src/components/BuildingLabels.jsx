import BuildingLabel from './BuildingLabel';

// Main component to render all building labels
export default function BuildingLabels({ labels, showLabels = true, debug = false }) {
  if (!showLabels || !labels || labels.length === 0) {
    return null;
  }

  return (
    <>
      {labels.map((building, index) => (
        <group key={`label-group-${index}`}>
          {/* Debug marker at building position */}
          <mesh 
            key={`debug-${index}`} 
            position={[building.position.x, building.position.y, building.position.z]} 
            scale={debug ? 0 : 0} // Show tiny debug spheres when in debug mode
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="red" />
          </mesh>
          
          {/* Label positioned above the building */}
          <group 
            key={`label-container-${index}`} 
            position={[building.position.x, building.position.y, building.position.z]}
          >
            <BuildingLabel
              key={`label-${index}`}
              name={building.name}
              userData={building.userData}
              debug={debug}
            />
          </group>
        </group>
      ))}
    </>
  );
}
