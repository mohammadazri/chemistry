import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Premium wall-mounted analog clock with detailed design.
 * Features: Roman-inspired markers, inner decorative ring, styled hands,
 * all 12 numbers, minute dots, and smooth real-time animation.
 */
export default function AnalogClock({ position = [5.5, 3.2, -4.93] as [number, number, number] }) {
    const secondRef = useRef<THREE.Group>(null);
    const minuteRef = useRef<THREE.Group>(null);
    const hourRef = useRef<THREE.Group>(null);

    const R = 0.55;

    useFrame(() => {
        const now = new Date();
        const s = now.getSeconds() + now.getMilliseconds() / 1000;
        const m = now.getMinutes() + s / 60;
        const h = (now.getHours() % 12) + m / 60;

        if (secondRef.current) secondRef.current.rotation.z = -(s / 60) * Math.PI * 2;
        if (minuteRef.current) minuteRef.current.rotation.z = -(m / 60) * Math.PI * 2;
        if (hourRef.current) hourRef.current.rotation.z = -(h / 12) * Math.PI * 2;
    });

    // Z layers
    const Z = {
        casing: 0,
        outerRing: 0.028,
        face: 0.032,
        decorRing: 0.034,
        ticks: 0.036,
        nums: 0.038,
        brand: 0.039,
        hourHand: 0.042,
        minHand: 0.046,
        secHand: 0.050,
        cap: 0.054,
        glass: 0.058,
    };

    // 60 tick marks
    const ticks = Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHr = i % 5 === 0;
        const outer = R * 0.90;
        const inner = isHr ? R * 0.72 : R * 0.83;
        return {
            x: Math.cos(a) * ((outer + inner) / 2),
            y: Math.sin(a) * ((outer + inner) / 2),
            a, len: outer - inner, isHr,
        };
    });

    // All 12 numbers
    const nums = Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i;
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return { n: n.toString(), x: Math.cos(a) * R * 0.56, y: Math.sin(a) * R * 0.56 };
    });

    // Small decorative dots between hour marks
    const dots = Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null; // skip hour positions
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const dr = R * 0.92;
        return { x: Math.cos(a) * dr, y: Math.sin(a) * dr };
    }).filter(Boolean) as { x: number; y: number }[];

    return (
        <group position={position}>
            {/* ═══ BACK CASING — dark walnut wood-style body ═══ */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, Z.casing]}>
                <cylinderGeometry args={[R + 0.06, R + 0.06, 0.06, 64]} />
                <meshStandardMaterial color="#2d1b0e" roughness={0.6} metalness={0.05} />
            </mesh>

            {/* ═══ OUTER METALLIC BEZEL — brushed gold ═══ */}
            <mesh position={[0, 0, Z.outerRing]}>
                <torusGeometry args={[R + 0.025, 0.022, 16, 64]} />
                <meshStandardMaterial color="#c9a84c" metalness={0.85} roughness={0.15} />
            </mesh>

            {/* Inner accent ring */}
            <mesh position={[0, 0, Z.outerRing + 0.001]}>
                <torusGeometry args={[R - 0.02, 0.006, 12, 64]} />
                <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* ═══ CLOCK FACE — cream/ivory with subtle warmth ═══ */}
            <mesh position={[0, 0, Z.face]}>
                <circleGeometry args={[R, 64]} />
                <meshStandardMaterial color="#f5f0e1" roughness={0.75} side={THREE.FrontSide} />
            </mesh>

            {/* ═══ DECORATIVE INNER CIRCLE — subtle chapter ring ═══ */}
            <mesh position={[0, 0, Z.decorRing]}>
                <torusGeometry args={[R * 0.68, 0.003, 8, 64]} />
                <meshStandardMaterial color="#c9a84c" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* ═══ HOUR TICK MARKS — bold wedges ═══ */}
            {ticks.filter(t => t.isHr).map((t, i) => (
                <mesh key={`h-${i}`} position={[t.x, t.y, Z.ticks]} rotation={[0, 0, t.a + Math.PI / 2]}>
                    <boxGeometry args={[0.018, t.len, 0.004]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
                </mesh>
            ))}

            {/* ═══ MINUTE DOTS — small circles around the edge ═══ */}
            {dots.map((d, i) => (
                <mesh key={`d-${i}`} position={[d.x, d.y, Z.ticks]}>
                    <circleGeometry args={[0.006, 8]} />
                    <meshStandardMaterial color="#888888" />
                </mesh>
            ))}

            {/* ═══ NUMBERS 1-12 — elegant serif-style ═══ */}
            {nums.map((n) => (
                <Text key={n.n} position={[n.x, n.y, Z.nums]}
                    fontSize={n.n === '12' ? 0.07 : 0.06}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                >{n.n}</Text>
            ))}

            {/* ═══ BRAND TEXT ═══ */}
            <Text position={[0, -R * 0.32, Z.brand]}
                fontSize={0.028} color="#8b7355" anchorX="center" anchorY="middle"
                fontWeight={700}
            >HoloLab</Text>

            <Text position={[0, R * 0.25, Z.brand]}
                fontSize={0.018} color="#aaa" anchorX="center" anchorY="middle"
            >QUARTZ</Text>

            {/* ═══ HOUR HAND — arrow-shaped, dark steel ═══ */}
            <group ref={hourRef} position={[0, 0, Z.hourHand]}>
                {/* Main shaft */}
                <mesh position={[0, R * 0.18, 0]}>
                    <boxGeometry args={[0.024, R * 0.36, 0.008]} />
                    <meshStandardMaterial color="#111" roughness={0.4} metalness={0.5} />
                </mesh>
                {/* Arrow tip */}
                <mesh position={[0, R * 0.38, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.020, 0.020, 0.008]} />
                    <meshStandardMaterial color="#111" roughness={0.4} metalness={0.5} />
                </mesh>
                {/* Tail counterweight */}
                <mesh position={[0, -R * 0.06, 0]}>
                    <boxGeometry args={[0.03, R * 0.12, 0.008]} />
                    <meshStandardMaterial color="#111" roughness={0.4} metalness={0.5} />
                </mesh>
            </group>

            {/* ═══ MINUTE HAND — longer, sleek ═══ */}
            <group ref={minuteRef} position={[0, 0, Z.minHand]}>
                <mesh position={[0, R * 0.30, 0]}>
                    <boxGeometry args={[0.016, R * 0.60, 0.006]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.5} />
                </mesh>
                {/* Arrow tip */}
                <mesh position={[0, R * 0.62, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.013, 0.013, 0.006]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.5} />
                </mesh>
                {/* Tail */}
                <mesh position={[0, -R * 0.05, 0]}>
                    <boxGeometry args={[0.022, R * 0.10, 0.006]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.5} />
                </mesh>
            </group>

            {/* ═══ SECOND HAND — thin red with circle tip ═══ */}
            <group ref={secondRef} position={[0, 0, Z.secHand]}>
                {/* Main shaft */}
                <mesh position={[0, R * 0.30, 0]}>
                    <boxGeometry args={[0.005, R * 0.60, 0.003]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                {/* Counterweight tail */}
                <mesh position={[0, -R * 0.10, 0]}>
                    <boxGeometry args={[0.010, R * 0.20, 0.003]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                {/* Tip dot */}
                <mesh position={[0, R * 0.62, 0]}>
                    <circleGeometry args={[0.008, 12]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
            </group>

            {/* ═══ CENTER CAP — gold boss ═══ */}
            <mesh position={[0, 0, Z.cap]}>
                <circleGeometry args={[0.025, 24]} />
                <meshStandardMaterial color="#c9a84c" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Inner dot */}
            <mesh position={[0, 0, Z.cap + 0.001]}>
                <circleGeometry args={[0.010, 16]} />
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* ═══ GLASS COVER ═══ */}
            <mesh position={[0, 0, Z.glass]}>
                <circleGeometry args={[R - 0.005, 64]} />
                <meshPhysicalMaterial
                    color="#fff" transparent opacity={0.05}
                    roughness={0.01} transmission={0.95} ior={1.5}
                />
            </mesh>
        </group>
    );
}
