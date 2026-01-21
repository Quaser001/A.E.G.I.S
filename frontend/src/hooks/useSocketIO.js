import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDroneStore } from '../store/droneStore';

export const useSocketIO = () => {
  const socketRef = useRef(null);
  const setDroneId = useDroneStore((state) => state.setDroneId);
  const updateDroneState = useDroneStore((state) => state.updateDroneState);
  const updateDoctrineData = useDroneStore((state) => state.updateDoctrineData);
  const setConnectionStatus = useDroneStore((state) => state.setConnectionStatus);
  const setThresholds = useDroneStore((state) => state.setThresholds);

  useEffect(() => {
    console.log('Initializing Socket.IO connection...');

    const socket = io('http://127.0.0.1:5000', {
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      rejectUnauthorized: false
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✓ Connected to backend');
      setConnectionStatus('connected');
    });

    socket.on('connect_error', (error) => {
      console.error('✗ Connection error:', error);
      setConnectionStatus('disconnected');
    });

    socket.on('disconnect', (reason) => {
      console.log('✗ Disconnected from backend:', reason);
      setConnectionStatus('disconnected');
    });

    socket.on('drone_created', (data) => {
      console.log('✓ Drone created:', data.drone_id);
      setDroneId(data.drone_id);
      if (data.initial_state) {
        updateDroneState(data.initial_state);
      }
      if (data.thresholds) {
        setThresholds(data.thresholds);
      }
    });

    socket.on('drone_update', (data) => {
      // Strict ID check to prevent ghosting
      const currentId = useDroneStore.getState().droneId;
      if (currentId && data.drone_id && data.drone_id !== currentId) return;

      if (data.state) {
        updateDroneState(data.state);
      }
      if (data.doctrine) {
        updateDoctrineData(data.doctrine);
      }
    });

    socket.on('status', (data) => {
      const currentId = useDroneStore.getState().droneId;
      if (currentId && data.drone_id && data.drone_id !== currentId) return;
      console.log('Status:', data.message);
    });

    socket.on('anchor_logged', (data) => {
      const currentId = useDroneStore.getState().droneId;
      if (currentId && data.drone_id && data.drone_id !== currentId) return;

      if (data.success) {
        console.log('✓ Anchor logged at:', data.position);
      } else {
        console.log('✗ Cannot log anchor - confidence too low');
      }
    });

    socket.on('error', (error) => {
      console.error('✗ Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [setDroneId, updateDroneState, updateDoctrineData, setConnectionStatus, setThresholds]);

  return socketRef.current;
};

export const useSocketEmit = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = window.socket;
  }, []);

  return {
    emit: (event, data) => {
      if (socketRef.current) {
        socketRef.current.emit(event, data);
      }
    },
    arm: () => {
      if (socketRef.current) {
        socketRef.current.emit('arm');
      }
    },
    disarm: () => {
      if (socketRef.current) {
        socketRef.current.emit('disarm');
      }
    },
    reset: () => {
      if (socketRef.current) {
        socketRef.current.emit('reset');
      }
    }
  };
};
