# 🚁 A.E.G.I.S Drone Simulator - Setup Checklist

## ✅ Project Creation Complete!

- [x] Project structure created
- [x] Backend with Flask and physics engine
- [x] Frontend with React and Three.js
- [x] WebSocket real-time communication
- [x] Beautiful HUD display
- [x] Complete documentation

---

## 📋 Pre-Flight Checklist

### Step 1: Backend Setup
- [ ] Open terminal
- [ ] Navigate to `backend` folder
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate venv: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Verify installation: `pip list` (should show Flask, Flask-SocketIO, etc.)

### Step 2: Frontend Setup
- [ ] Open new terminal
- [ ] Navigate to `frontend` folder
- [ ] Install dependencies: `npm install`
- [ ] Verify installation: `npm list` (should show React, Three.js, etc.)

### Step 3: Start Backend
- [ ] In backend terminal, run: `python app.py`
- [ ] Wait for message: "Flask server running on http://localhost:5000"
- [ ] Verify backend is running

### Step 4: Start Frontend
- [ ] In frontend terminal, run: `npm run dev`
- [ ] Wait for message: "Local: http://localhost:3000/"
- [ ] Verify frontend is running

### Step 5: Open Browser
- [ ] Open browser (Chrome, Firefox, Safari, Edge)
- [ ] Navigate to: `http://localhost:3000`
- [ ] Wait for 3D scene to load
- [ ] Verify HUD panels are visible

### Step 6: Test Controls
- [ ] See connection indicator at top (should show "CONNECTED")
- [ ] Click "ARM" button
- [ ] Observe drone state changes to "ARMED"
- [ ] Press SPACE to increase throttle
- [ ] Watch throttle bar increase in HUD
- [ ] Press "W" and observe drone pitch changes
- [ ] Press "A" and observe drone roll changes
- [ ] Press "Q" and observe drone rotation

### Step 7: Test Camera Modes
- [ ] Press "C" to cycle through camera modes
- [ ] Try FPV mode - first-person view
- [ ] Try Follow mode - chase camera
- [ ] Try Orbit mode - rotating view
- [ ] Try Free mode - static view

### Step 8: Test HUD
- [ ] Press "H" to toggle HUD visibility
- [ ] Verify all panels are readable
- [ ] Check battery percentage display
- [ ] Check altitude display
- [ ] Check speed indicator
- [ ] Watch artificial horizon

### Step 9: Test Flight
- [ ] Click ARM button
- [ ] Press SPACE to increase throttle to ~0.7
- [ ] Press W to pitch forward
- [ ] Press D to roll right
- [ ] Observe smooth drone movement
- [ ] Watch trail following drone path
- [ ] Monitor battery drain

### Step 10: Test Reset
- [ ] Click "RESET" button
- [ ] Observe drone returns to center
- [ ] Observe battery resets to 100%
- [ ] Observe velocity resets to 0

---

## 🔧 Troubleshooting Checklist

### Backend Won't Start
- [ ] Check Python version: `python --version` (should be 3.8+)
- [ ] Verify venv activated (should see `(venv)` in terminal)
- [ ] Reinstall packages: `pip install -r requirements.txt`
- [ ] Check port 5000 isn't in use: `netstat -an | grep 5000`
- [ ] Try different port if needed (modify `app.py`)

### Frontend Won't Start
- [ ] Check Node version: `node --version` (should be 18+)
- [ ] Check npm version: `npm --version` (should be 9+)
- [ ] Clear node_modules: `rm -rf node_modules` then `npm install`
- [ ] Check port 3000 isn't in use: `netstat -an | grep 3000`
- [ ] Try different port if needed (modify `vite.config.js`)

### Can't Connect to Backend
- [ ] Verify backend is running (check terminal message)
- [ ] Verify connection indicator shows "CONNECTING"
- [ ] Wait 5 seconds for connection to establish
- [ ] Check browser console for errors (F12 → Console)
- [ ] Verify CORS is enabled in backend
- [ ] Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Controls Don't Work
- [ ] Verify drone is "ARMED" (check HUD)
- [ ] Click ARM button if not armed
- [ ] Click in the 3D scene first (focus window)
- [ ] Check browser console for errors
- [ ] Verify backend is receiving control messages

### HUD Not Displaying
- [ ] Press "H" to toggle HUD visibility
- [ ] Verify you can see connection indicator at top
- [ ] Check browser zoom level (Ctrl+0 to reset)
- [ ] Try different browser
- [ ] Check F12 → Console for JavaScript errors

### Low Frame Rate
- [ ] Close other applications
- [ ] Close other browser tabs
- [ ] Press "H" to disable HUD
- [ ] Change camera mode with "C"
- [ ] Reduce browser zoom
- [ ] Disable hardware acceleration if high CPU usage

---

## ✨ Verification Tests

### Physics
- [ ] Gravity works (drone falls when throttle = 0)
- [ ] Motor mixing works (drone responds to pitch/roll/yaw)
- [ ] Battery drains (percentage decreases during flight)
- [ ] Auto-disarm works (drone disarms at 0% battery)

### Graphics
- [ ] Propellers rotate
- [ ] Trail follows drone
- [ ] Lighting works (shadows visible)
- [ ] No visual glitches or flickering

### Controls
- [ ] Keyboard input is smooth
- [ ] Control decay works (controls return to neutral)
- [ ] WebSocket sync is responsive
- [ ] No lag between input and response

### HUD
- [ ] All panels are readable
- [ ] Values update in real-time
- [ ] Colors are correct
- [ ] No overlap or clipping

---

## 🎯 First Flight Objectives

- [ ] Successfully arm the drone
- [ ] Reach 50% throttle without crashing
- [ ] Fly forward and back smoothly
- [ ] Turn the drone in a circle
- [ ] Switch between camera modes mid-flight
- [ ] Perform a smooth landing
- [ ] Watch battery drain from 100% to ~70%
- [ ] Successfully reset to initial state

---

## 📊 Performance Baseline

Record these values for reference:

**System Info:**
- CPU: ________________
- RAM: ________________
- GPU: ________________
- Browser: ________________

**Performance:**
- Frame rate (FPS): ____ (Target: 60)
- Physics rate: ____ Hz (Target: 60)
- Latency (ms): ____ (Target: <50)
- Memory usage (MB): ____

---

## 🚀 Advanced Testing (Optional)

- [ ] Test with multiple browser tabs open
- [ ] Test on different devices/browsers
- [ ] Test with minimal network speed
- [ ] Test extreme control inputs
- [ ] Test with limited battery
- [ ] Record flight with screen capture
- [ ] Test replay of recording

---

## 📚 Documentation Review

- [ ] Read QUICKSTART.md
- [ ] Read README.md main sections
- [ ] Review DEVELOPER_GUIDE.md architecture
- [ ] Understand physics simulation
- [ ] Understand WebSocket events
- [ ] Review code comments

---

## 🎉 Success Criteria

✅ You've successfully completed setup when:

1. Backend starts without errors
2. Frontend connects to backend
3. 3D scene renders smoothly
4. HUD displays all information
5. Keyboard controls work
6. Drone responds to inputs
7. Physics simulation is accurate
8. All camera modes work
9. Battery drain is visible
10. Reset returns to initial state

---

## 📞 Support Resources

If you encounter issues:

1. **Documentation**: Check README.md troubleshooting
2. **Browser Console**: Press F12 for error messages
3. **Backend Console**: Check Python error messages
4. **Verification Script**: Run verify_setup.bat (Windows)
5. **Code Comments**: Review inline documentation

---

## 🎓 Learning Objectives

Use this project to learn:

- [ ] 3D graphics with Three.js
- [ ] Physics simulation
- [ ] React hooks and state management
- [ ] WebSocket real-time communication
- [ ] Motor control algorithms
- [ ] Backend-frontend architecture
- [ ] HUD/UI design
- [ ] Performance optimization

---

## ✅ Final Sign-Off

- [ ] All checklist items completed
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Ready to extend with custom features

**Date Completed:** ________________

**Notes:** 

________________________________________________

________________________________________________

________________________________________________

---

**🎉 Welcome to A.E.G.I.S Drone Simulator!**

You now have a fully functional drone flight simulator.

Happy flying! 🚁

---
