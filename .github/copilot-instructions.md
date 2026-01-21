.github/copilot-instructions.md

# KAVACH Drone Simulator - Project Instructions

## Project Overview
Full-stack drone flight simulator with React + Three.js frontend, Flask backend, physics simulation, real-time visualization, and beautiful HUD.

## Completed Steps

### ✅ Project Structure Setup
- Created frontend and backend directories
- Set up proper folder organization for components, hooks, and store

### ✅ Backend Implementation
- Physics engine with realistic quadcopter dynamics
- Flask server with WebSocket support
- Drone simulation manager
- Battery management system
- Real-time state broadcasting

### ✅ Frontend - React & Three.js
- React app with Zustand state management
- Three.js 3D drone visualization
- Real-time scene updates
- Trail visualization
- Multiple camera modes

### ✅ HUD & UI Components
- Sci-fi styled heads-up display
- System status panel
- Battery and telemetry display
- Control indicator visualization
- Artificial horizon
- Action buttons (ARM/DISARM/RESET)

### ✅ Input & Control Systems
- Keyboard control hook (WASD, Space/Shift, Q/E)
- WebSocket communication layer
- Real-time control sending to backend

### ✅ WebSocket Real-time Communication
- Client-server synchronization
- Drone state streaming
- Event-based messaging
- Connection status tracking

### ✅ Documentation & Config
- Comprehensive README
- Vite configuration for frontend
- Flask requirements file
- Environment configuration templates

## Running the Project

### Terminal 1: Backend
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Key Features

1. **3D Drone Visualization**
   - Quadcopter model with 4 propellers
   - Real-time rotation and movement
   - Flight trail visualization
   - Realistic materials and lighting

2. **Physics Simulation**
   - Gravity and drag modeling
   - Motor mixing algorithms
   - Attitude dynamics
   - Battery drain simulation

3. **Flight Controls**
   - Keyboard-based (WASD, Space, Q/E)
   - Smooth decay system
   - Real-time WebSocket sending
   - Arm/Disarm functionality

4. **Beautiful HUD**
   - System status display
   - Battery indicator
   - Telemetry readout
   - Artificial horizon
   - Control visualization
   - Responsive layout

5. **Camera Modes**
   - FPV (First-person view)
   - Follow (Third-person follow)
   - Orbit (Orbital camera)
   - Free (Static observation)

## Technologies Used

- **Frontend**: React 18, Three.js, Zustand, Vite, Socket.io-client
- **Backend**: Flask, Flask-CORS, Flask-SocketIO, NumPy
- **Communication**: WebSocket with Socket.io
- **Physics**: Custom physics engine (NumPy-based)

## Next Steps (Optional Enhancements)

- [ ] Add mouse controls for free camera
- [ ] Implement GPS waypoint system
- [ ] Add wind simulation
- [ ] Obstacle course challenges
- [ ] Flight recording/playback
- [ ] Multi-drone support
- [ ] Advanced control modes
- [ ] Telemetry logging

## Troubleshooting

**Port Already in Use**
- Change Flask port: `socketio.run(app, port=5001)`
- Change Vite port in vite.config.js

**Module Not Found**
- Frontend: `npm install`
- Backend: `pip install -r requirements.txt`

**WebSocket Connection Failed**
- Ensure Flask is running on port 5000
- Check firewall settings
- Verify CORS is enabled

## File Structure Reference

```
Drone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DroneScene.jsx
│   │   │   ├── HUD.jsx
│   │   │   └── HUD.css
│   │   ├── hooks/
│   │   │   ├── useSocketIO.js
│   │   │   └── useKeyboardControls.js
│   │   ├── store/
│   │   │   └── droneStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Notes

- Physics updates at 60 Hz
- Rendering at 60 FPS
- WebSocket for real-time sync
- All drone state stored in Zustand
- Modular component architecture
- Easy to extend and customize

Enjoy the KAVACH Drone Simulator! 🚁
