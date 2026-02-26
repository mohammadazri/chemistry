import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import * as THREE from 'three';
import { getIndicatorColor } from '../../lib/chemistry';

export default function BuretteModel() {
    const buretteGroup = useRef<THREE.Group>(null);
    const [isOpen, setIsOpen] = useState(false);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const addVolume = useExperimentStore((state) => state.addVolume);
    const isRunning = useExperimentStore((state) => state.isRunning);

    // Shrinks from top as volume added. Max volume is 50mL.
    const liquidHeight = Math.max(0, 2.8 * (1 - volumeAdded / 50));
    // Y position needs to adjust so it shrinks from the top, keeping bottom fixed
    const liquidY = - (2.8 - liquidHeight) / 2;

    // Starting color for Phenolphthalein in base
    const liquidColor = getIndicatorColor('phenolphthalein', 13);

    // Handle continuous pouring if stopcock is open
    useFrame(() => {
        if (isOpen && isRunning && volumeAdded < 50) {
            addVolume(0.05); // adds 0.05 mL per frame (~3mL per second at 60fps)
        }
    });

    const handleStopcockClick = (e: any) => {
        e.stopPropagation();
        if (!isRunning) return;
        setIsOpen(!isOpen);
    };

    return (
        <group ref={buretteGroup} position={[0.5, 1.5, 0]}>
            {/* Outer Glass Tube */}
            <mesh>
                <cylinderGeometry args={[0.08, 0.08, 3, 16]} />
                <meshPhysicalMaterial
                    transparent opacity={0.3}
                    roughness={0.1}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={0.02}
                />
            </mesh>

            {/* Liquid Inside */}
            {liquidHeight > 0 && (
                <mesh position={[0, liquidY, 0]}>
                    <cylinderGeometry args={[0.075, 0.075, liquidHeight, 16]} />
                    <meshStandardMaterial color={liquidColor} transparent opacity={0.8} />
                </mesh>
            )}

            {/* Stopcock */}
            <mesh position={[0, -1.6, 0]} onClick={handleStopcockClick}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color={isOpen ? "#00ff00" : "#ff0000"} />
            </mesh>

            {/* Tick Marks (10 intervals) */}
            <group position={[0, 0, 0.081]}>
                {[...Array(10)].map((_, i) => (
                    <mesh key={i} position={[0, 1.4 - (i * 2.8) / 9, 0]}>
                        <boxGeometry args={[0.04, 0.01, 0.01]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
