import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import * as THREE from 'three';

// World-space positions
// Burette group Y=1.5, tubeHeight=2.0 → bottom at 0.5, tip offset -0.68-0.18 → tip ≈ -0.36
const BURETTE_TIP_Y = -0.36;
// Flask group Y=-0.54, cone top = -0.54 + 0.38/2 = -0.35, +neck ≈ -0.21
const FLASK_MOUTH_Y = -0.21;

interface Drop {
    id: number;
    progress: number; // 0→1 (tip to flask)
    size: number;
}

let dropId = 0;

export default function DropAnimation() {
    const drops = useRef<Drop[]>([]);
    const [, forceUpdate] = useState(0);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const isRunning = useExperimentStore((state) => state.isRunning);

    const dropColor = '#c8e8ff'; // NaOH — near-clear with slight blue tint

    useFrame(({ clock }, delta) => {
        if (!isRunning) {
            if (drops.current.length > 0) {
                drops.current = [];
                forceUpdate(n => n + 1);
            }
            return;
        }

        // Spawn a drop every ~0.4s while experiment is running
        const interval = 0.4;
        const t = clock.getElapsedTime();
        const shouldSpawn = Math.floor(t / interval) > Math.floor((t - delta) / interval);

        if (shouldSpawn && volumeAdded < 50) {
            drops.current.push({
                id: dropId++,
                progress: 0,
                size: 0.011 + Math.random() * 0.004,
            });
        }

        // Advance each drop with gravity acceleration
        drops.current = drops.current.filter(drop => {
            drop.progress += delta * (1.2 + drop.progress * 2.5); // accelerate under gravity
            return drop.progress < 1.05;
        });

        // Cap at 8 drops onscreen
        if (drops.current.length > 8) drops.current = drops.current.slice(-8);

        forceUpdate(n => n + 1);
    });

    const travelDist = FLASK_MOUTH_Y - BURETTE_TIP_Y; // negative (downward)

    return (
        <group>
            {/* Falling drops */}
            {drops.current.map((drop) => {
                const worldY = BURETTE_TIP_Y + drop.progress * travelDist;
                // Elongate drop slightly as it falls faster
                const scaleY = 1 + drop.progress * 0.6;
                return (
                    <mesh key={drop.id} position={[0, worldY, 0]} scale={[1, scaleY, 1]}>
                        <sphereGeometry args={[drop.size, 10, 10]} />
                        <meshPhysicalMaterial
                            color={dropColor}
                            transparent={true}
                            opacity={0.80}
                            roughness={0.0}
                            clearcoat={1}
                            ior={1.33}
                            depthWrite={false}
                        />
                    </mesh>
                );
            })}

            {/* Forming drop at burette tip */}
            {isRunning && volumeAdded < 50 && (
                <mesh position={[0, BURETTE_TIP_Y + 0.018, 0]}>
                    <sphereGeometry args={[0.007, 8, 8]} />
                    <meshPhysicalMaterial
                        color={dropColor}
                        transparent={true}
                        opacity={0.7}
                        roughness={0}
                        clearcoat={1}
                        depthWrite={false}
                    />
                </mesh>
            )}

            {/* Thin liquid thread from tip — only when drops are active */}
            {isRunning && volumeAdded < 50 && drops.current.length > 0 && (
                <mesh position={[0, BURETTE_TIP_Y + 0.05, 0]}>
                    <cylinderGeometry args={[0.0025, 0.0025, 0.07, 6]} />
                    <meshPhysicalMaterial
                        color={dropColor}
                        transparent={true}
                        opacity={0.55}
                        roughness={0}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </group>
    );
}
