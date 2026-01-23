# A.E.G.I.S Drone Simulator - Documentation Index

Welcome to the A.E.G.I.S Drone Simulator! This is a complete, production-ready drone flight simulator built with React, Three.js, and Flask.

## 📖 Documentation Files

### 🚀 Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
  - Installation instructions
  - Running the application
  - Control cheat sheet
  - Quick troubleshooting

### 📚 Main Documentation
- **[README.md](README.md)** - Comprehensive technical documentation
  - Project overview and features
  - Installation & setup
  - Flight controls and camera modes
  - Physics engine details
  - WebSocket API reference
  - Performance optimization
  - Troubleshooting guide

### 📋 Project Information
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - High-level project overview
  - Complete project structure
  - Key features implemented
  - Physics specifications
  - Dependencies
  - Next steps

### 👨‍💻 Developer Reference
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - In-depth developer documentation
  - Project architecture
  - Data flow diagrams
  - Code structure breakdown
  - WebSocket protocol
  - Control flow explanation
  - Physics integration
  - Extending the project
  - Debugging tips

### 🛠️ Project Setup
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Project instructions
  - Completed steps
  - Running instructions
  - Troubleshooting

---

## 🎯 Quick Navigation

### I want to...

**...get up and running quickly**
→ Start with [QUICKSTART.md](QUICKSTART.md)

**...understand the full project**
→ Read [README.md](README.md)

**...learn how to develop/extend**
→ Study [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

**...see the project structure**
→ Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**...understand the physics**
→ See [README.md#physics-engine-details](README.md#physics-engine-details)

**...learn the WebSocket API**
→ See [README.md#websocket-events](README.md#websocket-events)

---

## 📁 Project Structure

```
Drone/
├── README.md                    # Main documentation
├── QUICKSTART.md               # Quick setup guide
├── PROJECT_SUMMARY.md          # Project overview
├── DEVELOPER_GUIDE.md          # Developer reference
├── DOCUMENTATION_INDEX.md      # This file
├── .github/
│   └── copilot-instructions.md # Project info
│
├── backend/                    # Flask Backend (Python)
│   ├── app.py                 # Main server with physics
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment template
│
└── frontend/                   # React Frontend (JavaScript)
    ├── package.json           # NPM dependencies
    ├── vite.config.js        # Build config
    ├── index.html            # HTML entry
    └── src/
        ├── components/        # React components
        ├── hooks/            # Custom hooks
        ├── store/            # State management
        ├── App.jsx           # Main component
        └── main.jsx          # Entry point
```

---

## ✨ Key Features at a Glance

✅ **3D Visualization**
- Full quadcopter model with propellers
- Real-time rendering at 60 FPS
- Multiple camera modes (FPV, Follow, Orbit, Free)
- Flight trail visualization

✅ **Physics Simulation**
- Realistic drone dynamics
- Motor mixing algorithm
- Gravity and drag modeling
- Battery drain simulation
- 60 Hz update rate

✅ **Beautiful HUD**
- Sci-fi styled interface
- Real-time telemetry display
- System status panel
- Artificial horizon
- Control visualization

✅ **Interactive Controls**
- Keyboard-based input (WASD, Space, Q/E)
- Smooth control decay
- Real-time WebSocket sync
- Arm/Disarm/Reset functions

✅ **Real-time Communication**
- WebSocket-based backend-frontend sync
- Event-driven architecture
- Efficient state updates

---

## 🚀 Quick Start Steps

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Open Browser
Visit: http://localhost:3000

### 4. Start Flying!
- Press **ARM** to enable
- Use **WASD** to control
- Press **H** to toggle HUD
- Press **C** to cycle cameras

---

## 🎮 Flight Controls

| Key | Action |
|-----|--------|
| W/S | Pitch |
| A/D | Roll |
| Q/E | Yaw |
| Space | Throttle Up |
| Shift | Throttle Down |
| H | Toggle HUD |
| C | Camera Cycle |

---

## 🔧 Technologies Used

### Frontend
- React 18.2.0
- Three.js (r156)
- Zustand 4.4.1
- Socket.io-client 4.7.0
- Vite 5.0.0

### Backend
- Flask 3.0.0
- Flask-CORS 4.0.0
- Flask-SocketIO 5.10.0
- NumPy 1.24.3
- Python-dotenv 1.0.0

---

## 📊 Physics Specifications

- **Gravity**: 9.81 m/s²
- **Drone Mass**: 1.5 kg
- **Motor Thrust**: 25 N per motor
- **Max Velocity**: 20 m/s
- **Max Angular Velocity**: 8 rad/s
- **Simulation**: 60 Hz
- **Rendering**: 60 FPS

---

## 🐛 Troubleshooting

### Connection Issues
- Ensure backend is running on port 5000
- Check firewall settings
- Verify CORS configuration

### Port Conflicts
- Change backend port in `backend/app.py`
- Change frontend port in `frontend/vite.config.js`

### Missing Dependencies
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

### Low Performance
- Close unnecessary applications
- Disable HUD if needed
- Try simpler camera mode

---

## 📚 Additional Resources

### Documentation Files
1. **QUICKSTART.md** - Start here for setup
2. **README.md** - Complete reference
3. **DEVELOPER_GUIDE.md** - Deep technical details
4. **PROJECT_SUMMARY.md** - Project overview

### Verification Scripts
- `verify_setup.sh` - Linux/Mac verification
- `verify_setup.bat` - Windows verification

### Configuration Files
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `vite.config.js` - Frontend build config
- `requirements.txt` - Python dependencies

---

## ✅ Project Checklist

- [x] Backend physics engine
- [x] Flask WebSocket server
- [x] React frontend
- [x] Three.js 3D visualization
- [x] Beautiful HUD display
- [x] Keyboard controls
- [x] Multiple camera modes
- [x] Real-time synchronization
- [x] Battery management
- [x] Flight trail
- [x] Complete documentation

---

## 🎓 Learning Path

1. **Beginner**: Follow QUICKSTART.md to get it running
2. **Intermediate**: Read README.md to understand features
3. **Advanced**: Study DEVELOPER_GUIDE.md for internals
4. **Expert**: Extend with custom features

---

## 🤝 Contributing

To extend the project:

1. Read DEVELOPER_GUIDE.md
2. Modify appropriate component
3. Test thoroughly
4. Update documentation

---

## 📞 Support

For issues or questions:
1. Check the relevant documentation file
2. Review browser console for errors
3. Verify both backend and frontend running
4. Check README.md troubleshooting section

---

## 🎉 You're Ready!

Everything is set up and ready to go. Choose your starting point:

- **Just want to fly?** → [QUICKSTART.md](QUICKSTART.md)
- **Want to understand everything?** → [README.md](README.md)
- **Want to develop?** → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

**Happy Flying with A.E.G.I.S Drone Simulator! 🚁**
