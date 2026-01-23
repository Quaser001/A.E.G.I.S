import React, { useEffect, useRef, useState } from 'react';
import { useDroneStore } from '../store/droneStore';
import './HUD.css';

// Sound generator
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'critical') { osc.frequency.value = 800; osc.type = 'square'; gain.gain.value = 0.2; }
    if (type === 'override') { osc.frequency.value = 400; osc.type = 'sawtooth'; gain.gain.value = 0.3; }
    else if (type === 'warning') { osc.frequency.value = 600; osc.type = 'sine'; gain.gain.value = 0.15; }
    else if (type === 'confirm') { osc.frequency.value = 1200; osc.type = 'sine'; gain.gain.value = 0.1; }

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) { }
};

export const HUD = ({ socket }) => {
  const droneId = useDroneStore((state) => state.droneId);
  const armed = useDroneStore((state) => state.armed);
  const battery = useDroneStore((state) => state.battery);
  const position = useDroneStore((state) => state.position);
  const rotation = useDroneStore((state) => state.rotation);
  const speed = useDroneStore((state) => state.speed);
  const mode = useDroneStore((state) => state.mode);
  const connectionStatus = useDroneStore((state) => state.connectionStatus);

  // A.E.G.I.S Doctrine
  const gpsJam = useDroneStore((state) => state.gpsJam);
  const navConfidence = useDroneStore((state) => state.navConfidence);
  const status = useDroneStore((state) => state.status);
  const retrogradeActive = useDroneStore((state) => state.retrogradeActive);
  const breadcrumbs = useDroneStore((state) => state.breadcrumbs);
  const anchors = useDroneStore((state) => state.anchors);
  const thresholds = useDroneStore((state) => state.thresholds);

  const minimapRef = useRef(null);
  const lastStatusRef = useRef('NOMINAL');
  const [missionTime, setMissionTime] = useState(0);
  const missionStartRef = useRef(null);

  // Draw minimap
  useEffect(() => {
    const canvas = minimapRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    // Dynamic Zoom: Fit drone within view with padding
    const maxDist = Math.max(Math.abs(position[0]), Math.abs(position[2]), 40);
    const scale = (w / 2) / (maxDist * 1.2); // Scale to fit
    const cx = w / 2;
    const cy = h / 2;

    // Clear
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 0.5;
    for (let i = -50; i <= 50; i += 10) {
      const x = cx + i * scale;
      const y = cy - i * scale;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Range circles
    ctx.strokeStyle = '#2a3a4a';
    [20, 40, 60].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Breadcrumb trail
    if (breadcrumbs.length > 1) {
      ctx.strokeStyle = '#00ff4488';
      ctx.lineWidth = 1;
      ctx.beginPath();
      breadcrumbs.forEach((pt, i) => {
        const x = cx + pt[0] * scale;
        const y = cy - pt[2] * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Anchors
    anchors.forEach(pt => {
      const x = cx + pt[0] * scale;
      const y = cy - pt[2] * scale;
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(x - 3, y - 3, 6, 6);
    });

    // Drone position
    const dx = cx + position[0] * scale;
    const dy = cy - position[2] * scale;
    const heading = rotation[1];

    // Drone triangle
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(-heading);
    ctx.fillStyle = retrogradeActive ? '#ff3333' : '#00ff88';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-4, 4);
    ctx.lineTo(4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Origin marker
    ctx.fillStyle = '#ffffff44';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

  }, [position, rotation, breadcrumbs, anchors, retrogradeActive]);

  // Sound effects
  useEffect(() => {
    if (status !== lastStatusRef.current) {
      if (status === 'COMMANDER_RTB') playSound('override');
      else if (status === 'SAFETY_OVERRIDE') playSound('critical');
      else if (status === 'WARNING') playSound('warning');
      lastStatusRef.current = status;
    }
  }, [status]);

  const handleArm = () => {
    if (socket && droneId) socket.emit('arm', { drone_id: droneId });
  };

  const handleDisarm = () => {
    if (socket && droneId) socket.emit('disarm', { drone_id: droneId });
  };

  const handleReset = () => {
    if (socket && droneId) socket.emit('reset', { drone_id: droneId });
  };

  const handleSaveCheckpoint = () => {
    if (socket && droneId) {
      socket.emit('log_anchor', { drone_id: droneId });
      playSound('confirm');
    }
  };

  const handleCommanderRTB = () => {
    if (socket && droneId) {
      socket.emit('commander_override', { drone_id: droneId });
      playSound('override');
    }
  };

  const getStatusColor = () => {
    if (status === 'COMMANDER_RTB') return '#ff00ff'; // Purple for override
    if (status === 'SAFETY_OVERRIDE' || retrogradeActive) return '#ff3333';
    if (status === 'WARNING') return '#ffaa00';
    return '#00ff88';
  };

  // Mission timer
  useEffect(() => {
    if (armed && !missionStartRef.current) {
      missionStartRef.current = Date.now();
    } else if (!armed) {
      missionStartRef.current = null;
      setMissionTime(0);
    }

    const interval = setInterval(() => {
      if (missionStartRef.current) {
        setMissionTime(Math.floor((Date.now() - missionStartRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [armed]);

  // Format mission time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Get status class for dynamic border styling
  const getStatusClass = () => {
    if (status === 'COMMANDER_RTB') return 'status-override';
    if (status === 'SAFETY_OVERRIDE' || retrogradeActive) return 'status-critical';
    if (status === 'WARNING' || navConfidence < thresholds.warn) return 'status-warning';
    return 'status-nominal';
  };

  return (
    <div className={`hud-overlay ${getStatusClass()}`}>
      {/* Threat Edge Indicator - subtle screen border glow */}
      {(status === 'WARNING' || status === 'SAFETY_OVERRIDE' || status === 'COMMANDER_RTB') && (
        <div className={`threat-edge-indicator ${getStatusClass()}`} />
      )}

      {/* Mission Timer */}
      {armed && (
        <div className="mission-timer">
          <span className="timer-label">MISSION</span>
          <span className="timer-value">{formatTime(missionTime)}</span>
        </div>
      )}

      {/* Top Center - Connection */}
      <div className="hud-top-center">
        <div className={`connection-badge ${connectionStatus}`}>
          <span className="status-dot"></span>
          {connectionStatus.toUpperCase()}
        </div>
        {retrogradeActive && (
          <div className="retrograde-alert">
            {status === 'COMMANDER_RTB' ? '⚠ COMMANDER OVERRIDE' : '⚠ RETROGRADE ACTIVE'}
          </div>
        )}
        {gpsJam > 50 && (
          <div className="retrograde-alert" style={{ borderColor: '#ffff00', color: '#ffff00', background: 'rgba(50, 50, 0, 0.5)' }}>
            👁 OPTICAL NAV ACTIVE
          </div>
        )}
      </div>

      {/* Left Panel - System Status */}
      <div className="hud-panel hud-left">
        <div className="panel-title">SYSTEM STATUS</div>
        <div className="panel-content">
          <div className="status-row">
            <span className="label">MODE:</span>
            <span className={`value ${retrogradeActive ? 'warning' : ''}`}>{mode}</span>
          </div>
          <div className="status-row">
            <span className="label">STATE:</span>
            <span className={`value ${armed ? 'armed' : 'disarmed'}`}>
              {armed ? 'ARMED' : 'DISARMED'}
            </span>
          </div>
          <div className="status-row">
            <span className="label">STATUS:</span>
            <span className="value" style={{ color: getStatusColor() }}>
              {status.replace('_', ' ')}
            </span>
          </div>

          {/* Doctrine bars */}
          <div className="doctrine-section">
            <div className="doctrine-row">
              <span className="label">GPS JAM</span>
              <div className="doctrine-bar">
                <div
                  className="doctrine-fill stress"
                  style={{
                    width: `${gpsJam}%`,
                    background: `linear-gradient(90deg, #00ff88, ${gpsJam > 30 ? '#ffaa00' : '#00ff88'}, ${gpsJam > 70 ? '#ff3333' : '#ffaa00'})`
                  }}
                />
              </div>
              <span className="doctrine-value">{gpsJam.toFixed(0)}%</span>
            </div>
            <div className="doctrine-row">
              <span className="label">CONF</span>
              <div className="doctrine-bar">
                <div
                  className="doctrine-fill"
                  style={{
                    width: `${navConfidence}%`,
                    backgroundColor: navConfidence > thresholds.warn ? '#00ff88' :
                      navConfidence > thresholds.reject ? '#ffaa00' : '#ff3333'
                  }}
                />
                {/* Confidence Threshold Markers */}
                <div className="threshold-marker" style={{ left: '70%' }} title="WARN" />
                <div className="threshold-marker" style={{ left: '40%' }} title="REJECT" />
                <div className="threshold-marker" style={{ left: '10%' }} title="ABORT" />
              </div>
              <span className="doctrine-value">{navConfidence.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Telemetry */}
      <div className="hud-panel hud-right">
        <div className="panel-title">TELEMETRY</div>
        <div className="panel-content">
          <div className="battery-section">
            <div className="battery-bar">
              <div
                className="battery-fill"
                style={{
                  width: `${battery}%`,
                  backgroundColor: battery > 50 ? '#00ff88' : battery > 15 ? '#ffaa00' : '#ff3333'
                }}
              />
            </div>
            <span className="battery-text">BATT: {battery.toFixed(1)}%</span>
          </div>

          <div className="telemetry-grid">
            <div className="telemetry-item">
              <span className="telemetry-label">ALT</span>
              <span className="telemetry-value">{position[1].toFixed(1)}m</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">SPD</span>
              <span className="telemetry-value">{Math.abs(speed || 0).toFixed(1)}m/s</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">HDG</span>
              <span className="telemetry-value">{((rotation[1] * 180 / Math.PI + 360) % 360).toFixed(0)}°</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">PTS</span>
              <span className="telemetry-value">{anchors.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left - Minimap */}
      <div className="hud-panel hud-bottom-left minimap-panel">
        <div className="panel-title">TACTICAL MAP</div>
        <canvas ref={minimapRef} width={160} height={160} className="minimap-canvas" />
        <div className="minimap-coords">
          <div>X:{position[0].toFixed(1)} Z:{position[2].toFixed(1)}</div>
          <div style={{ fontSize: '9px', color: '#00ccff', marginTop: '2px' }}>
            {(28.61 + position[2] * 0.00001).toFixed(6)}N {(77.20 + position[0] * 0.00001).toFixed(6)}E (IST)
          </div>
        </div>
      </div>

      {/* Bottom Right - Actions */}
      <div className="hud-panel hud-bottom-right">
        <div className="panel-title">ACTIONS</div>
        <div className="panel-content">
          <div className="action-buttons">
            <button
              className={`action-btn ${armed ? 'disarm' : 'arm'}`}
              onClick={armed ? handleDisarm : handleArm}
            >
              {armed ? 'DISARM' : 'ARM'}
            </button>
            <button className="action-btn reset" onClick={handleReset}>
              RESET
            </button>
          </div>

          <button
            className="action-btn checkpoint"
            onClick={handleSaveCheckpoint}
            disabled={navConfidence < thresholds.reject}
          >
            💾 SAVE CHECKPOINT
          </button>

          <button
            className="action-btn commander-rtb"
            onClick={handleCommanderRTB}
          >
            🚨 FORCE RETURN
          </button>

          <div className="controls-hint">
            ↑↓: Move | ←→: Turn | L: Checkpoint<br />
            [/]: Jam Force | C: Camera | SPACE: Brake
          </div>
        </div>
      </div>

      {/* Center - Military HUD Pitch Ladder */}
      {/* Central HUD elements removed for cleaner view */}
    </div>
  );
};
