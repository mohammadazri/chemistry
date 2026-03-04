import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A realistic wall-mounted analog clock for the 3D lab scene.
 * Shows real local time with smoothly animated second, minute, and hour hands.
 */
export default function AnalogClock({ position = [2, 3.5, -4.95] as [number, number, number] }) {
    const secondHandRef = useRef<THREE.Mesh>(null);
    const minuteHandRef = useRef<THREE.Mesh>(null);
    const hourHandRef = useRef<THREE.Mesh>(null);

    const CLOCK_RADIUS = 0.35;

    useFrame(() => {
        const now = new Date();
        const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
        const minutes = now.getMinutes() + seconds / 60;
        const hours = (now.getHours() % 12) + minutes / 60;

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

    // Generate hour marker positions
    const hourMarkers = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const outerR = CLOCK_RADIUS * 0.88;
        const innerR = CLOCK_RADIUS * (i % 3 === 0 ? 0.72 : 0.78);
        const midR = (outerR + innerR) / 2;
        const length = outerR - innerR;
        return { angle, midR, length, isMajor: i % 3 === 0 };
    });

    // Number positions (12, 3, 6, 9)
    const numberPositions = [
        { num: '12', angle: -Math.PI / 2, r: CLOCK_RADIUS * 0.60 },
        { num: '3', angle: 0, r: CLOCK_RADIUS * 0.60 },
        { num: '6', angle: Math.PI / 2, r: CLOCK_RADIUS * 0.60 },
        { num: '9', angle: Math.PI, r: CLOCK_RADIUS * 0.60 },
    ];

    return (
        <group position={position}>
            {/* Clock body / bezel — dark plastic ring */}
            <mesh>
                <cylinderGeometry args={[CLOCK_RADIUS + 0.04, CLOCK_RADIUS + 0.04, 0.04, 48]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
            </mesh>

            {/* Clock face — white disc */}
            <mesh position={[0, 0, 0.021]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[CLOCK_RADIUS, 48]} />
                <meshStandardMaterial color="#f5f5f0" roughness={0.85} />
            </mesh>

            {/* Hour markers */}
            {hourMarkers.map((m, i) => (
                <mesh
                    key={i}
                    position={[
                        Math.cos(m.angle) * m.midR,
                        Math.sin(m.angle) * m.midR,
                        0.025
                    ]}
                    rotation={[0, 0, m.angle + Math.PI / 2]}
                >
                    <boxGeometry args={[m.isMajor ? 0.012 : 0.006, m.length, 0.003]} />
                    <meshStandardMaterial color="#111111" />
                </mesh>
            ))}

            {/* Numbers: 12, 3, 6, 9 */}
            {numberPositions.map((n) => (
                <Text
                    key={n.num}
                    position={[
                        Math.cos(n.angle) * n.r,
                        Math.sin(n.angle) * n.r,
                        0.026
                    ]}
                    fontSize={0.07}
                    color="#222222"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                >
                    {n.num}
                </Text>
            ))}

            {/* Brand text */}
            <Text
                position={[0, -0.08, 0.026]}
                fontSize={0.025}
                color="#888888"
                anchorX="center"
                anchorY="middle"
            >
                HoloLab
            </Text>

            {/* Hour hand — short, thick, black */}
            <mesh ref={hourHandRef} position={[0, 0, 0.03]}>
                <boxGeometry args={[0.018, CLOCK_RADIUS * 0.50, 0.006]} />
                <meshStandardMaterial color="#111111" />
            </mesh>

            {/* Minute hand — longer, medium, black */}
            <mesh ref={minuteHandRef} position={[0, 0, 0.035]}>
                <boxGeometry args={[0.012, CLOCK_RADIUS * 0.72, 0.005]} />
                <meshStandardMaterial color="#222222" />
            </mesh>

            {/* Second hand — thin, red */}
            <mesh ref={secondHandRef} position={[0, 0, 0.04]}>
                <boxGeometry args={[0.005, CLOCK_RADIUS * 0.80, 0.003]} />
                <meshStandardMaterial color="#cc0000" />
            </mesh>

            {/* Center pin */}
            <mesh position={[0, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} />
                <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Glass cover — transparent disc */}
            <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[CLOCK_RADIUS - 0.01, 48]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.08}
                    roughness={0.05}
                    transmission={0.92}
                    ior={1.5}
                />
            </mesh>
        </group>
    );
}
