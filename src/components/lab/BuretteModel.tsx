import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function BuretteModel() {
    const buretteGroup = useRef<THREE.Group>(null);
    const [isOpen, setIsOpen] = useState(false);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const addVolume = useExperimentStore((state) => state.addVolume);
    const isRunning = useExperimentStore((state) => state.isRunning);

    // Realistic dimensions
    const maxVolume = 50;
    const tubeHeight = 3.5;
    const tubeRadius = 0.05;
    const glassThickness = 0.005;

    // Liquid shrinks from top.
    const liquidHeight = Math.max(0, tubeHeight * (1 - volumeAdded / maxVolume));

    // Position of liquid so its bottom aligns with the bottom of the main tube (-tubeHeight/2)
    const liquidY = (-tubeHeight / 2) + (liquidHeight / 2);

    // Handle continuous pouring if stopcock is open
    useFrame(() => {
        if (isOpen && isRunning && volumeAdded < maxVolume) {
            addVolume(0.08); // Speed of pouring
        }
    });

    const handleStopcockClick = (e: any) => {
        e.stopPropagation();
        if (!isRunning) return;
        setIsOpen(!isOpen);
    };

    // Extremely realistic laboratory glass material
    const glassMaterial = (
        <meshPhysicalMaterial
            transparent={true}
            transmission={0.98}
            opacity={1}
            roughness={0.02}
            ior={1.47} // Typical Borosilicate glass IOR
            thickness={glassThickness}
            clearcoat={1}
            clearcoatRoughness={0.05}
            color="#ffffff"
            attenuationColor="#ffffff"
            attenuationDistance={10}
            side={THREE.DoubleSide}
        />
    );

    // Generate accurate tick marks (50 major/minor ticks)
    const tickMarks = useMemo(() => {
        const marks = [];
        for (let i = 0; i <= maxVolume; i++) {
            const isMajor = i % 5 === 0;
            // Physical position: 0 is at the bottom, 50 is at the top
            // yPos: i=0 maps to bottom (-tubeHeight/2), i=50 maps to top (+tubeHeight/2)
            const yPos = (-tubeHeight / 2) + (i * (tubeHeight / maxVolume));
            // Label: show i (0 at bottom, 50 at top)
            const label = i;

            marks.push(
                <group key={i} position={[0, yPos, 0]}>
                    {/* Tick Line wrapped around tube */}
                    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[tubeRadius + 0.001, tubeRadius + 0.001, isMajor ? 0.008 : 0.003, isMajor ? 32 : 16, 1, true, 0, isMajor ? Math.PI : Math.PI / 2]} />
                        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                    </mesh>

                    {/* Numbers for major ticks */}
                    {isMajor && (
                        <Text
                            position={[tubeRadius + 0.015, 0, tubeRadius]}
                            rotation={[0, Math.PI / 4, 0]}
                            fontSize={0.04}
                            color="#ffffff"
                            anchorX="left"
                            anchorY="middle"
                        >
                            {label}
                        </Text>
                    )}
                </group>
            );
        }
        return marks;
    }, [maxVolume, tubeHeight, tubeRadius]);

    return (
        <group ref={buretteGroup} position={[0, 1.8, 0]}>

            {/* --- Main Glass Tube --- */}
            <mesh castShadow>
                <cylinderGeometry args={[tubeRadius, tubeRadius, tubeHeight, 32, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Top Rim */}
            <mesh position={[0, tubeHeight / 2, 0]}>
                <torusGeometry args={[tubeRadius, 0.005, 16, 32]} />
                {glassMaterial}
            </mesh>

            {/* --- Lower Taper leading to stopcock --- */}
            <mesh position={[0, -tubeHeight / 2 - 0.2, 0]} castShadow>
                <cylinderGeometry args={[tubeRadius, 0.015, 0.4, 32, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* --- Valid Liquid Column --- */}
            {/* Only renders where there is liquid remaining */}
            {liquidHeight > 0 && (
                <mesh position={[0, liquidY, 0]}>
                    <cylinderGeometry args={[tubeRadius - 0.002, tubeRadius - 0.002, liquidHeight, 32]} />
                    {/* Standard transparent material for stark visibility against the background */}
                    <meshStandardMaterial
                        color="#ffffff"
                        transparent={true}
                        opacity={0.6}
                        roughness={0}
                        metalness={0.1}
                        depthWrite={false}
                    />
                </mesh>
            )}

            {/* --- Stopcock Assembly --- */}
            <group position={[0, -tubeHeight / 2 - 0.45, 0]}>
                {/* Thick glass barrel housing the valve */}
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.035, 0.03, 0.12, 32, 1, false]} />
                    {glassMaterial}
                </mesh>

                {/* The Rotating Valve (PTFE/Teflon Plug) */}
                <group onClick={handleStopcockClick} rotation={[0, isOpen ? -Math.PI / 2 : 0, 0]}>
                    {/* Main Teflon Plug Body */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.033, 0.028, 0.14, 32]} />
                        <meshPhysicalMaterial color="#3b82f6" roughness={0.5} metalness={0.1} clearcoat={0.2} />
                    </mesh>

                    {/* Handle Grips */}
                    <mesh position={[0, 0, 0.09]}>
                        <boxGeometry args={[0.14, 0.04, 0.015]} />
                        <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
                    </mesh>

                    {/* The "bore" hole where liquid passes through (simulated as a dark cylinder) */}
                    <mesh rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.066, 16]} />
                        <meshBasicMaterial color="#020617" />
                    </mesh>
                </group>
            </group>

            {/* --- Tip (drip tube below stopcock) --- */}
            <mesh position={[0, -tubeHeight / 2 - 0.65, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.008, 0.3, 16, 1, true]} />
                {glassMaterial}
            </mesh>
            <mesh position={[0, -tubeHeight / 2 - 0.8, 0]}>
                <torusGeometry args={[0.008, 0.002, 16, 16]} />
                {glassMaterial}
            </mesh>

            {/* --- The Graduation Marks --- */}
            <group position={[0, 0, 0]}>
                {tickMarks}
            </group>
        </group>
    );
}
