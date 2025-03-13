import { useState, useEffect, useRef } from 'react';
import './css/Sidebar.css';
import { APP_VERSION } from '../config/appVersion';
// asdf

export default function Sidebar({ selectedObject, isTransitioning, onViewBuildingDetail, currentViewMode }) {
  const [objectData, setObjectData] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const previousObjectRef = useRef(null);
  
  // Store the last valid object to prevent flickering
  useEffect(() => {
    if (selectedObject) {
      console.log("📝 Sidebar received new object:", {
        name: selectedObject.name,
        userData: selectedObject.userData
      });
      previousObjectRef.current = selectedObject;
    }
  }, [selectedObject]);
  
  // Handle toggle sidebar visibility
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };
  
  useEffect(() => {
    // Skip updates during transitions to prevent flickering
    if (isTransitioning) {
      return;
    }
    
    // Show sidebar automatically when an object is selected
    if (selectedObject) {
      setIsVisible(true);
    }
    
    // Process object data when not transitioning
    const objectToProcess = selectedObject || (isTransitioning ? previousObjectRef.current : null);
    
    if (!objectToProcess) {
      console.log("No object to process");
      setObjectData(null);
      return;
    }
    
    try {
      // Get the model data from userData
      console.log("Processing object for sidebar:", objectToProcess);
      console.log("Object userData:", objectToProcess.userData);
      
      const data = objectToProcess.userData?.modelData || null;
      console.log("Extracted model data:", data);
      
      setObjectData(data);
    } catch (err) {
      console.error("Error processing selected object:", err);
      setObjectData(null);
    }
  }, [selectedObject, isTransitioning]);
  
  // Handle view building detail button click
  const handleViewDetailClick = () => {
    if (selectedObject && selectedObject.userData && selectedObject.userData.objectId) {
      onViewBuildingDetail(selectedObject.userData.objectId);
    }
  };
  
  // Add toggle button and visibility classes
  const sidebarClasses = `sidebar ${isVisible ? 'visible' : 'hidden'}`;
  
  // Use either the current object or the previous one during transitions
  const displayObject = selectedObject || (isTransitioning ? previousObjectRef.current : null);
  
  // Format building name function
  const formatBuildingName = (name) => {
    if (!name) return "Unknown Building";
    
    // Match the pattern ar + number and convert to uppercase
    const match = name.match(/ar(\d+)/i);
    if (match) {
      return `AR${match[1]}`;
    }
    
    return name;
  };

  // Format building ID function
  const formatBuildingId = (name) => {
    if (!name) return "Unknown";
    
    // Match the pattern ar + number and convert to uppercase
    const match = name.match(/ar(\d+)/i);
    if (match) {
      return `AR${match[1]}`;
    }
    
    return name;
  };
  
  // Debug render
  console.log("Sidebar rendering with:", {
    displayObject: displayObject?.name,
    objectData,
    isVisible
  });
  
  // Early return if truly no object to display
  if (!displayObject) {
    return (
      <>
        <div className={sidebarClasses}>
          <div className="sidebar-header">
            {currentViewMode === "detail" ? "Building Detail View" : "Faculty of Architecture Art and Design"}
          </div>
          <div className="sidebar-content">
            <p>Click on an object to view details</p>
          </div>
          <div className="sidebar-version">{APP_VERSION}</div>
        </div>
        
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          aria-label={isVisible ? "Hide sidebar" : "Show sidebar"}
        >
          {isVisible ? "›" : "‹"}
        </button>
      </>
    );
  }
  
  // Get formatted building name
  const buildingName = formatBuildingName(displayObject.name);

  // Get formatted building ID
  const buildingId = formatBuildingId(displayObject.name);
  
  return (
    <>
      <div className={sidebarClasses}>
        <div className="sidebar-header">
          {buildingId}
          {currentViewMode === "detail" && " - Detailed View"}
        </div>
        <div className="sidebar-content">
          {/* Basic object info */}
          {/* <div className="section-header">Building Information</div> */}

          {/* <div className="property">
            <span className="label">Building ID:</span>
            <span className="value">{displayObject.userData?.objectId || "N/A"}</span>
          </div> */}
          
          {objectData ? (
            <>
              <div className="property">
                <span className="label">Building Name:</span>
                <span className="value">{objectData.name || "Unnamed Building"}</span>
              </div>
              
              <div className="property">
                <span className="label">Description:</span>
                <span className="value">{objectData.description || "No description"}</span>
              </div>
              
              <div className="property">
                <span className="label">Status:</span>
                <span className={`value ${
                  objectData.status === "Active" ? "status-active" : 
                  objectData.status === "Under renovation" ? "status-renovation" : ""
                }`}>
                  {objectData.status || "Unknown"}
                </span>
              </div>
              
              {/* Building specifications */}
              <div className="section-header">Specifications</div>
              {objectData.specs && Object.entries(objectData.specs).map(([key, value]) => (
                <div className="property" key={key}>
                  <span className="label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span className="value">{value}</span>
                </div>
              ))}
              
              {/* Remove the action-buttons div from here */}
            </>
          ) : (
            <div className="property">
              <span className="value error-message">
                No data available for this building.
              </span>
            </div>
          )}
        </div>
        
        {/* Fixed action buttons at bottom of sidebar */}
        {currentViewMode === "overall" && selectedObject && (
          <div className="sidebar-actions">
            <button 
              className="view-detail-btn"
              onClick={handleViewDetailClick}
            >
              See AR{selectedObject.userData?.objectId || ""} Detail
            </button>
          </div>
        )}
        
        {/* Use the centralized version number */}
        <div className="sidebar-version">{APP_VERSION}</div>
      </div>
      
      {/* Toggle Button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label={isVisible ? "Hide sidebar" : "Show sidebar"}
      >
        {isVisible ? "›" : "‹"}
      </button>
    </>
  );
}