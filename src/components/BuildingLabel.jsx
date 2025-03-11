import { Html } from "@react-three/drei";

/**
 * Individual building label component that displays above buildings
 * @param {Object} props - Component props
 * @param {Array} props.position - Position coordinates
 * @param {string} props.name - Name of the building (typically containing AR prefix)
 * @param {Object} props.userData - Additional building data
 * @param {boolean} props.debug - Whether to show additional debug information
 */
const BuildingLabel = ({ position, name, userData, debug }) => {
  // Extract building ID (AR + number)
  const buildingId = name ? name.toUpperCase() : "";
  
  // Get the descriptive name from userData if available
  const buildingName = userData?.modelData?.name || "";
  
  return (
    <Html
      position={[0, 0.2, 0]}
      center
      occlude={false}
      style={{
      //   backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'rgba(39, 18, 18, 0.8)',
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

export default BuildingLabel;
