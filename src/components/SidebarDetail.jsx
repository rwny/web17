import { useState, useEffect, useRef } from 'react';
import './css/Sidebar.css';
import { APP_VERSION } from '../config/appVersion';

export default function SidebarDetail({ selectedRoom, buildingId, isTransitioning, onReturnToOverview }) {
  const [isVisible, setIsVisible] = useState(true);
  const previousRoomRef = useRef(null);
  
  // Store the last valid object to prevent flickering
  useEffect(() => {
    if (selectedRoom) {
      console.log("📝 SidebarDetail received new room:", {
        name: selectedRoom.name,
        userData: selectedRoom.userData
      });
      previousRoomRef.current = selectedRoom;
    }
  }, [selectedRoom]);
  
  // Handle toggle sidebar visibility
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };
  
  // Show sidebar automatically when a room is selected
  useEffect(() => {
    if (selectedRoom && !isTransitioning) {
      setIsVisible(true);
    }
  }, [selectedRoom, isTransitioning]);
  
  // Add toggle button and visibility classes
  const sidebarClasses = `sidebar ${isVisible ? 'visible' : 'hidden'}`;
  
  // Use either the current room or the previous one during transitions
  const displayRoom = selectedRoom || (isTransitioning ? previousRoomRef.current : null);
  
  // Clean room name
  const formatRoomName = (name) => {
    if (!name) return "Unknown Room";
    return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Early return if no room to display - but still show the "Return to Overview" button
  if (!displayRoom) {
    return (
      <>
        <div className={sidebarClasses}>
          <div className="sidebar-header">
            Building AR{buildingId} - Detail View
          </div>
          <div className="sidebar-content">
            <p>Click on a room to view details</p>
          </div>
          
          {/* Always show the Return to Overview button */}
          <div className="sidebar-actions">
            <button 
              className="return-to-overview-btn"
              onClick={onReturnToOverview}
            >
              Return to Overview
            </button>
          </div>
          
          {/* Use the centralized version number */}
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
  
  // Format room name
  const roomName = formatRoomName(displayRoom.name);
  
  return (
    <>
      <div className={sidebarClasses}>
        <div className="sidebar-header">
          Room Details - AR{buildingId}
        </div>
        <div className="sidebar-content">
          <div className="property">
            <span className="label">Room Name:</span>
            <span className="value">{roomName}</span>
          </div>
          
          <div className="property">
            <span className="label">Room ID:</span>
            <span className="value">{displayRoom.name}</span>
          </div>
          
          {displayRoom.userData?.roomType && (
            <div className="property">
              <span className="label">Type:</span>
              <span className="value">{displayRoom.userData.roomType}</span>
            </div>
          )}
          
          {displayRoom.userData?.floor && (
            <div className="property">
              <span className="label">Floor:</span>
              <span className="value">{displayRoom.userData.floor}</span>
            </div>
          )}
          
          {displayRoom.userData?.capacity && (
            <div className="property">
              <span className="label">Capacity:</span>
              <span className="value">{displayRoom.userData.capacity} persons</span>
            </div>
          )}
          
          <div className="section-header">Position</div>
          <div className="property">
            <span className="label">X:</span>
            <span className="value">{displayRoom.position?.x.toFixed(2) || "N/A"}</span>
          </div>
          <div className="property">
            <span className="label">Y:</span>
            <span className="value">{displayRoom.position?.y.toFixed(2) || "N/A"}</span>
          </div>
          <div className="property">
            <span className="label">Z:</span>
            <span className="value">{displayRoom.position?.z.toFixed(2) || "N/A"}</span>
          </div>
        </div>
        
        {/* Always show the Return to Overview button */}
        <div className="sidebar-actions">
          <button 
            className="return-to-overview-btn"
            onClick={onReturnToOverview}
          >
            Return to Overview
          </button>
        </div>
        
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
