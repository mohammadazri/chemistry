import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Realistic wall-mounted analog clock for the 3D lab scene.
 * Shows real local time with accurately pivoted hour, minute, and second hands.
 *
 * The clock is oriented so the face points toward +Z (toward the camera).
 * Hands rotate around Z axis, pivoted at the bottom (center of clock).
 */
export default function AnalogClock({ position = [2, 3.5, -4.95] as [number, number, number] }) {
    const secondHandRef = useRef<THREE.Group>(null);
    const minuteHandRef = useRef<THREE.Group>(null);
    const hourHandRef = useRef<THREE.Group>(null);

    const R = 0.35; // clock face radius

    useFrame(() => {
        const now = new Date();
        const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
        const minutes = now.getMinutes() + seconds / 60;
        const hours = (now.getHours() % 12) + minutes / 60;

        // Rotation: 0 = 12 o'clock (up), clockwise = negative Z rotation
        if (secondHandRef.current) {
            secondHandRef.current.rotation.z = -(seconds / 60) * Math.PI * 2;
        }
        if (minuteHandRef.current) {
            minuteHandRef.current.rotation.z = -(minutes / 60) * Math.PI * 2;
        }
        if (hourHandRef.current) {
            hourHandRef.current.rotation.z = -(hours / 12) * Math.PI * 2;
        }
    });

    // Hour tick marks
    const ticks = Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHour = i % 5 === 0;
        const outerR = R * 0.92;
        const innerR = isHour ? R * 0.76 : R * 0.84;
        const cx = Math.cos(angle) * ((outerR + innerR) / 2);
        const cy = Math.sin(angle) * ((outerR + innerR) / 2);
        const len = outerR - innerR;
        return { angle, cx, cy, len, isHour };
    });

    // Numbers 1-12
    const numbers = Array.from({ length: 12 }, (_, i) => {
        const num = i === 0 ? 12 : i;
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const nr = R * 0.62;
        return {
            num: num.toString(),
            x: Math.cos(angle) * nr,
            y: Math.sin(angle) * nr,
        };
    });

    return (
        <group position={position}>
            {/* Back casing — dark plastic, slightly thicker than bezel */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[R + 0.05, R + 0.05, 0.06, 48]} />
                <meshStandardMaterial color="#222222" roughness={0.35} metalness={0.2} />
            </mesh>

            {/* Chrome bezel ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
                <torusGeometry args={[R + 0.02, 0.018, 16, 48]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
            </mesh>

            {/* Clock face — off-white disc */}
            <mesh position={[0, 0, 0.025]}>
                <circleGeometry args={[R, 48]} />
                <meshStandardMaterial color="#f8f6f0" roughness={0.85} />
            </mesh>

            {/* Minute & second tick marks */}
            {ticks.map((t, i) => (
                <mesh
                    key={i}
                    position={[t.cx, t.cy, 0.027]}
                    rotation={[0, 0, t.angle + Math.PI / 2]}
                >
                    <boxGeometry args={[t.isHour ? 0.014 : 0.005, t.len, 0.002]} />
                    <meshStandardMaterial color={t.isHour ? '#111111' : '#555555'} />
                </mesh>
            ))}

            {/* Numbers 1-12 */}
            {numbers.map((n) => (
                <Text
                    key={n.num}
                    position={[n.x, n.y, 0.028]}
                    fontSize={0.055}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                >
                    {n.num}
                </Text>
            ))}

            {/* Brand text */}
            <Text position={[0, -0.10, 0.028]} fontSize={0.022} color="#999999"
                anchorX="center" anchorY="middle">
                HoloLab
            </Text>

            {/*
              HAND CONSTRUCTION:
              Each hand is a <group> that rotates around Z at position [0,0].
              Inside the group, the mesh is offset upward (+Y) so the bottom
              of the hand sits at the pivot point (center of clock face).
            */}

            {/* Hour hand — short, wide, tapered */}
            <group ref={hourHandRef} position={[0, 0, 0.032]}>
                <mesh position={[0, R * 0.22, 0]}>
                    <boxGeometry args={[0.022, R * 0.44, 0.008]} />
                    <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.3} />
                </mesh>
                {/* Pointed tip */}
                <mesh position={[0, R * 0.44 + 0.01, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.015, 0.015, 0.008]} />
                    <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.3} />
                </mesh>
            </group>

            {/* Minute hand — longer, thinner */}
            <group ref={minuteHandRef} position={[0, 0, 0.038]}>
                <mesh position={[0, R * 0.33, 0]}>
                    <boxGeometry args={[0.015, R * 0.66, 0.006]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
                </mesh>
                <mesh position={[0, R * 0.66 + 0.008, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.010, 0.010, 0.006]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
                </mesh>
            </group>

            {/* Second hand — very thin, red, with counterweight tail */}
            <group ref={secondHandRef} position={[0, 0, 0.043]}>
                {/* Main shaft going up */}
                <mesh position={[0, R * 0.35, 0]}>
                    <boxGeometry args={[0.004, R * 0.70, 0.003]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                {/* Counterweight tail going down */}
                <mesh position={[0, -R * 0.10, 0]}>
                    <boxGeometry args={[0.008, R * 0.20, 0.003]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
                {/* Tip circle */}
                <mesh position={[0, R * 0.72, 0]}>
                    <circleGeometry args={[0.006, 12]} />
                    <meshStandardMaterial color="#cc0000" />
                </mesh>
            </group>

            {/* Center cap — metallic */}
            <mesh position={[0, 0, 0.048]} rotation={[0, 0, 0]}>
                <circleGeometry args={[0.02, 20]} />
                <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Glass cover */}
            <mesh position={[0, 0, 0.055]}>
                <circleGeometry args={[R - 0.01, 48]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.06}
                    roughness={0.02}
                    transmission={0.94}
                    ior={1.5}
                />
            </mesh>
        </group>
    );
}
