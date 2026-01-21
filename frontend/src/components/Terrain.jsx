import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Simple pseudo-random noise function
const noise = (x, z) => {
    let y = 0;
    // Layer 1: Large mountains
    y += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 10;
    // Layer 2: Medium hills
    y += Math.sin(x * 0.15 + 1.4) * Math.cos(z * 0.15 + 2.3) * 4;
    // Layer 3: Small detail
    y += Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1;

    // Flatten center area for landing pad (radius 20)
    const dist = Math.sqrt(x * x + z * z);
    if (dist < 20) {
        y *= Math.max(0, (dist - 10) / 10);
    }

    return Math.max(-5, y); // Floor at -5
};

export const Terrain = () => {
    const meshRef = useRef();

    const { geometry, colors } = useMemo(() => {
        const size = 400;
        const resolution = 100;
        const geom = new THREE.PlaneGeometry(size, size, resolution, resolution);

        const positions = geom.attributes.position;
        const colors = [];
        const colorAttribute = new THREE.Float32BufferAttribute(positions.count * 3, 3);

        const count = positions.count;
        for (let i = 0; i < count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i); // Plane is consistent X-Y, we rotate later

            // Calculate height
            const height = noise(x, z);
            positions.setZ(i, height); // Set Z because Plane defaults to XY

            // Calculate Color based on Height
            let color = new THREE.Color();

            if (height < 1) {
                // Valley / Grass (Dark Green)
                color.setHSL(0.35, 0.4, 0.15 + Math.random() * 0.05);
            } else if (height < 8) {
                // Hills / Rock (Grey-Brown)
                const t = (height - 1) / 7;
                color.lerpColors(
                    new THREE.Color(0x2a3a2a),
                    new THREE.Color(0x5a5a5a),
                    t
                );
            } else {
                // Peaks / Snow (White-Grey)
                const t = Math.min(1, (height - 8) / 8);
                color.lerpColors(
                    new THREE.Color(0x5a5a5a),
                    new THREE.Color(0xffffff),
                    t
                );
            }

            colorAttribute.setXYZ(i, color.r, color.g, color.b);
        }

        geom.setAttribute('color', colorAttribute);
        geom.computeVertexNormals();

        return { geometry: geom };
    }, []);

    return (
        <group>
            <mesh
                ref={meshRef}
                geometry={geometry}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <meshStandardMaterial
                    vertexColors
                    roughness={0.9}
                    metalness={0.1}
                    flatShading={true}
                />
            </mesh>

            {/* Water Plane underneath */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#001133" roughness={0.1} metalness={0.8} />
            </mesh>
        </group>
    );
};
