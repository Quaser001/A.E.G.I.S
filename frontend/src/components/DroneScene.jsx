import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDroneStore } from '../store/droneStore';

export const DroneScene = React.forwardRef(({ socket }, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const droneModelRef = useRef(null);
  const trailRef = useRef([]);
  const trailLineRef = useRef(null);
  const animationIdRef = useRef(null);
  const propellersRef = useRef([]);

  // Use refs to store latest values for animation loop (avoids stale closures)
  const positionRef = useRef([0, 2, 0]);
  const rotationRef = useRef([0, 0, 0]);
  const cameraModeRef = useRef('follow');
  const cameraDistanceRef = useRef(10);

  // Subscribe to store and update refs
  useEffect(() => {
    const unsubscribe = useDroneStore.subscribe((state) => {
      // NaN Check to prevent disappearance
      if (!state.position || !state.rotation) return;
      if (state.position.some(v => isNaN(v) || v === null)) return;
      if (state.rotation.some(v => isNaN(v) || v === null)) return;

      positionRef.current = state.position;
      rotationRef.current = state.rotation;
      cameraModeRef.current = state.camera.mode;
      cameraDistanceRef.current = state.camera.distance;

      // Update drone model directly (Direct Updates)
      if (droneModelRef.current) {
        droneModelRef.current.position.set(...state.position);
        droneModelRef.current.rotation.order = 'YXZ';
        droneModelRef.current.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    if (rendererRef.current) return;

    // Scene setup with gradient background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(-5, 8, 15);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ===== STARFIELD =====
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1500;
      positions[i + 1] = Math.random() * 500 + 50;
      positions[i + 2] = (Math.random() - 0.5) * 1500;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ===== LIGHTING =====
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
    sunLight.position.set(50, 100, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // ===== GROUND =====
    const gridHelper = new THREE.GridHelper(200, 40, 0x00ffff, 0x004444);
    gridHelper.position.y = -0.01;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    // Dark but visible ground plane
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x151520,
      side: THREE.FrontSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    plane.receiveShadow = true;
    scene.add(plane);

    // Landing pad
    const padGeometry = new THREE.CylinderGeometry(3, 3, 0.1, 32);
    const padMaterial = new THREE.MeshLambertMaterial({
      color: 0x333355
    });
    const landingPad = new THREE.Mesh(padGeometry, padMaterial);
    landingPad.position.set(0, 0.05, 0);
    landingPad.receiveShadow = true;
    scene.add(landingPad);

    const ringGeometry = new THREE.RingGeometry(2.5, 2.8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    scene.add(ring);

    // ===== DRONE MODEL =====
    const droneGroup = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(0.5, 0.12, 0.35);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      metalness: 0.9,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    droneGroup.add(body);

    // Top cover
    const topGeometry = new THREE.SphereGeometry(0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0xff3300,
      emissiveIntensity: 0.1
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.06;
    top.castShadow = true;
    droneGroup.add(top);

    // Arms
    const armPositions = [
      { x: 0.4, z: 0.4, color: 0xff0000 },
      { x: -0.4, z: 0.4, color: 0xff0000 },
      { x: 0.4, z: -0.4, color: 0x00ff00 },
      { x: -0.4, z: -0.4, color: 0x00ff00 }
    ];

    armPositions.forEach((pos) => {
      const armGeometry = new THREE.BoxGeometry(0.6, 0.03, 0.05);
      const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
      });
      const arm = new THREE.Mesh(armGeometry, armMaterial);
      const angle = Math.atan2(pos.z, pos.x);
      arm.rotation.y = -angle;
      arm.position.set(pos.x / 2, 0, pos.z / 2);
      arm.castShadow = true;
      droneGroup.add(arm);

      const motorGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.08, 12);
      const motorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.1
      });
      const motor = new THREE.Mesh(motorGeometry, motorMaterial);
      motor.position.set(pos.x, 0.02, pos.z);
      motor.castShadow = true;
      droneGroup.add(motor);

      const ledGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const ledMaterial = new THREE.MeshBasicMaterial({ color: pos.color });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(pos.x, 0.08, pos.z);
      droneGroup.add(led);

      const propGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.01, 32);
      const propMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.4
      });
      const propeller = new THREE.Mesh(propGeometry, propMaterial);
      propeller.position.set(pos.x, 0.09, pos.z);
      propellersRef.current.push(propeller);
      droneGroup.add(propeller);
    });

    const gimbalGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.1);
    const gimbalMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2
    });
    const gimbal = new THREE.Mesh(gimbalGeometry, gimbalMaterial);
    gimbal.position.set(0, -0.09, 0.15);
    gimbal.castShadow = true;
    droneGroup.add(gimbal);

    const lensGeometry = new THREE.SphereGeometry(0.025, 16, 16);
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 1,
      roughness: 0
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.set(0, -0.09, 0.21);
    droneGroup.add(lens);

    droneGroup.position.set(...positionRef.current);
    droneGroup.castShadow = true;
    scene.add(droneGroup);
    droneModelRef.current = droneGroup;

    // Trail
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffaa,
      linewidth: 2,
      transparent: true,
      opacity: 0.7
    });
    const trailGeometry = new THREE.BufferGeometry();
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    trailLineRef.current = trailLine;
    scene.add(trailLine);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop (Direct)
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const position = positionRef.current;
      const rotation = rotationRef.current;
      const cameraMode = cameraModeRef.current;
      const cameraDistance = cameraDistanceRef.current;

      propellersRef.current.forEach((prop) => {
        prop.rotation.y += 0.5;
      });

      if (droneModelRef.current) {
        if (trailRef.current.length === 0 ||
          position.some((v, i) => Math.abs(v - trailRef.current[trailRef.current.length - 1][i]) > 0.1)) {
          trailRef.current.push([...position]);
          if (trailRef.current.length > 300) {
            trailRef.current.shift();
          }

          const trailPoints = trailRef.current.map(p => new THREE.Vector3(...p));
          if (trailLineRef.current && trailPoints.length > 1) {
            const newGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
            trailLineRef.current.geometry.dispose();
            trailLineRef.current.geometry = newGeometry;
          }
        }
      }

      if (cameraRef.current && droneModelRef.current) {
        const dronePos = droneModelRef.current.position;

        switch (cameraMode) {
          case 'fpv':
            cameraRef.current.position.copy(dronePos);
            cameraRef.current.position.y += 0.1;
            cameraRef.current.position.z += 0.3 * Math.cos(rotation[1]);
            cameraRef.current.position.x += 0.3 * Math.sin(rotation[1]);
            cameraRef.current.lookAt(
              dronePos.x + Math.sin(rotation[1]) * 10,
              dronePos.y - 0.2,
              dronePos.z + Math.cos(rotation[1]) * 10
            );
            break;

          case 'follow':
            const behind = new THREE.Vector3(
              -Math.sin(rotation[1]) * cameraDistance * 0.3,
              cameraDistance * 0.8,
              -Math.cos(rotation[1]) * cameraDistance * 0.3
            );
            cameraRef.current.position.lerp(
              dronePos.clone().add(behind),
              0.05
            );
            cameraRef.current.lookAt(dronePos.x, dronePos.y, dronePos.z);
            break;

          case 'orbit':
            const time = Date.now() * 0.0002;
            cameraRef.current.position.x = dronePos.x + Math.cos(time) * cameraDistance;
            cameraRef.current.position.y = dronePos.y + cameraDistance * 0.4;
            cameraRef.current.position.z = dronePos.z + Math.sin(time) * cameraDistance;
            cameraRef.current.lookAt(dronePos.x, dronePos.y, dronePos.z);
            break;

          case 'topdown':
            cameraRef.current.position.x = dronePos.x;
            cameraRef.current.position.y = dronePos.y + cameraDistance * 3;
            cameraRef.current.position.z = dronePos.z + 0.01;
            cameraRef.current.lookAt(dronePos.x, dronePos.y, dronePos.z);
            break;

          case 'free':
          default:
            cameraRef.current.position.set(0, 80, 0.1);
            cameraRef.current.lookAt(0, 0, 0);
            break;
        }
      }

      renderer.render(scene, cameraRef.current);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      planeGeometry.dispose();
      padGeometry.dispose();
      ringGeometry.dispose();
      starsGeometry.dispose();
      bodyGeometry.dispose();
      topGeometry.dispose();
      planeMaterial.dispose();
      padMaterial.dispose();
      ringMaterial.dispose();
      starsMaterial.dispose();
      bodyMaterial.dispose();
      topMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      scene.clear();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
});

DroneScene.displayName = 'DroneScene';
