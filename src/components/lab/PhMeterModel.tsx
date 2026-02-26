import { useExperimentStore } from '../../store/experimentStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function PhMeterModel() {
    const currentPH = useExperimentStore((state) => state.currentPH);

    // Color logic for the digital screen text
    const textColor = '#10b981'; // Bright emerald green for realistic LED feel

    // The meter is roughly at [0, -0.4, 0] (relative to group)
    // The probe top is at [-1.2, 0.03, 0]
    const wireCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.2, 0.03, 0),       // Probe top
        new THREE.Vector3(-0.6, -0.2, -0.5),    // Drooping control point behind
        new THREE.Vector3(0, -0.4, -0.15)       // Back of the meter
    );

    return (
        <group position={[1.2, 0, 0]}>
            {/* --- Device Body (Benchtop Meter) --- */}
            <mesh position={[0, -0.4, 0]} rotation={[0.2, -0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.6, 0.4]} />
                <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Screen Face */}
            <mesh position={[-0.03, -0.3, 0.2]} rotation={[0.2, -0.2, 0]}>
                <boxGeometry args={[0.4, 0.2, 0.02]} />
                <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.8} />
            </mesh>

            {/* Screen Glass Reflection */}
            <mesh position={[-0.03, -0.3, 0.211]} rotation={[0.2, -0.2, 0]}>
                <planeGeometry args={[0.38, 0.18]} />
                <meshPhysicalMaterial transparent opacity={0.2} roughness={0} clearcoat={1} transmission={0.2} />
            </mesh>

            {/* pH Label */}
            <Text
                position={[-0.1, -0.24, 0.22]}
                rotation={[0.2, -0.2, 0]}
                fontSize={0.035}
                color="#64748b"
                anchorX="center"
                anchorY="middle"
            >
                pH METER
            </Text>

            {/* Digital Number */}
            <Text
                position={[0.05, -0.32, 0.22]}
                rotation={[0.2, -0.2, 0]}
                fontSize={0.12}
                color={textColor}
                anchorX="center"
                anchorY="middle"
            >
                {currentPH.toFixed(2)}
            </Text>

            {/* --- Electrode / Probe --- */}
            {/* The global flask position is x:0. This group is at x:1.2. 
                So relative to this group, the flask center is at x:-1.2. 
                We place the probe right into the flask. */}
            <group position={[-1.2, -0.25, 0]}>
                {/* Electrode Tip (Glass Bulb strictly in liquid) */}
                <mesh position={[0, -0.15, 0]}>
                    <sphereGeometry args={[0.015, 16]} />
                    <meshPhysicalMaterial transparent opacity={0.6} transmission={0.9} roughness={0} />
                </mesh>

                {/* Electrode Body (Glass rod extending down) */}
                <mesh position={[0, 0.05, 0]} castShadow>
                    <cylinderGeometry args={[0.015, 0.015, 0.4, 16]} />
                    <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.9} transparent opacity={0.6} />
                </mesh>

                {/* Probe Cap / Wire Connector */}
                <mesh position={[0, 0.28, 0]} castShadow>
                    <cylinderGeometry args={[0.02, 0.02, 0.06, 16]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.6} />
                </mesh>
            </group>

            {/* --- Connecting Wire --- */}
            <mesh castShadow>
                <tubeGeometry args={[wireCurve, 20, 0.005, 8, false]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} />
            </mesh>
        </group>
    );
}
