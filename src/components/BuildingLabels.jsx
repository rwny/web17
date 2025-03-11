import { Html } from "@react-three/drei";

// Individual building label component
const BuildingLabel = ({ position, name, userData, debug }) => {
  // Extract building ID (AR + number)
  const buildingId = name ? name.toUpperCase() : "";
  
  // Get the descriptive name from userData if available
  const buildingName = userData?.modelData?.name || "";
  
  return (
    <Html
      position={[0, 1, 0]}
      center
      occlude={false}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        width: 'auto', // Auto width to fit content
        minWidth: debug ? '80px' : '60px', // Smaller minWidth when not in debug mode
        pointerEvents: 'none',
        textAlign: 'center',
        margin: '0px',
        userSelect: 'none',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}>
        {/* First row - Building ID */}
        <div style={{ marginBottom: debug ? '4px' : '0px' }}>
          {buildingId || "Building"}
        </div>
        
        {/* Second row - Building Name (only shown in debug mode) */}
        {debug && (
          <div> 
            {buildingName || "-"}
          </div>
        )}
      </div>
    </Html>
  );
};

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
