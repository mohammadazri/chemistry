import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Realistic ceiling-mounted lab emergency shower & eyewash station.
 * - Vertical supply pipe from ceiling
 * - Wide yellow shower head disc (properly connected)
 * - Solid pull rod attached to a valve lever
 * - Combined eyewash bowl at waist height with dual nozzles
 * - Safety yellow coloring
 */
export default function EmergencyShower({ position = [-6.5, 0, -3.5] as [number, number, number] }) {
    const pipeColor = "#e6d52e"; // Safety yellow for key parts
    const steelColor = "#c0c0c0"; // Stainless steel pipe

    return (
        <group position={position}>

            {/* ════════ SIGN ABOVE ════════ */}
            {/* Green background */}
            <mesh position={[0.0, 4.8, 0]}>
                <boxGeometry args={[1.1, 0.45, 0.03]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* White border */}
            <mesh position={[0.0, 4.8, 0.016]}>
                <planeGeometry args={[1.0, 0.36]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Border line */}
            <mesh position={[0.0, 4.8, 0.017]}>
                <planeGeometry args={[1.04, 0.40]} />
                <meshStandardMaterial color="#0e6b2e" roughness={0.7} />
            </mesh>
            <Text position={[0.0, 4.85, 0.02]} fontSize={0.08} color="#ffffff"
                anchorX="center" anchorY="middle" fontWeight={700}>
                EMERGENCY SHOWER
            </Text>
            <Text position={[0.0, 4.73, 0.02]} fontSize={0.045} color="#ffffff"
                anchorX="center" anchorY="middle">
                & EYEWASH STATION
            </Text>

            {/* ════════ MAIN VERTICAL PIPE — ceiling to floor ════════ */}
            <mesh position={[-0.2, 2.7, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 5.5, 16]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Pipe flange — ceiling mount */}
            <mesh position={[-0.2, 5.45, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
                <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.5} />
            </mesh>

            {/* Pipe couplings */}
            {[1.5, 3.0, 4.5].map(y => (
                <mesh key={`cpl-${y}`} position={[-0.2, y, 0]}>
                    <cylinderGeometry args={[0.038, 0.038, 0.06, 16]} />
                    <meshStandardMaterial color={steelColor} roughness={0.4} metalness={0.6} />
                </mesh>
            ))}

            {/* ════════ SHOWER HEAD ASSEMBLY ════════ */}
            {/* T-junction on main pipe */}
            <mesh position={[-0.2, 4.2, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Horizontal arm out to shower head */}
            <mesh position={[0.1, 4.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 0.6, 12]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Downdrop pipe to shower head (The Missing Connection) */}
            <mesh position={[0.4, 4.1, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.2, 12]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Elbow connecting horizontal to downdrop */}
            <mesh position={[0.4, 4.2, 0]}>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Shower head — Flared yellow bell */}
            <group position={[0.4, 3.95, 0]}>
                {/* Top narrow part */}
                <mesh position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.03, 0.08, 0.06, 24]} />
                    <meshStandardMaterial color={pipeColor} roughness={0.5} />
                </mesh>
                {/* Main flared bell */}
                <mesh position={[0, -0.02, 0]}>
                    <cylinderGeometry args={[0.08, 0.16, 0.08, 24]} />
                    <meshStandardMaterial color={pipeColor} roughness={0.5} />
                </mesh>
                {/* Bottom rim */}
                <mesh position={[0, -0.07, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
                    <meshStandardMaterial color={pipeColor} roughness={0.5} />
                </mesh>
                {/* Black perforated water emitter underneath */}
                <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.15, 24]} />
                    <meshStandardMaterial color="#333" roughness={0.8} />
                </mesh>
            </group>

            {/* ════════ PULL HANDLE MECHANISM ════════ */}
            {/* Valve body (black block on horizontal arm) */}
            <mesh position={[-0.05, 4.2, 0]}>
                <boxGeometry args={[0.08, 0.08, 0.08]} />
                <meshStandardMaterial color="#222" roughness={0.5} />
            </mesh>

            {/* Valve lever arm */}
            <mesh position={[0.1, 4.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
                <cylinderGeometry args={[0.008, 0.008, 0.35, 8]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Lever pivot/ring */}
            <mesh position={[0.25, 4.38, 0]}>
                <torusGeometry args={[0.015, 0.005, 8, 16]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Vertical pull rod (solid rod, not broken lines) */}
            <mesh position={[0.25, 3.4, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 1.9, 8]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Triangle handle at bottom of rod */}
            <group position={[0.25, 2.35, 0]}>
                {/* Ring connecting rod to triangle */}
                <mesh position={[0, 0.08, 0]}>
                    <torusGeometry args={[0.01, 0.004, 8, 16]} />
                    <meshStandardMaterial color={steelColor} roughness={0.4} metalness={0.6} />
                </mesh>
                {/* Horizontal bottom grip */}
                <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.2, 12]} />
                    <meshStandardMaterial color={pipeColor} roughness={0.5} />
                </mesh>
                {/* Left side */}
                <mesh position={[-0.05, -0.01, 0]} rotation={[0, 0, 0.5]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.2, 8]} />
                    <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.6} />
                </mesh>
                {/* Right side */}
                <mesh position={[0.05, -0.01, 0]} rotation={[0, 0, -0.5]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.2, 8]} />
                    <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.6} />
                </mesh>
            </group>

            {/* ════════ EYEWASH STATION — at waist height ════════ */}
            {/* T-junction on main pipe for eyewash */}
            <mesh position={[-0.2, 0.8, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Horizontal pipe out to bowl */}
            <mesh position={[0.05, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Bowl mounting bracket (underneath) */}
            <mesh position={[0.3, 0.78, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
                <meshStandardMaterial color="#888" roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Eyewash bowl — stainless steel basin */}
            <group position={[0.3, 0.9, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.22, 0.05, 0.12, 24, 1, true]} />
                    <meshStandardMaterial color={steelColor} roughness={0.2} metalness={0.8} side={THREE.DoubleSide} />
                </mesh>
                {/* Bowl rim */}
                <mesh position={[0, 0.06, 0]}>
                    <torusGeometry args={[0.22, 0.01, 12, 32]} />
                    <meshStandardMaterial color={steelColor} roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Drain hole cover in bottom */}
                <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.04, 16]} />
                    <meshStandardMaterial color="#333" roughness={0.6} />
                </mesh>

                {/* Water supply pipe looping inside bowl */}
                <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.08, 0.008, 8, 24, Math.PI]} />
                    <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
                </mesh>

                {/* Left Nozzle */}
                <group position={[-0.08, 0.02, 0]} rotation={[0, 0, Math.PI / 8]}>
                    <cylinderGeometry args={[0.012, 0.018, 0.04, 12]} />
                    <meshStandardMaterial color={pipeColor} roughness={0.5} />
                    {/* Green Dust Cap */}
                    <mesh position={[0, 0.025, 0]}>
                        <cylinderGeometry args={[0.015, 0.015, 0.01, 12]} />
                        <meshStandardMaterial color="#28a745" roughness={0.6} />
                    </mesh>
                </group>

                {/* Right Nozzle */}
                <group position={[0.08, 0.02, 0]} rotation={[0, 0, -Math.PI / 8]}>
                    <cylinderGeometry args={[0.012, 0.018, 0.04, 12]} />
                    <meshStandardMaterial color={pipeColor} roughness={0.5} />
                    {/* Green Dust Cap */}
                    <mesh position={[0, 0.025, 0]}>
                        <cylinderGeometry args={[0.015, 0.015, 0.01, 12]} />
                        <meshStandardMaterial color="#28a745" roughness={0.6} />
                    </mesh>
                </group>
            </group>

            {/* Activation Paddle for Eyewash */}
            <group position={[0.3, 0.8, 0.28]} rotation={[Math.PI / 6, 0, 0]}>
                <mesh>
                    <boxGeometry args={[0.15, 0.12, 0.01]} />
                    <meshStandardMaterial color={pipeColor} roughness={0.5} />
                </mesh>
                <mesh position={[0, 0, -0.01]}>
                    <boxGeometry args={[0.17, 0.14, 0.01]} />
                    <meshStandardMaterial color="#b3a31e" roughness={0.6} />
                </mesh>
                {/* Black PUSH text */}
                <Text position={[0, 0, 0.006]} fontSize={0.035} color="#111" fontWeight={700}>
                    PUSH
                </Text>
            </group>

            {/* Arm linking paddle to valve */}
            <mesh position={[0.3, 0.76, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
                <meshStandardMaterial color={steelColor} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* ════════ FLOOR DRAIN ════════ */}
            <group position={[0.3, -2.99, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.25, 24]} />
                    <meshStandardMaterial color="#555" roughness={0.9} />
                </mesh>
                {/* Drain grate rings */}
                {[0.05, 0.1, 0.15, 0.2].map((r, i) => (
                    <mesh key={`dr-${i}`} position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[r, 0.005, 6, 24]} />
                        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.5} />
                    </mesh>
                ))}
                {/* Drain cross bars */}
                {[0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].map((a, i) => (
                    <mesh key={`db-${i}`} position={[0, 0.001, 0]} rotation={[0, a, 0]}>
                        <boxGeometry args={[0.45, 0.01, 0.01]} />
                        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.5} />
                    </mesh>
                ))}
            </group>

            {/* ════════ YELLOW HAZARD STRIPE on floor ════════ */}
            <mesh position={[0.3, -2.995, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.2, 1.2]} />
                <meshStandardMaterial color="#ffe135" roughness={0.8} transparent opacity={0.3} />
            </mesh>

        </group>
    );
}
