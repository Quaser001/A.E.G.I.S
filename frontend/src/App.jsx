import React, { useEffect, useRef } from 'react';
import { useSocketIO } from './hooks/useSocketIO';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { DroneScene } from './components/DroneScene';
import { HUD } from './components/HUD';
import { useDroneStore } from './store/droneStore';
import './App.css';

function App() {
  const sceneRef = useRef(null);
  const socket = useSocketIO();
  const keyboardControls = useKeyboardControls(socket);
  const showHUD = useDroneStore((state) => state.showHUD);
  const connectionStatus = useDroneStore((state) => state.connectionStatus);
  const [showSplash, setShowSplash] = React.useState(true);

  const handleInitialize = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    // Store socket in window for access from other components
    window.socket = socket;
  }, [socket]);


  return (
    <div className="app">
      {showSplash ? (
        <div className="splash-screen">
          <div className="splash-content">
            <div className="splash-title">A.E.G.I.S</div>
            <div className="splash-subtitle">Autonomous EW-resilient Guidance and Integrity System</div>
            <button className="splash-button" onClick={handleInitialize}>
              [ INITIALIZE SYSTEM ]
            </button>
          </div>
          <div className="splash-footer">Created for Advanced Drone Defense Operations</div>
        </div>
      ) : (
        <div className="container">
          <DroneScene ref={sceneRef} socket={socket} />
          {showHUD && <HUD socket={socket} />}
          <div className="connection-indicator">
            <div className={`status-dot ${connectionStatus}`}></div>
            <span>{connectionStatus.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
