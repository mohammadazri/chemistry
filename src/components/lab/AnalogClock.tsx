import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Realistic wall-mounted analog clock.
 * Oriented so the face points toward +Z (toward the camera).
 * All elements are layered in front of the back casing.
 */
export default function AnalogClock({ position = [3, 3.2, -4.93] as [number, number, number] }) {
    const secondRef = useRef<THREE.Group>(null);
    const minuteRef = useRef<THREE.Group>(null);
    const hourRef = useRef<THREE.Group>(null);

    const R = 0.32;

    useFrame(() => {
        const now = new Date();
        const s = now.getSeconds() + now.getMilliseconds() / 1000;
        const m = now.getMinutes() + s / 60;
        const h = (now.getHours() % 12) + m / 60;

        if (secondRef.current) secondRef.current.rotation.z = -(s / 60) * Math.PI * 2;
        if (minuteRef.current) minuteRef.current.rotation.z = -(m / 60) * Math.PI * 2;
        if (hourRef.current) hourRef.current.rotation.z = -(h / 12) * Math.PI * 2;
    });

    // 60 tick marks (bold every 5)
    const ticks = Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHr = i % 5 === 0;
        const outer = R * 0.91;
        const inner = isHr ? R * 0.74 : R * 0.84;
        return {
            x: Math.cos(a) * ((outer + inner) / 2),
            y: Math.sin(a) * ((outer + inner) / 2),
            a, len: outer - inner, isHr,
        };
    });

    // Numbers 1-12
    const nums = Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i;
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return { n: n.toString(), x: Math.cos(a) * R * 0.60, y: Math.sin(a) * R * 0.60 };
    });

    // Z layers (front-to-back, all positive = toward camera)
    const Z = {
        casing: 0,       // back of clock
        face: 0.035,     // white face in front of casing
        ticks: 0.037,
        nums: 0.038,
        brand: 0.038,
        hourHand: 0.040,
        minHand: 0.044,
        secHand: 0.048,
        cap: 0.052,
        glass: 0.056,
        bezel: 0.030,
    };

    return (
        <group position={position}>
            {/* ---- BACK CASING (dark plastic body) ---- */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, Z.casing]}>
                <cylinderGeometry args={[R + 0.04, R + 0.04, 0.05, 48]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.35} metalness={0.15} />
            </mesh>

            {/* ---- CHROME BEZEL ---- */}
            <mesh position={[0, 0, Z.bezel]}>
                <torusGeometry args={[R + 0.015, 0.016, 16, 64]} />
                <meshStandardMaterial color="#d4d4d4" metalness={0.95} roughness={0.04} />
            </mesh>

            {/* ---- WHITE FACE ---- */}
            <mesh position={[0, 0, Z.face]}>
                <circleGeometry args={[R, 64]} />
                <meshStandardMaterial color="#faf8f2" roughness={0.8} side={THREE.FrontSide} />
            </mesh>

            {/* ---- TICK MARKS ---- */}
            {ticks.map((t, i) => (
                <mesh key={i} position={[t.x, t.y, Z.ticks]} rotation={[0, 0, t.a + Math.PI / 2]}>
                    <boxGeometry args={[t.isHr ? 0.013 : 0.004, t.len, 0.002]} />
                    <meshStandardMaterial color={t.isHr ? '#111' : '#666'} />
                </mesh>
            ))}

            {/* ---- NUMBERS ---- */}
            {nums.map((n) => (
                <Text key={n.n} position={[n.x, n.y, Z.nums]}
                    fontSize={0.048} color="#1a1a1a" anchorX="center" anchorY="middle" fontWeight={700}
                >{n.n}</Text>
            ))}

            {/* ---- BRAND ---- */}
            <Text position={[0, -R * 0.30, Z.brand]}
                fontSize={0.02} color="#aaa" anchorX="center" anchorY="middle"
            >HoloLab</Text>

            {/* ---- HOUR HAND (short, thick) ---- */}
            <group ref={hourRef} position={[0, 0, Z.hourHand]}>
                <mesh position={[0, R * 0.20, 0]}>
                    <boxGeometry args={[0.020, R * 0.40, 0.007]} />
                    <meshStandardMaterial color="#111" roughness={0.5} metalness={0.4} />
                </mesh>
            </group>

            {/* ---- MINUTE HAND (longer, thinner) ---- */}
            <group ref={minuteRef} position={[0, 0, Z.minHand]}>
                <mesh position={[0, R * 0.31, 0]}>
                    <boxGeometry args={[0.013, R * 0.62, 0.005]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.4} />
                </mesh>
            </group>

            {/* ---- SECOND HAND (thin, red, with counterweight) ---- */}
            <group ref={secondRef} position={[0, 0, Z.secHand]}>
                <mesh position={[0, R * 0.32, 0]}>
                    <boxGeometry args={[0.004, R * 0.64, 0.003]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                {/* Counterweight */}
                <mesh position={[0, -R * 0.09, 0]}>
                    <boxGeometry args={[0.008, R * 0.18, 0.003]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
            </group>

            {/* ---- CENTER CAP ---- */}
            <mesh position={[0, 0, Z.cap]}>
                <circleGeometry args={[0.018, 20]} />
                <meshStandardMaterial color="#999" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* ---- GLASS ---- */}
            <mesh position={[0, 0, Z.glass]}>
                <circleGeometry args={[R - 0.005, 48]} />
                <meshPhysicalMaterial
                    color="#fff" transparent opacity={0.05}
                    roughness={0.01} transmission={0.95} ior={1.5}
                />
            </mesh>
        </group>
    );
}
