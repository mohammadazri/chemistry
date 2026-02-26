import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import * as THREE from 'three';

export default function BuretteModel() {
    const buretteGroup = useRef<THREE.Group>(null);
    const [isOpen, setIsOpen] = useState(false);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const addVolume = useExperimentStore((state) => state.addVolume);
    const isRunning = useExperimentStore((state) => state.isRunning);

    // Shrinks from top as volume added. Max volume is 50mL.
    // Total tube height is 2.8, meaning 2.8 units corresponds to 50mL
    const maxLiquidHeight = 2.8;
    const liquidHeight = Math.max(0, maxLiquidHeight * (1 - volumeAdded / 50));

    // Y position needs to adjust so it shrinks from the top, keeping bottom fixed
    // Base of the tube is at Y = -1.4 relative to the group
    const liquidY = -1.4 + (liquidHeight / 2);

    // Handle continuous pouring if stopcock is open
    useFrame(() => {
        if (isOpen && isRunning && volumeAdded < 50) {
            addVolume(0.05); // adds 0.05 mL per frame
        }
    });

    const handleStopcockClick = (e: any) => {
        e.stopPropagation();
        if (!isRunning) return;
        setIsOpen(!isOpen);
    };

    const glassMaterial = (
        <meshPhysicalMaterial
            transparent
            opacity={1}
            transmission={0.95}
            roughness={0}
            ior={1.52}
            thickness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            side={THREE.DoubleSide}
        />
    );

    return (
        <group ref={buretteGroup} position={[0.5, 1.5, 0]}>
            {/* Main Glass Tube */}
            <mesh castShadow>
                <cylinderGeometry args={[0.06, 0.06, 3, 32, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Tapered Glass Base leading to stopcock */}
            <mesh position={[0, -1.55, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.02, 0.1, 32, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Liquid Inside */}
            {liquidHeight > 0 && (
                <mesh position={[0, liquidY, 0]}>
                    <cylinderGeometry args={[0.057, 0.057, liquidHeight, 32]} />
                    <meshPhysicalMaterial
                        color="#ffffff" // NaOH is clear
                        transparent
                        transmission={0.9}
                        opacity={0.8}
                        roughness={0}
                        ior={1.33} // Water IOR
                    />
                </mesh>
            )}

            {/* Stopcock Assembly */}
            <group position={[0, -1.65, 0]} onClick={handleStopcockClick} rotation={[0, isOpen ? 0 : Math.PI / 2, 0]}>
                {/* Stopcock barrel (glass/plastic housing) */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.03, 0.1, 16]} />
                    <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
                </mesh>

                {/* Stopcock Handle (Blue PTFE style) */}
                <mesh position={[0, 0, 0.06]}>
                    <boxGeometry args={[0.12, 0.04, 0.02]} />
                    <meshStandardMaterial color="#3b82f6" roughness={0.4} />
                </mesh>
                <mesh position={[0, 0, -0.04]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
                    <meshStandardMaterial color="#3b82f6" roughness={0.4} />
                </mesh>
            </group>

            {/* Tip (drip tube below stopcock) */}
            <mesh position={[0, -1.75, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.01, 0.1, 16, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Tick Marks (50mL marks, drawing a line every 5mL) */}
            <group position={[0, 0, 0]}>
                {[...Array(11)].map((_, i) => {
                    // i = 0 (top, 0mL), i = 10 (bottom, 50mL)
                    // The tube goes from Y=1.4 to Y=-1.4
                    const yPos = 1.4 - (i * 2.8) / 10;
                    return (
                        <group key={i} position={[0, yPos, 0]}>
                            {/* The line wrapping partially around the tube */}
                            <mesh position={[0, 0, 0.06]} rotation={[0, 0, 0]}>
                                <boxGeometry args={[0.05, 0.005, 0.002]} />
                                <meshBasicMaterial color="white" />
                            </mesh>
                        </group>
                    );
                })}
            </group>
        </group>
    );
}
