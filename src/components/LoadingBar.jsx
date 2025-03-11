import React from 'react';

const LoadingBar = ({ progress = 0 }) => {
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
            backgroundColor: '#4CAF50', // Green progress bar
            borderRadius: '4px',
            transition: 'width 0.3s ease-in-out'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;
