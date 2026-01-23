import { useEffect, useRef } from 'react';
import { useDroneStore } from '../store/droneStore';

export const useKeyboardControls = (socket) => {
  const droneId = useDroneStore((state) => state.droneId);
  const keyStatesRef = useRef({});

  // Track key states
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keyStatesRef.current[key] = true;

      // Handle arrow keys specifically
      if (e.key === 'ArrowUp') keyStatesRef.current['arrowup'] = true;
      if (e.key === 'ArrowDown') keyStatesRef.current['arrowdown'] = true;
      if (e.key === 'ArrowLeft') keyStatesRef.current['arrowleft'] = true;
      if (e.key === 'ArrowRight') keyStatesRef.current['arrowright'] = true;

      // Prevent default for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Single-press actions (ignore key hold repeat)
      if (e.repeat) return;

      if (key === 'l' && socket && droneId) {
        socket.emit('log_anchor', { drone_id: droneId });
      }
      if (key === '[' && socket && droneId) {
        socket.emit('adjust_jam', { drone_id: droneId, delta: -5 });
      }
      if (key === ']' && socket && droneId) {
        socket.emit('adjust_jam', { drone_id: droneId, delta: 5 });
      }

      // UI Toggles (Consolidated from App.jsx)
      // Toggle HUD with 'H'
      if (key === 'h') {
        useDroneStore.setState((state) => ({ showHUD: !state.showHUD }));
      }
      // Toggle debug with 'D'
      if (key === 'd') {
        useDroneStore.setState((state) => ({ showDebug: !state.showDebug }));
      }
      // Cycle camera mode with 'C'
      if (key === 'c') {
        const modes = ['fpv', 'follow', 'orbit'];
        const currentMode = useDroneStore.getState().camera.mode;
        const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
        useDroneStore.setState((state) => ({
          camera: { ...state.camera, mode: nextMode }
        }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keyStatesRef.current[key] = false;

      if (e.key === 'ArrowUp') keyStatesRef.current['arrowup'] = false;
      if (e.key === 'ArrowDown') keyStatesRef.current['arrowdown'] = false;
      if (e.key === 'ArrowLeft') keyStatesRef.current['arrowleft'] = false;
      if (e.key === 'ArrowRight') keyStatesRef.current['arrowright'] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [socket, droneId]);

  // Send controls at fixed interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      const keys = keyStatesRef.current;

      // Arrow keys for movement (matching Python reference)
      let forward = 0;
      let yaw = 0;
      let throttle = 0;

      // Up/Down for forward/reverse
      if (keys['arrowup'] || keys['w']) forward = 1;
      if (keys['arrowdown'] || keys['s']) forward = -1;

      // Left/Right for rotation
      if (keys['arrowleft'] || keys['a']) yaw = 1;   // Turn left
      if (keys['arrowright'] || keys['d']) yaw = -1; // Turn right

      // Space for emergency brake (sets speed to near zero)
      if (keys[' ']) {
        forward = 0;
        // Emit brake command handled by speed *= 0.2 in backend
      }

      // Shift for altitude down, Space (when not braking) for altitude up
      if (keys['shift']) throttle = 0.3;
      if (keys[' '] && !keys['shift']) throttle = 0.7;  // Space = up when not braking

      // Send to backend
      if (socket && droneId) {
        socket.emit('set_controls', {
          drone_id: droneId,
          forward: forward,
          yaw: yaw,
          throttle: throttle
        });
      }

      // Update local store for HUD display
      useDroneStore.setState({
        controls: {
          forward,
          yaw,
          throttle,
          pitch: 0,
          roll: 0,
          yaw_rate: 0
        }
      });
    }, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [socket, droneId]);

  return keyStatesRef.current;
};
