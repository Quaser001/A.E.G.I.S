"""
A.E.G.I.S Drone Simulator Backend
Flask server with real-time physics simulation, A.E.G.I.S doctrine, and WebSocket support
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import numpy as np
from dataclasses import dataclass, asdict, field
from typing import Dict, List, Tuple, Optional
import threading
import time
import math
import uuid

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    ping_timeout=60,
    ping_interval=25,
    logger=False,
    engineio_logger=False
)

def to_native(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: to_native(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [to_native(item) for item in obj]
    return obj

# ==================== A.E.G.I.S DOCTRINE CONSTANTS ====================
THRESH_WARN = 70.0          # Warning threshold for confidence
THRESH_REJECT = 40.0        # Reject threshold (can't drop anchors below this)
THRESH_ABORT = 10.0         # Abort threshold - triggers automatic retrograde
JAM_SAFE_THRESHOLD = 30.0   # Below this GPS jam level, confidence can heal
BATTERY_RTB_THRESHOLD = 15.0  # Battery % that triggers automatic RTB

# ==================== DATA CLASSES ====================

@dataclass
class DroneState:
    """Represents the complete state of a drone with A.E.G.I.S doctrine"""
    # Position and motion
    position: Tuple[float, float, float] = (0.0, 2.0, 0.0)  # x, y, z
    velocity: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    rotation: Tuple[float, float, float] = (0.0, 0.0, 0.0)  # pitch, yaw, roll (radians)
    angular_velocity: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    
    # Basic state
    battery: float = 100.0
    armed: bool = False
    mode: str = "STABILIZE"
    
    # A.E.G.I.S Doctrine state
    gps_jam: float = 0.0                # 0-100, GPS jamming level (operator-simulated)
    nav_confidence: float = 100.0       # 0-100, auto-affected by GPS jam
    retrograde_active: bool = False     # Auto-return mode
    status: str = "NOMINAL"             # NOMINAL, WARNING, SAFETY_OVERRIDE, COMMANDER_RTB


@dataclass
class DoctrineData:
    """A.E.G.I.S doctrine data - breadcrumbs and anchors"""
    breadcrumbs: List[Tuple[float, float, float]] = field(default_factory=list)
    anchors: List[Tuple[float, float, float]] = field(default_factory=list)
    return_queue: List[Tuple[float, float, float]] = field(default_factory=list)
    target_point: Optional[Tuple[float, float, float]] = None
    last_breadcrumb_time: float = 0.0


# ==================== PHYSICS ENGINE ====================

class PhysicsEngine:
    """A.E.G.I.S Drone physics simulation with doctrine support"""
    
    # Physical constants
    GRAVITY = 9.81
    MASS = 1.5
    MAX_SPEED = 8.0
    MAX_REVERSE_SPEED = 4.0
    ACCELERATION = 12.0
    DECELERATION = 10.0
    DRAG = 0.96
    BASE_YAW_RATE = 2.5
    
    def __init__(self):
        self.state = DroneState()
        self.doctrine = DoctrineData()
        self.control_inputs = {
            'forward': 0.0,     # -1 (back) to 1 (forward)
            'yaw': 0.0,         # -1 (left) to 1 (right)
            'throttle': 0.0,    # 0 to 1
            'pitch': 0.0,
            'roll': 0.0,
            'yaw_rate': 0.0
        }
        self.speed = 0.0
        self.yaw_rate = 0.0
        
    def update(self, dt: float):
        """Update physics with A.E.G.I.S doctrine"""
        if not self.state.armed:
            return
        
        # Update doctrine health
        self._update_doctrine(dt)
        
        # Check for retrograde triggers (confidence OR battery)
        if not self.state.retrograde_active:
            if self.state.nav_confidence < THRESH_ABORT:
                self._start_retrograde()
            elif self.state.battery < BATTERY_RTB_THRESHOLD:
                self._start_retrograde()
        
        # Update physics based on mode
        if self.state.retrograde_active:
            self._update_retrograde(dt)
        else:
            self._update_normal_flight(dt)
        
        # Update status string (preserve commander override mode)
        if self.state.mode == "COMMANDER_RTB":
            self.state.status = "COMMANDER_RTB"
        elif self.state.retrograde_active:
            self.state.status = "SAFETY_OVERRIDE"
        elif self.state.nav_confidence > THRESH_WARN:
            self.state.status = "NOMINAL"
        elif self.state.nav_confidence > THRESH_REJECT:
            self.state.status = "WARNING"
        else:
            self.state.status = "SAFETY_OVERRIDE"
        
        # Drop breadcrumbs
        current_time = time.time()
        if current_time - self.doctrine.last_breadcrumb_time > 0.2:
            self.doctrine.breadcrumbs.append(self.state.position)
            self.doctrine.last_breadcrumb_time = current_time
            # Limit breadcrumb count
            if len(self.doctrine.breadcrumbs) > 500:
                self.doctrine.breadcrumbs.pop(0)
        
        # Battery drain
        if self.speed > 0.1:
            self.state.battery = max(0, self.state.battery - 0.5 * dt)
        
        if self.state.battery <= 0:
            if self.state.armed:
                print("DEBUG: Auto-disarm due to LOW BATTERY")
            self.state.armed = False
    
    def _update_doctrine(self, dt: float):
        """Update A.E.G.I.S doctrine - GPS jam directly affects nav confidence"""
        if self.state.retrograde_active:
            # Freeze confidence during retrograde
            return
        
        gps_jam = self.state.gps_jam
        
        # Linear Mapping: 80% Jam -> 10% Confidence (Trigger)
        target_confidence = 100.0 - (gps_jam * 1.125)
        target_confidence = max(0.0, min(100.0, target_confidence))
        
        # Fast response (smoothing factor 3.0)
        current = self.state.nav_confidence
        diff = target_confidence - current
        self.state.nav_confidence = current + diff * 3.0 * dt
        self.state.nav_confidence = max(0.0, min(100.0, self.state.nav_confidence))
    
    def _start_retrograde(self, commander_override=False):
        """Start automatic retrograde return - visits ALL checkpoints chronologically"""
        self.state.retrograde_active = True
        self.state.mode = "COMMANDER_RTB" if commander_override else "RETROGRADE"
        
        # BUILD RETURN PATH: All checkpoints in REVERSE chronological order, then origin
        # Doctrine: Return through verified safe waypoints (same way out as came in)
        
        self.doctrine.return_queue = []
        
        if self.doctrine.anchors:
            # Visit ALL checkpoints in reverse order (chronological return)
            # This ensures we pass through all verified safe zones
            self.doctrine.return_queue = list(reversed(self.doctrine.anchors.copy()))
        
        # Always end at origin (base)
        self.doctrine.return_queue.append((0.0, 2.0, 0.0))
        
        if self.doctrine.return_queue:
            self.doctrine.target_point = self.doctrine.return_queue.pop(0)
    
    def _update_retrograde(self, dt: float):
        """Update retrograde (auto-return) flight"""
        if self.doctrine.target_point is None:
            self.state.retrograde_active = False
            self.state.mode = "STABILIZE"
            return
        
        target = self.doctrine.target_point
        pos = list(self.state.position)
        
        # Calculate distance to target
        dx = target[0] - pos[0]
        dz = target[2] - pos[2]
        dist = math.sqrt(dx * dx + dz * dz)
        
        if dist < 1.0:
            # Reached target, get next
            if self.doctrine.return_queue:
                self.doctrine.target_point = self.doctrine.return_queue.pop(0)
            else:
                # Arrived at origin - AUTO-DISARM and stop
                self.doctrine.target_point = None
                self.state.retrograde_active = False
                self.state.mode = "LANDED"
                self.state.nav_confidence = 50.0  # Partial recovery
                self.state.armed = False  # Auto-disarm after retrograde
                self.speed = 0.0
                self.yaw_rate = 0.0
                # Reset to origin position
                self.state.position = (0.0, 2.0, 0.0)
                self.state.velocity = (0.0, 0.0, 0.0)
            return
        
        # Navigate toward target
        target_yaw = math.atan2(dx, dz)
        current_yaw = self.state.rotation[1]
        
        # Calculate angle error
        angle_error = target_yaw - current_yaw
        while angle_error > math.pi:
            angle_error -= 2 * math.pi
        while angle_error < -math.pi:
            angle_error += 2 * math.pi
        
        # Rotate toward target
        new_yaw = current_yaw + angle_error * 4.0 * dt
        
        # Move forward at constant speed
        speed = 6.0
        pos[0] += math.sin(new_yaw) * speed * dt
        pos[2] += math.cos(new_yaw) * speed * dt
        
        # Update state
        self.state.position = tuple(pos)
        self.state.rotation = (self.state.rotation[0], new_yaw, self.state.rotation[2])
        self.state.velocity = (math.sin(new_yaw) * speed, 0, math.cos(new_yaw) * speed)
    
    def _update_normal_flight(self, dt: float):
        """Update normal flight physics (arrow key controlled)"""
        pos = list(self.state.position)
        rot = list(self.state.rotation)
        
        # Get control inputs
        forward = self.control_inputs.get('forward', 0.0)
        yaw_input = self.control_inputs.get('yaw', 0.0)
        throttle = self.control_inputs.get('throttle', 0.0)
        
        # Forward/backward speed
        if forward > 0:
            self.speed = min(self.MAX_SPEED, self.speed + self.ACCELERATION * dt * forward)
        elif forward < 0:
            self.speed = max(-self.MAX_REVERSE_SPEED, self.speed + self.DECELERATION * dt * forward)
        else:
            # Apply drag and clamp to zero when very slow
            self.speed *= self.DRAG
            if abs(self.speed) < 0.05:
                self.speed = 0.0
        
        # Speed-aware yaw (from reference)
        speed_factor = min(abs(self.speed) / 6.0, 1.0)
        if yaw_input != 0:
            self.yaw_rate = yaw_input * self.BASE_YAW_RATE * (0.5 + speed_factor)
        else:
            self.yaw_rate *= 0.85
            if abs(self.yaw_rate) < 0.05:
                self.yaw_rate = 0.0
        
        # Integrate rotation
        rot[1] += self.yaw_rate * dt
        
        # Integrate position (2D ground plane movement)
        pos[0] += math.sin(rot[1]) * self.speed * dt
        pos[2] += math.cos(rot[1]) * self.speed * dt
        
        # Throttle controls altitude
        if throttle > 0.1:
            pos[1] += (throttle - 0.5) * 5.0 * dt
            pos[1] = max(0, min(100, pos[1]))  # Clamp altitude
        
        # Ground collision
        if pos[1] < 0:
            pos[1] = 0
        
        # Update state
        self.state.position = tuple(pos)
        self.state.rotation = tuple(rot)
        self.state.velocity = (math.sin(rot[1]) * self.speed, 0, math.cos(rot[1]) * self.speed)
    
    def log_anchor(self):
        """Drop a verified anchor at current position"""
        if self.state.nav_confidence >= THRESH_REJECT:
            self.doctrine.anchors.append(self.state.position)
            return True
        return False
    
    def adjust_stress(self, delta: float):
        """Adjust integrity stress level"""
        self.state.integrity_stress = max(0, min(100, self.state.integrity_stress + delta))
    
    def set_controls(self, **kwargs):
        """Set control inputs"""
        for key, value in kwargs.items():
            if key in self.control_inputs:
                self.control_inputs[key] = np.clip(value, -1, 1)
    
    def arm(self):
        """Arm the drone"""
        # Force battery reset ensures we can always arm
        if self.state.battery <= 10:
             self.state.battery = 100.0
        
        self.state.armed = True
        self.doctrine.breadcrumbs = []  # Clear breadcrumbs on arm
        self.doctrine.last_breadcrumb_time = time.time()
    
    def disarm(self):
        """Disarm the drone"""
        self.state.armed = False
    
    def reset(self):
        """Reset drone to initial state"""
        self.state = DroneState()
        self.doctrine = DoctrineData()
        self.speed = 0.0
        self.yaw_rate = 0.0
        self.control_inputs = {
            'forward': 0.0,
            'yaw': 0.0,
            'throttle': 0.0,
            'pitch': 0.0,
            'roll': 0.0,
            'yaw_rate': 0.0
        }


# ==================== SIMULATION MANAGER ====================

class SimulationManager:
    """Manages multiple drone simulations"""
    
    def __init__(self):
        self.drones: Dict[str, PhysicsEngine] = {}
        self.simulation_running = False
        self.simulation_thread = None
        self.lock = threading.Lock()
    
    def add_drone(self, drone_id: str) -> PhysicsEngine:
        """Create a new drone"""
        with self.lock:
            engine = PhysicsEngine()
            self.drones[drone_id] = engine
            return engine
    
    def get_drone(self, drone_id: str) -> Optional[PhysicsEngine]:
        """Get a drone by ID"""
        return self.drones.get(drone_id)
    
    def remove_drone(self, drone_id: str):
        """Remove a drone"""
        with self.lock:
            if drone_id in self.drones:
                del self.drones[drone_id]
    
    def start_simulation(self):
        """Start the main simulation loop"""
        if not self.simulation_running:
            self.simulation_running = True
            self.simulation_thread = threading.Thread(target=self._simulation_loop, daemon=True)
            self.simulation_thread.start()
    
    def stop_simulation(self):
        """Stop the simulation loop"""
        self.simulation_running = False
    
    def _simulation_loop(self):
        """Main simulation loop"""
        dt = 1.0 / 60.0  # 60 Hz
        tick = 0
        
        while self.simulation_running:
            with self.lock:
                for drone in self.drones.values():
                    drone.update(dt)
            
            # Broadcast updates at 30Hz (every 2 ticks) - Smoother than 10Hz
            tick += 1
            if tick % 2 == 0:
                with app.app_context():
                    for drone_id, drone in self.drones.items():
                        state_dict = asdict(drone.state)
                        state_dict['speed'] = drone.speed
                        
                        # Add doctrine data
                        doctrine_dict = {
                            'breadcrumbs': drone.doctrine.breadcrumbs[-50:],  # Last 50 for perf
                            'anchors': drone.doctrine.anchors,
                            'target_point': drone.doctrine.target_point,
                            'return_queue_length': len(drone.doctrine.return_queue)
                        }
                        
                        socketio.emit('drone_update', to_native({
                            'drone_id': drone_id,
                            'state': state_dict,
                            'doctrine': doctrine_dict,
                            'controls': drone.control_inputs
                        }))
            
            time.sleep(dt)


# Global simulation manager
sim_manager = SimulationManager()


# ==================== FLASK ROUTES ====================

@app.route('/')
def index():
    """Serve the React app"""
    return app.send_static_file('index.html')


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': time.time()})


@app.route('/api/drones', methods=['GET'])
def get_drones():
    """Get all active drones"""
    drones = {}
    for drone_id, engine in sim_manager.drones.items():
        drones[drone_id] = asdict(engine.state)
    return jsonify(drones)


# ==================== SOCKET EVENTS ====================



clients = {} # sid -> drone_id

@socketio.on('connect', namespace='/')
def handle_connect(auth):
    """Handle client connection"""
    from flask import request
    client_id = str(uuid.uuid4())
    clients[request.sid] = client_id
    print(f'Client connected: {client_id} (SID: {request.sid})')
    
    drone = sim_manager.add_drone(client_id)
    
    emit('drone_created', {
        'drone_id': client_id,
        'initial_state': asdict(drone.state),
        'thresholds': {
            'warn': THRESH_WARN,
            'reject': THRESH_REJECT,
            'abort': THRESH_ABORT
        }
    })
    
    if not sim_manager.simulation_running:
        sim_manager.start_simulation()
        print('Simulation started')
    
    return {'client_id': client_id}


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    from flask import request
    sid = request.sid
    if sid in clients:
        drone_id = clients[sid]
        print(f'Client disconnected: {drone_id}')
        sim_manager.remove_drone(drone_id)
        del clients[sid]
    else:
        print('Client disconnected (Unknown SID)')

@socketio.on('arm')
def handle_arm(data):
    """Arm the drone"""
    drone_id = data.get('drone_id') if isinstance(data, dict) else None
    if drone_id:
        drone = sim_manager.get_drone(drone_id)
        if drone:
            drone.arm()
            emit('status', {'message': 'Drone armed', 'drone_id': drone_id})


@socketio.on('disarm')
def handle_disarm(data):
    """Disarm the drone"""
    drone_id = data.get('drone_id') if isinstance(data, dict) else None
    if drone_id:
        drone = sim_manager.get_drone(drone_id)
        if drone:
            drone.disarm()
            emit('status', {'message': 'Drone disarmed', 'drone_id': drone_id})


@socketio.on('reset')
def handle_reset(data):
    """Reset the drone"""
    drone_id = data.get('drone_id') if isinstance(data, dict) else None
    if drone_id:
        drone = sim_manager.get_drone(drone_id)
        if drone:
            drone.reset()
            emit('status', {'message': 'Drone reset', 'drone_id': drone_id})


@socketio.on('set_controls')
def handle_set_controls(data):
    """Update drone control inputs"""
    drone_id = data.get('drone_id') if isinstance(data, dict) else None
    if drone_id:
        drone = sim_manager.get_drone(drone_id)
        if drone:
            drone.set_controls(
                forward=data.get('forward', 0),
                yaw=data.get('yaw', 0),
                throttle=data.get('throttle', 0),
                pitch=data.get('pitch', 0),
                roll=data.get('roll', 0),
                yaw_rate=data.get('yaw_rate', 0)
            )


@socketio.on('adjust_jam')
def handle_adjust_jam(data):
    """Adjust GPS jamming level (simulated)"""
    drone_id = data.get('drone_id') if isinstance(data, dict) else None
    delta = data.get('delta', 0)
    if drone_id:
        drone = sim_manager.get_drone(drone_id)
        if drone:
            # Update GPS jam level (clamped 0-100)
            drone.state.gps_jam = max(0.0, min(100.0, drone.state.gps_jam + delta))
            emit('jam_changed', {
                'drone_id': drone_id,
                'level': drone.state.gps_jam
            })


@socketio.on('commander_override')
def handle_commander_override(data):
    """Commander forces immediate RTB"""
    drone_id = data.get('drone_id') if isinstance(data, dict) else None
    if drone_id:
        drone = sim_manager.get_drone(drone_id)
        if drone:
            drone._start_retrograde(commander_override=True)
            emit('status', {'message': 'COMMANDER OVERRIDE: Forced RTB', 'drone_id': drone_id})


@socketio.on('log_anchor')
def handle_log_anchor(data):
    """Log an anchor at current position"""
    drone_id = data.get('drone_id') if isinstance(data, dict) else None
    if drone_id:
        drone = sim_manager.get_drone(drone_id)
        if drone:
            success = drone.log_anchor()
            emit('anchor_logged', {
                'drone_id': drone_id,
                'success': success,
                'position': drone.state.position if success else None
            })


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500


if __name__ == '__main__':
    print("Starting A.E.G.I.S Drone Simulator Backend...")
    print("Flask server running on http://localhost:5000")
    print("A.E.G.I.S Doctrine Thresholds:")
    print(f"  WARN: {THRESH_WARN}%")
    print(f"  REJECT: {THRESH_REJECT}%")
    print(f"  ABORT: {THRESH_ABORT}%")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
