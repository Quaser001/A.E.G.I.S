import { create } from 'zustand';

export const useDroneStore = create((set, get) => ({
  // Drone state
  droneId: null,
  position: [0, 2, 0],
  velocity: [0, 0, 0],
  rotation: [0, 0, 0],
  angularVelocity: [0, 0, 0],
  battery: 100,
  armed: false,
  mode: 'STABILIZE',
  speed: 0,

  // A.E.G.I.S Doctrine state
  gpsJam: 0,
  navConfidence: 100,
  retrogradeActive: false,
  status: 'NOMINAL',  // NOMINAL, WARNING, SAFETY_OVERRIDE, COMMANDER_RTB

  // Doctrine data
  breadcrumbs: [],
  anchors: [],
  targetPoint: null,
  returnQueueLength: 0,

  // Thresholds (from server)
  thresholds: {
    warn: 70,
    reject: 40,
    abort: 10
  },

  // Controls
  controls: {
    forward: 0,
    yaw: 0,
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw_rate: 0
  },

  // Camera
  camera: {
    mode: 'follow', // fpv, follow, orbit
    fov: 75,
    distance: 10
  },

  // UI state
  showHUD: true,
  showDebug: false,
  connectionStatus: 'disconnected',

  // Sound state
  lastWarningLevel: 'NOMINAL',

  // Actions
  setDroneId: (id) => set({ droneId: id }),

  setThresholds: (thresholds) => set({ thresholds }),

  updateDroneState: (state) => set({
    position: state.position,
    velocity: state.velocity,
    rotation: state.rotation,
    angularVelocity: state.angular_velocity,
    battery: state.battery,
    armed: state.armed,
    mode: state.mode,
    speed: state.speed || 0,
    gpsJam: state.gps_jam !== undefined ? state.gps_jam : state.integrity_stress, // Handle legacy
    navConfidence: state.nav_confidence,
    retrogradeActive: state.retrograde_active,
    status: state.status
  }),

  updateDoctrineData: (doctrine) => set({
    breadcrumbs: doctrine.breadcrumbs || [],
    anchors: doctrine.anchors || [],
    targetPoint: doctrine.target_point,
    returnQueueLength: doctrine.return_queue_length || 0
  }),

  setControls: (controls) => set({ controls }),

  updateControl: (key, value) => set((state) => ({
    controls: { ...state.controls, [key]: value }
  })),

  setArmed: (armed) => set({ armed }),

  setCameraMode: (mode) => set((state) => ({
    camera: { ...state.camera, mode }
  })),

  setCameraDistance: (distance) => set((state) => ({
    camera: { ...state.camera, distance: Math.max(2, Math.min(50, distance)) }
  })),

  toggleHUD: () => set((state) => ({ showHUD: !state.showHUD })),

  toggleDebug: () => set((state) => ({ showDebug: !state.showDebug })),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setLastWarningLevel: (level) => set({ lastWarningLevel: level })
}));
