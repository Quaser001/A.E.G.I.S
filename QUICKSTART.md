# A.E.G.I.S Drone Simulator - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Start the Backend

Open a terminal and run:
```bash
cd backend
# Activate venv if not already active
venv\Scripts\activate  # Windows or source venv/bin/activate on Mac/Linux
python app.py
```

You should see:
```
Starting A.E.G.I.S Drone Simulator Backend...
Flask server running on http://localhost:5000
```

### Step 3: Start the Frontend

Open another terminal and run:
```bash
cd frontend
npm run dev
```

You should see:
```
Local:   http://localhost:3000/
```

### Step 4: Open in Browser

Visit http://localhost:3000 in your browser

### Step 5: Start Flying! 🛸

1. Click **ARM** to enable the drone
2. Use **SPACE** to increase throttle
3. Use **W/A/S/D** to control pitch and roll
4. Use **Q/E** to rotate (yaw)
5. Use **SHIFT** to decrease throttle

## 📖 Control Cheat Sheet

| Key | Action |
|-----|--------|
| W / S | Pitch Forward / Backward |
| A / D | Roll Left / Right |
| Q / E | Yaw Left / Right |
| Space | Increase Throttle |
| Shift | Decrease Throttle |
| H | Toggle HUD |
| D | Toggle Debug |
| C | Cycle Camera Mode |

## 🎮 Action Buttons

- **ARM**: Enable motors (throttle minimum)
- **DISARM**: Disable motors
- **RESET**: Return to starting position

## 📊 HUD Panels

### Top Left - System Status
- Current flight mode
- Armed/Disarmed state
- Connection status

### Top Right - Battery & Telemetry
- Battery percentage
- Altitude
- Speed

### Bottom Left - Control Display
- Real-time throttle, pitch, roll values
- Visual feedback bars

### Bottom Right - Actions & Help
- ARM/DISARM buttons
- Reset button
- Keyboard controls reminder

### Center - Artificial Horizon
- Real-time pitch and roll indicator
- Flight attitude display

## 🎥 Camera Modes (Press C to cycle)

1. **FPV** - First-person view from the drone
2. **Follow** - Follow the drone from behind
3. **Orbit** - Circle around the drone
4. **Free** - Static observation camera

## 🔧 Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

**For Backend:**
Edit `backend/app.py` and change:
```python
socketio.run(app, debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
```

**For Frontend:**
Edit `frontend/vite.config.js` and change:
```javascript
server: {
  port: 3001  // Change 3000 to 3001
}
```

### Connection Failed
1. Make sure backend is running on port 5000
2. Check if firewall is blocking connections
3. Ensure CORS is properly configured

### Modules Not Found
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

## 📦 What's Included

✅ Realistic 3D drone visualization with Three.js
✅ Physics engine with gravity, drag, and motor dynamics
✅ Beautiful sci-fi HUD with real-time telemetry
✅ Keyboard flight controls with smooth decay
✅ Multiple camera modes for different perspectives
✅ Real-time WebSocket communication
✅ Battery management system
✅ Flight trail visualization
✅ Arm/Disarm/Reset functionality

## 🎯 Tips for Great Flying

1. **Start Slow** - Use small control inputs to learn handling
2. **Watch Altitude** - Monitor the altitude meter to avoid crashing
3. **Battery Management** - Battery drains with throttle; watch your energy
4. **Smooth Controls** - Jerky inputs = unstable flight; be gentle
5. **Try Different Cameras** - Each mode offers unique perspectives
6. **Use Auto-Level** - The drone stabilizes when you release controls

## 🚀 Next Steps

- Explore waypoint navigation (coming soon)
- Try racing through obstacle courses
- Master FPV flight mode
- Record your flights with Screen Capture
- Share your best moments!

## 📚 Learn More

- See [README.md](README.md) for complete documentation
- Check [Physics Details](README.md#physics-engine-details) for simulation info
- Read about [WebSocket Events](README.md#websocket-events) for backend communication

## 🐛 Report Issues

If you encounter bugs or have suggestions:
1. Note the exact steps to reproduce
2. Check the browser console (F12) for errors
3. Open an issue with details

---

**Happy Flying! 🚁**

*A.E.G.I.S Drone Simulator - Making drone flight accessible to everyone*
