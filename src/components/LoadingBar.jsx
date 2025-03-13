import React, { useEffect, useState } from 'react';

const LoadingBar = ({ progress = 0, isModelLoaded = false }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isModelLoaded) {
      setIsComplete(true);
      // Hide loading bar after animation completes
      setTimeout(() => setIsVisible(false), 1000);
    }
  }, [isModelLoaded]);

  if (!isVisible) return null;
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '300px',
        textAlign: 'center'
      }}>
        <div style={{
          color: 'black',
          marginBottom: '8px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Loading scene... {progress}%
        </div>
        <div style={{
          width: '100%',
          height: '5px',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: isComplete ? '#4CAF50' : '#2196F3', // Blue while loading, green when complete
            transform: isComplete ? 'scaleX(1.1)' : 'scaleX(1)',
            borderRadius: '4px',
            transition: isComplete ? 'all 0.5s ease-in-out' : 'width 0.3s ease-in-out'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;
