import { useExperimentStore } from '../../store/experimentStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function PhMeterModel() {
    const currentPH = useExperimentStore((state) => state.currentPH);

    // Dynamic screen color: red(acid) → green(neutral) → blue(base)
    const ph = currentPH;
    const screenColor = ph < 6.5
        ? `hsl(${Math.max(0, (ph / 6.5) * 30)}, 100%, 55%)`
        : ph > 7.5
            ? `hsl(${200 + (ph - 7.5) * 8}, 90%, 62%)`
            : '#22c55e';

    // probe top in local space: [-1.4, 0.33+0.032, 0] = [-1.4, 0.362, 0]
    const wireCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.05, -0.26, -0.12),  // back of meter body
        new THREE.Vector3(-0.8, 0.05, 0.05),     // drooping arc midpoint
        new THREE.Vector3(-1.32, 0.18, 0.10),    // probe BNC cap top
    );

    return (
        // Group offset to right of flask — Y=-0.28 puts body bottom at bench surface (~-0.62)
        <group position={[1.4, -0.28, -0.2]}>

            {/* ═══════════════════════════════════
                BENCHTOP pH METER BODY
                Based on Mettler-Toledo Seven2Go style
            ═══════════════════════════════════ */}
            {/* Main housing — dark ABS */}
            <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.38, 0.32, 0.24]} />
                <meshStandardMaterial color="#232328" roughness={0.55} metalness={0.05} />
            </mesh>

            {/* Angled top face with display */}
            <mesh position={[0, -0.025, 0.09]} rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[0.36, 0.26, 0.012]} />
                <meshStandardMaterial color="#18181c" roughness={0.4} metalness={0.08} />
            </mesh>

            {/* LCD bezel */}
            <mesh position={[0.005, -0.02, 0.112]} rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[0.285, 0.165, 0.006]} />
                <meshStandardMaterial color="#0a0a0e" roughness={0.1} metalness={0.6} />
            </mesh>

            {/* LCD active area — dark green background */}
            <mesh position={[0.005, -0.02, 0.116]} rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[0.258, 0.138, 0.003]} />
                <meshStandardMaterial color="#001500" emissive="#001a00" emissiveIntensity={0.4} roughness={0.05} />
            </mesh>

            {/* "pH" label top-left of screen */}
            <Text position={[-0.078, 0.03, 0.124]} rotation={[-0.4, 0, 0]}
                fontSize={0.026} color="#4ade80" anchorX="center" anchorY="middle">
                pH
            </Text>

            {/* Large digital pH value — color changes with pH */}
            <Text position={[0.025, -0.008, 0.124]} rotation={[-0.4, 0, 0]}
                fontSize={0.076} color={screenColor} anchorX="center" anchorY="middle" fontWeight={700}>
                {currentPH.toFixed(2)}
            </Text>

            {/* Temperature readout */}
            <Text position={[0.09, 0.032, 0.124]} rotation={[-0.4, 0, 0]}
                fontSize={0.017} color="#86efac" anchorX="center" anchorY="middle">
                25.0°C
            </Text>

            {/* ON indicator LED */}
            <mesh position={[-0.108, -0.028, 0.12]} rotation={[-0.4, 0, 0]}>
                <circleGeometry args={[0.005, 10]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={5} />
            </mesh>

            {/* Screen glass sheen */}
            <mesh position={[0.005, -0.02, 0.12]} rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[0.258, 0.138, 0.001]} />
                <meshPhysicalMaterial transparent opacity={0.07} roughness={0} clearcoat={1} />
            </mesh>

            {/* Brand label */}
            <Text position={[0, -0.12, 0.134]} rotation={[-0.4, 0, 0]}
                fontSize={0.019} color="#888888" anchorX="center" anchorY="middle">
                DIGITAL pH METER
            </Text>

            {/* 4 control buttons */}
            {[-0.10, -0.033, 0.033, 0.10].map((x, i) => (
                <mesh key={i} position={[x, -0.122, 0.125]} rotation={[-0.4, 0, 0]}>
                    <boxGeometry args={[0.044, 0.022, 0.006]} />
                    <meshStandardMaterial color={i === 0 ? "#dc2626" : "#2d3748"} roughness={0.5} metalness={0.2} />
                </mesh>
            ))}

            {/* BNC input port at back */}
            <mesh position={[-0.14, -0.17, -0.122]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.011, 0.011, 0.022, 10]} />
                <meshStandardMaterial color="#808080" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Rubber feet */}
            {[[-0.16, -0.12], [-0.16, 0.12], [0.16, -0.12], [0.16, 0.12]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.344, z]}>
                    <cylinderGeometry args={[0.017, 0.017, 0.01, 10]} />
                    <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
                </mesh>
            ))}

            {/* ═══════════════════════════════════
                GLASS ELECTRODE PROBE
                Group Y=+0.33 compensates for meter group Y=-0.28
                World probe group Y = -0.28+0.33 = +0.05
                BNC cap top at world Y ≈ +0.08 (above flask mouth -0.02)
                Sensing bulb at world Y ≈ +0.05-0.415 = -0.365 (in flask liquid)
            ═══════════════════════════════════ */}
            <group position={[-1.32, 0.15, 0.10]}>
                {/* Upper plastic body shaft */}
                <mesh position={[0, -0.10, 0]} castShadow>
                    <cylinderGeometry args={[0.013, 0.013, 0.18, 14]} />
                    <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.05} />
                </mesh>

                {/* Metal BNC cap at very top */}
                <mesh position={[0, 0.005, 0]}>
                    <cylinderGeometry args={[0.019, 0.014, 0.055, 14]} />
                    <meshStandardMaterial color="#888888" metalness={0.88} roughness={0.12} />
                </mesh>

                {/* Reference junction ring — blue band */}
                <mesh position={[0, -0.15, 0]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.022, 14]} />
                    <meshStandardMaterial color="#1d4ed8" roughness={0.35} />
                </mesh>

                {/* Lower glass sensing shaft — inside flask */}
                <mesh position={[0, -0.28, 0]} castShadow renderOrder={2}>
                    <cylinderGeometry args={[0.010, 0.012, 0.26, 12]} />
                    <meshPhysicalMaterial
                        transparent opacity={0.55}
                        roughness={0} clearcoat={1}
                        color="#d4f0ff" ior={1.47}
                        depthWrite={false}
                    />
                </mesh>

                {/* Glass sensing bulb at tip — submerged in HCl */}
                <mesh position={[0, -0.415, 0]} renderOrder={2}>
                    <sphereGeometry args={[0.012, 14, 14]} />
                    <meshPhysicalMaterial
                        transparent opacity={0.6}
                        roughness={0} clearcoat={1}
                        color="#d4f0ff" ior={1.47}
                        depthWrite={false}
                    />
                </mesh>
            </group>

            {/* Cable from meter to probe */}
            <mesh castShadow>
                <tubeGeometry args={[wireCurve, 24, 0.0038, 6, false]} />
                <meshStandardMaterial color="#111111" roughness={0.8} />
            </mesh>
        </group>
    );
}
