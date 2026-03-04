import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Realistic lab emergency shower & eyewash station.
 * Based on ANSI Z358.1 standard:
 * - Vertical supply pipe from ceiling
 * - Wide yellow shower head disc
 * - Triangle pull handle with chain
 * - Combined eyewash bowl at waist height with dual nozzles
 * - Safety yellow coloring
 * - Green "EMERGENCY SHOWER" sign above
 */
export default function EmergencyShower({ position = [-6.5, 0, -3.5] as [number, number, number] }) {
    return (
        <group position={position}>

            {/* ════════ SIGN ABOVE ════════ */}
            {/* Green background */}
            <mesh position={[0, 4.8, 0]}>
                <boxGeometry args={[1.1, 0.45, 0.03]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* White border */}
            <mesh position={[0, 4.8, 0.016]}>
                <planeGeometry args={[1.0, 0.36]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            {/* Border line */}
            <mesh position={[0, 4.8, 0.017]}>
                <planeGeometry args={[1.04, 0.40]} />
                <meshStandardMaterial color="#0e6b2e" roughness={0.7} />
            </mesh>
            <Text position={[0, 4.82, 0.02]} fontSize={0.08} color="#ffffff"
                anchorX="center" anchorY="middle" fontWeight={700}>
                EMERGENCY SHOWER
            </Text>
            <Text position={[0, 4.72, 0.02]} fontSize={0.05} color="#ffffff"
                anchorX="center" anchorY="middle">
                & EYEWASH STATION
            </Text>

            {/* ════════ MAIN VERTICAL PIPE — ceiling to shower head ════════ */}
            <mesh position={[0, 3.5, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 5.0, 12]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.25} metalness={0.75} />
            </mesh>

            {/* Pipe flange — ceiling mount */}
            <mesh position={[0, 5.45, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
                <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* ════════ SHOWER HEAD ASSEMBLY ════════ */}
            {/* Elbow joint — pipe turns outward */}
            <mesh position={[0, 4.2, 0]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.25} metalness={0.75} />
            </mesh>
            {/* Horizontal arm */}
            <mesh position={[0.2, 4.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 0.4, 12]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.25} metalness={0.75} />
            </mesh>
            {/* Shower head — large yellow disc */}
            <mesh position={[0.4, 4.15, 0]}>
                <cylinderGeometry args={[0.18, 0.15, 0.04, 24]} />
                <meshStandardMaterial color="#ffc107" roughness={0.55} metalness={0.1} />
            </mesh>
            {/* Shower head bottom — perforated look */}
            <mesh position={[0.4, 4.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.15, 24]} />
                <meshStandardMaterial color="#e8a800" roughness={0.6} />
            </mesh>
            {/* Shower head inner ring */}
            <mesh position={[0.4, 4.13, 0]}>
                <torusGeometry args={[0.10, 0.008, 8, 20]} />
                <meshStandardMaterial color="#ddd" roughness={0.3} metalness={0.5} />
            </mesh>

            {/* ════════ PULL HANDLE — triangle bar ════════ */}
            {/* Triangle pull rod — horizontal bar */}
            <mesh position={[0.4, 3.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.25, 8]} />
                <meshStandardMaterial color="#ffc107" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Triangle left arm */}
            <mesh position={[0.30, 3.85, 0]} rotation={[0, 0, 0.15]}>
                <cylinderGeometry args={[0.008, 0.008, 0.5, 6]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Triangle right arm */}
            <mesh position={[0.50, 3.85, 0]} rotation={[0, 0, -0.15]}>
                <cylinderGeometry args={[0.008, 0.008, 0.5, 6]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* ════════ EYEWASH STATION — at waist height ════════ */}
            {/* Horizontal arm from main pipe */}
            <mesh position={[0.22, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.45, 10]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.25} metalness={0.75} />
            </mesh>

            {/* Eyewash bowl — stainless steel basin */}
            <mesh position={[0.45, 0.12, 0]}>
                <cylinderGeometry args={[0.20, 0.14, 0.10, 20, 1, true]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8}
                    side={THREE.DoubleSide} />
            </mesh>
            {/* Bowl bottom */}
            <mesh position={[0.45, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.14, 20]} />
                <meshStandardMaterial color="#b0b0b0" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Bowl rim */}
            <mesh position={[0.45, 0.17, 0]}>
                <torusGeometry args={[0.20, 0.012, 8, 24]} />
                <meshStandardMaterial color="#d0d0d0" roughness={0.2} metalness={0.8} />
            </mesh>

            {/* Eyewash nozzles — two yellow spouts */}
            <mesh position={[0.40, 0.15, 0.06]}>
                <cylinderGeometry args={[0.012, 0.015, 0.05, 8]} />
                <meshStandardMaterial color="#ffc107" roughness={0.5} />
            </mesh>
            <mesh position={[0.50, 0.15, 0.06]}>
                <cylinderGeometry args={[0.012, 0.015, 0.05, 8]} />
                <meshStandardMaterial color="#ffc107" roughness={0.5} />
            </mesh>
            {/* Nozzle dust covers — green flip caps */}
            <mesh position={[0.40, 0.19, 0.06]}>
                <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                <meshStandardMaterial color="#28a745" roughness={0.6} />
            </mesh>
            <mesh position={[0.50, 0.19, 0.06]}>
                <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                <meshStandardMaterial color="#28a745" roughness={0.6} />
            </mesh>

            {/* Eyewash activation handle — paddle */}
            <mesh position={[0.45, 0.10, 0.22]} rotation={[Math.PI / 6, 0, 0]}>
                <boxGeometry args={[0.12, 0.02, 0.08]} />
                <meshStandardMaterial color="#ffc107" roughness={0.5} />
            </mesh>
            {/* Handle arm */}
            <mesh position={[0.45, 0.07, 0.17]} rotation={[Math.PI / 4, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* ════════ FLOOR DRAIN — below shower ════════ */}
            <mesh position={[0.3, -2.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.25, 20]} />
                <meshStandardMaterial color="#666" roughness={0.8} metalness={0.3} />
            </mesh>
            {/* Drain grate bars */}
            {[-0.12, -0.04, 0.04, 0.12].map((offset, i) => (
                <mesh key={`dg-${i}`} position={[0.3, -2.98, offset]} rotation={[-Math.PI / 2, 0, 0]}>
                    <boxGeometry args={[0.40, 0.01, 0.008]} />
                    <meshStandardMaterial color="#888" roughness={0.3} metalness={0.6} />
                </mesh>
            ))}

            {/* ════════ YELLOW HAZARD STRIPE on floor ════════ */}
            <mesh position={[0.3, -2.995, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.2, 1.2]} />
                <meshStandardMaterial color="#ffd700" roughness={0.8} transparent opacity={0.4} />
            </mesh>
        </group>
    );
}
