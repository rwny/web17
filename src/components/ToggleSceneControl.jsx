import { useState } from 'react';
import './ToggleSceneControl.css';

export default function ToggleSceneControl({ onToggleLabels, onToggleSun }) {
  const [showLabels, setShowLabels] = useState(true);
  const [showSun, setShowSun] = useState(true);

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
        onClick={handleToggleSun}
        className={`toggle-control-button ${showSun ? 'active' : 'inactive'}`}
        title="Toggle Sun/Shadows"
      >
        S
      </button>
    </div>
  );
}
