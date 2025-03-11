import { useState } from 'react';
import './css/ToggleSceneControl.css';

export default function ToggleSceneControl({ onToggleLabels, onToggleSun, onToggleDebug }) {
  const [showLabels, setShowLabels] = useState(true);
  const [showSun, setShowSun] = useState(true);
  const [debug, setDebug] = useState(false);

  const handleToggleLabels = () => {
    const newState = !showLabels;
    setShowLabels(newState);
    onToggleLabels(newState);
  };

  const handleToggleSun = () => {
    const newState = !showSun;
    setShowSun(newState);
    onToggleSun(newState);
  };
  
  const handleToggleDebug = () => {
    const newState = !debug;
    setDebug(newState);
    onToggleDebug(newState);
  };

  return (
    <div className="toggle-controls-container">
      <button
        onClick={handleToggleLabels}
        className={`toggle-control-button ${showLabels ? 'active' : 'inactive'}`}
        title="Toggle Building Labels"
      >
        L
      </button>
      <button
        onClick={handleToggleDebug}
        className={`toggle-control-button ${debug ? 'active' : 'inactive'}`}
        title="Toggle Debug Mode"
      >
        D
      </button>
      <button
        onClick={handleToggleSun}
        className={`toggle-control-button ${showSun ? 'active' : 'inactive'}`}
        title="Toggle Sun/Shadows"
      >
        S
      </button>
    </div>
  );
}
