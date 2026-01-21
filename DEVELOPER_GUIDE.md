# KAVACH Drone Simulator - Developer Guide

## 🎯 Project Overview

KAVACH is a full-stack drone flight simulator built with:
- **Frontend**: React 18 + Three.js (3D visualization)
- **Backend**: Flask + Python (Physics simulation)
- **Communication**: WebSocket (Real-time sync)
- **State**: Zustand (React state management)

## 📚 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Frontend)                  │
├─────────────────────────────────────────────────────────┤
│  React App                                              │
│  ├── DroneScene (Three.js rendering)                   │
│  ├── HUD Component (UI display)                        │
│  ├── useSocketIO (WebSocket connection)                │
│  ├── useKeyboardControls (Input handling)              │
│  └── useDroneStore (Zustand state)                     │
└──────────────────┬──────────────────────────────────────┘
                   │ WebSocket
                   │ (Binary frames)
┌──────────────────▼──────────────────────────────────────┐
│                  Flask Server (Backend)                 │
├─────────────────────────────────────────────────────────┤
│  SimulationManager                                      │
│  ├── PhysicsEngine (60 Hz)                             │
│  │   ├── Drone Position/Rotation                       │
│  │   ├── Velocity/Angular Velocity                     │
│  │   ├── Motor Control & Mixing                        │
│  │   ├── Force/Torque Calculation                      │
│  │   └── Battery Management                            │
│  ├── WebSocket Event Handlers                          │
│  └── State Broadcasting                                │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Initialization
```
User Opens Browser
    ↓
React Connects to Backend (WebSocket)
    ↓
Backend Creates Drone Instance
    ↓
Backend Broadcasts Initial State
    ↓
Frontend Displays 3D Scene + HUD
```

### Flight Control Loop (Per Frame)
```
User Press Keys
    ↓
useKeyboardControls Hook
    ↓
Updates Zustand Store
    ↓
Sends via WebSocket: set_controls
    ↓
Backend PhysicsEngine Receives
    ↓
Updates Motor Speeds
    ↓
Calculates Forces/Torques
    ↓
Integrates Physics (Δt = 0.016s)
    ↓
Updates Drone State
    ↓
Broadcasts: drone_update
    ↓
Frontend Receives Update
    ↓
Updates Three.js Scene
    ↓
Renders New Frame (60 FPS)
```

## 🏗️ Code Structure

### Backend: `backend/app.py`

#### PhysicsEngine Class
Core physics simulation for a single drone:

```python
class PhysicsEngine:
    - state: DroneState (position, rotation, velocity, etc.)
    - control_inputs: dict (throttle, pitch, roll, yaw_rate)
    - update(dt): Main physics update
    - _calculate_motor_speeds(): Motor mixing algorithm
    - _calculate_torques(): Torque from motor speeds
    - arm()/disarm(): Flight mode control
    - reset(): Return to initial state
```

**Key Physics:**
- Force equation: F = F_gravity + F_thrust + F_drag
- Acceleration: a = F / mass
- Integration: v_new = v + a * dt
- Position: p_new = p + v * dt
- Rotation matrices: Euler to body frame conversion

#### SimulationManager Class
Manages multiple drone instances:

```python
class SimulationManager:
    - drones: Dict[str, PhysicsEngine]
    - start_simulation(): Begin 60 Hz update loop
    - _simulation_loop(): Main loop with threading
    - add_drone(): Create new drone
    - get_drone(): Retrieve by ID
```

#### WebSocket Events
```
on_connect:      Create drone for client
on_disconnect:   Remove drone
on_arm:          Enable motors
on_disarm:       Disable motors
on_reset:        Return to start
on_set_controls: Update control inputs
on_get_state:    Send current state
```

### Frontend: React Components

#### `DroneScene.jsx`
Three.js 3D visualization:

```jsx
useEffect(() => {
  - Initialize Three.js scene, camera, renderer
  - Create drone 3D model (body, arms, motors, propellers)
  - Set up lighting and shadows
  - Add ground plane and grid
  - Start animation loop
  - Update position/rotation from Zustand
  - Handle camera modes
  - Manage flight trail
})
```

**3D Model:**
- Body: Box geometry (0.3 x 0.15 x 0.3)
- Arms: 4 cylinders at 90° angles
- Motors: Spheres at arm ends
- Propellers: Rotating boxes above motors
- Trail: Line with history of positions

#### `HUD.jsx`
Heads-up display with telemetry:

```jsx
Components:
- Top Left: System status
- Top Right: Battery & altitude
- Bottom Left: Control displays
- Bottom Right: Action buttons
- Center: Artificial horizon
- Bottom Center: Position display
```

#### `DroneScene.jsx` Camera Modes
```javascript
switch(cameraMode) {
  case 'fpv':    // Mounted on drone
  case 'follow': // Chase camera behind drone
  case 'orbit':  // Circle around drone
  case 'free':   // Static observation
}
```

### Hooks

#### `useSocketIO.js`
WebSocket connection management:

```javascript
useEffect(() => {
  - Initialize Socket.io connection
  - Listen for events
  - Update Zustand store
  - Handle connection/disconnection
})
```

#### `useKeyboardControls.js`
Keyboard input handling:

```javascript
useEffect(() => {
  - Track key press/release states
  - Accumulate control inputs gradually
  - Apply decay when keys released
  - Send via WebSocket every frame
  - Update Zustand store
})
```

### State Management: `useDroneStore`

```javascript
State:
- Position, velocity, rotation, angular velocity
- Battery, armed status, flight mode
- Controls (throttle, pitch, roll, yaw_rate)
- Camera settings
- Connection status

Actions:
- updateDroneState(): Update from backend
- setControls(): Set control inputs
- setArmed(): Change armed state
- setCameraMode(): Switch camera view
- toggleHUD(): Show/hide display
```

## 🔌 WebSocket Protocol

### Message Structure
```javascript
// Client → Server
emit('event_name', {
  // event-specific data
})

// Server → Client (broadcast)
emit('event_name', {
  // event-specific data
})
```

### Event Examples

**Arming Drone:**
```javascript
// Client
socket.emit('arm')

// Server response
emit('status', { message: 'Drone armed' })
```

**Setting Controls:**
```javascript
// Client
socket.emit('set_controls', {
  throttle: 0.5,      // 0-1
  pitch: 0.2,         // -1 to 1
  roll: 0.1,          // -1 to 1
  yaw_rate: 0         // -1 to 1
})

// Server broadcasts
emit('drone_update', {
  drone_id: 'session_id',
  state: {
    position: [x, y, z],
    velocity: [vx, vy, vz],
    rotation: [pitch, yaw, roll],
    battery: 95.5,
    armed: true,
    mode: 'STABILIZE'
  }
})
```

## 🎮 Control Flow

### Input → Physics → Rendering

1. **Input Layer** (useKeyboardControls)
   - Track WASD, Space, Q/E keys
   - Build control inputs gradually (0.02 increment)
   - Apply decay when released (0.95 multiplier)

2. **Network Layer** (WebSocket)
   - Send controls via `set_controls` event
   - Receive state via `drone_update` event

3. **Physics Layer** (Backend)
   - Receive control inputs
   - Calculate motor speeds using mixing algorithm
   - Compute torques from motor speeds
   - Integrate forces (gravity, thrust, drag)
   - Update position and rotation
   - Drain battery based on throttle

4. **Rendering Layer** (Three.js)
   - Update drone 3D model position
   - Update drone 3D model rotation
   - Rotate propellers
   - Update camera based on mode
   - Render with lighting and shadows

## 🔧 Motor Mixing Algorithm

Converts 4 control inputs to 4 motor speeds:

```
Input: Throttle (0-1), Pitch (-1 to 1), Roll (-1 to 1), Yaw (-1 to 1)

Motor Mixing Matrix (+ frame):
M1 (Front Right)  = Thr + Pit + Rol - Yaw
M2 (Front Left)   = Thr + Pit - Rol + Yaw
M3 (Back Right)   = Thr - Pit + Rol + Yaw
M4 (Back Left)    = Thr - Pit - Rol - Yaw

Output: Motor speeds (0-1 each)
```

## 📊 Physics Integration

**Euler Method (simplified):**
```
v(t+dt) = v(t) + a(t) * dt
p(t+dt) = p(t) + v(t+dt) * dt
w(t+dt) = w(t) + α(t) * dt  // angular velocity
θ(t+dt) = θ(t) + w(t+dt) * dt  // angle
```

**Battery Drain:**
```
Power = (Throttle / Max) * 2.0 units/sec
Battery -= Power * dt * 0.01
```

## 🎨 Styling

### HUD CSS Classes
- `.hud`: Main container
- `.hud-panel`: Individual panels with border/glow
- `.battery-bar`: Battery visualization
- `.control-bar`: Control input display
- `.action-btn`: Clickable buttons
- `.artificial-horizon`: Pitch/roll indicator
- `.status-dot`: Connection indicator

### Color Scheme
- Primary: `#00ff88` (Cyan-green)
- Accent: `#00ccff` (Light blue)
- Positive: `#00ff00` (Bright green)
- Warning: `#ffaa00` (Orange)
- Alert: `#ff4444` (Red)
- Background: `#0a0e27` (Dark blue)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Drone initializes in center of scene
- [ ] ARM button enables motors
- [ ] Controls respond to keyboard input
- [ ] Camera modes cycle smoothly
- [ ] HUD displays real-time telemetry
- [ ] Battery drains during flight
- [ ] Drone auto-disarms at 0% battery
- [ ] RESET returns to start state
- [ ] Trail follows drone path

### Performance Testing
- [ ] Maintains 60 FPS rendering
- [ ] Physics runs at 60 Hz
- [ ] No memory leaks (check heap)
- [ ] WebSocket messages arrive promptly
- [ ] Trail capped at 500 points

## 🚀 Extending the Project

### Adding New Camera Mode
1. Add to `camera.mode` state in Zustand
2. Add case in DroneScene camera update loop
3. Add UI selector in HUD

### Adding Flight Mode
1. Add to `mode` in DroneState
2. Modify physics behavior based on mode
3. Update HUD display

### Adding UI Panel
1. Create JSX component
2. Style with CSS in HUD.css
3. Add to HUD render

### Adding Physics Feature
1. Modify PhysicsEngine.update()
2. Update force/torque calculations
3. Test stability

## 📝 Code Style

- **Backend**: Python with type hints
- **Frontend**: ES6+ with JSX
- **Comments**: Clear, concise explanations
- **Variables**: camelCase (JS), snake_case (Python)
- **Components**: Functional components with hooks

## 🐛 Debugging Tips

### Backend
```python
# Enable debug logs
print(f"Drone update: pos={position}, battery={battery}")

# Check physics values
print(f"Forces: gravity={gravity}, thrust={thrust}, drag={drag}")
```

### Frontend
```javascript
// Console logs
console.log('Controls:', controls);
console.log('Position:', position);

// React DevTools
// Check Zustand store: useDroneStore.getState()
```

### WebSocket
```javascript
// Socket events
socket.on('*', (eventName, data) => {
  console.log(`Event: ${eventName}`, data);
});
```

## 📚 References

- [Three.js Documentation](https://threejs.org/docs/)
- [Flask-SocketIO](https://python-socketio.readthedocs.io/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Hooks](https://react.dev/reference/react/hooks)
- [NumPy](https://numpy.org/)

## 🎓 Learning Outcomes

By studying this project, you'll learn:
1. Real-time game physics simulation
2. WebSocket communication patterns
3. React hooks and state management
4. Three.js 3D graphics
5. Motor control algorithms
6. Client-server architecture
7. HUD/UI design patterns

---

**Happy coding! 🚀**
