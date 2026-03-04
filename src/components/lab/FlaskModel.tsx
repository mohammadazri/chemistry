import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { getLiquidColor } from './LiquidShader';

export default function FlaskModel() {
    const flaskGroup = useRef<THREE.Group>(null);
    const showMolecular = useUiStore((state) => state.showMolecular);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const labStage = useExperimentStore((state) => state.labStage);
    const flaskVolume = useExperimentStore((state) => state.flaskVolume) || 25.0;

    const liquidColor = getLiquidColor(currentPH);

    // === ACCURATE 250mL CORNING PYREX HEAVY-DUTY BEAKER DIMENSIONS ===
    const radius = 0.15;
    const beakerHeight = 0.40;
    const maxBeakerVolume = 300; // Visual height represents ~300mL slightly below brim
    const wallThickness = 0.012;

    // Fill animation state
    const [animFrac, setAnimFrac] = useState(0);
    const fillTimerRef = useRef(0);

    useEffect(() => {
        if (labStage === 'fill-flask') {
            fillTimerRef.current = 0;
            setAnimFrac(0);
        }
        if (labStage === 'titrate' || labStage === 'done') {
            setAnimFrac(1);
        }
    }, [labStage]);

    useFrame((_, dt) => {
        if (labStage === 'fill-flask') {
            fillTimerRef.current += dt;
            if (fillTimerRef.current > 2.1) {
                setAnimFrac((prev) => Math.min(1, prev + dt * 0.5));
            }
        }
    });

    const getHeightForVolume = (vol: number) => {
        return (vol / maxBeakerVolume) * beakerHeight;
    };

    const currentVol = flaskVolume + volumeAdded;
    const targetBaseHeight = getHeightForVolume(flaskVolume);
    const targetTotalHeight = getHeightForVolume(currentVol);

    const showLiquid = labStage !== 'setup' && labStage !== 'fill-burette' && !showMolecular;
    const totalLiquidHeight = labStage === 'setup' || labStage === 'fill-burette' ? 0
        : labStage === 'fill-flask' ? targetBaseHeight * animFrac
            : targetTotalHeight;

    const liquidBottomY = -beakerHeight / 2 + 0.006;
    const liquidY = liquidBottomY + totalLiquidHeight / 2;

    // Graduation marks
    const gradMarks = useMemo(() => {
        return [50, 100, 150, 200, 250].map((vol) => {
            const markHeight = getHeightForVolume(vol);
            const y = -beakerHeight / 2 + markHeight;
            return { vol, y, r: radius };
        });
    }, [radius, beakerHeight]);

    // Opacity-based glass material
    const glassMaterial = (
        <meshPhysicalMaterial
            transparent={true}
            opacity={0.15}
            roughness={0.02}
            metalness={0.05}
            reflectivity={0.9}
            ior={1.47}
            clearcoat={1}
            clearcoatRoughness={0.02}
            color="#dcf0ff"   // faint lab glass tint
            side={THREE.DoubleSide}
            depthWrite={false}
        />
    );

    return (
        <group ref={flaskGroup} position={[0, -0.33, -0.2]}>

            {/* === LIQUID === */}
            {showLiquid && totalLiquidHeight > 0.01 && (
                <mesh position={[0, liquidY, 0]} renderOrder={0}>
                    <cylinderGeometry args={[radius - 0.008, radius - 0.008, totalLiquidHeight, 64]} />
                    <meshStandardMaterial
                        color={liquidColor}
                        transparent={true}
                        opacity={0.95}
                        roughness={0.1}
                        metalness={0}
                        depthWrite={true}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Meniscus */}
            {showLiquid && totalLiquidHeight > 0.01 && (
                <mesh position={[0, liquidY + totalLiquidHeight / 2 - 0.005, 0]} renderOrder={0}>
                    <cylinderGeometry args={[radius * 0.95, radius - 0.006, 0.012, 48]} />
                    <meshStandardMaterial
                        color={liquidColor}
                        transparent={true}
                        opacity={0.7}
                        roughness={0.0}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* === BEAKER GLASS === */}

            {/* Cylindrical body */}
            <mesh position={[0, 0, 0]} castShadow renderOrder={1}>
                <cylinderGeometry args={[radius, radius, beakerHeight, 64, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Flat bottom disc */}
            <mesh position={[0, -beakerHeight / 2, 0]} castShadow renderOrder={1}>
                <cylinderGeometry args={[radius, radius, wallThickness, 64, 1, false]} />
                {glassMaterial}
            </mesh>

            {/* Top heavy-duty rim */}
            <mesh position={[0, beakerHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={1}>
                <torusGeometry args={[radius + 0.006, 0.018, 12, 64]} />
                {glassMaterial}
            </mesh>



            {/* === GRADUATION MARKS === */}
            {gradMarks.map(({ vol, y, r }) => (
                <group key={vol} position={[0, y, 0]}>
                    <mesh>
                        {/* Half-circle mark on the front face */}
                        <cylinderGeometry args={[r + 0.001, r + 0.001, 0.003, 32, 1, true, -Math.PI / 4, Math.PI / 2]} />
                        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.95} />
                    </mesh>
                    <Text
                        position={[(r + 0.01) * Math.sin(Math.PI / 4), 0, (r + 0.01) * Math.cos(Math.PI / 4)]}
                        rotation={[0, 0, 0]}
                        fontSize={0.022}
                        color="#ffffff"
                        anchorX="left"
                        anchorY="middle"
                        fontWeight={700}
                    >
                        {vol}
                    </Text>
                </group>
            ))}

        </group>
    );
}
