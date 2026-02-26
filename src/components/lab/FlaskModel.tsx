import { useRef, useMemo } from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { getLiquidColor } from './LiquidShader';

export default function FlaskModel() {
    const flaskGroup = useRef<THREE.Group>(null);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);

    const liquidColor = getLiquidColor(currentPH);

    // === ACCURATE 250mL ERLENMEYER FLASK DIMENSIONS (scaled to scene units) ===
    // Real: base Ø82mm, height 140mm, neck Ø30mm, neck length 40mm
    // Scale factor: ~1 unit = 270mm => 0.37 unit = 100mm actual
    // Adjusted for scene scale where bench is at -0.62 and flask group at -0.54:
    const baseRadius = 0.30;        // 81mm actual
    const coneHeight = 0.38;        // ~103mm actual (conical section)
    const neckRadius = 0.055;       // 30mm actual
    const neckHeight = 0.14;        // 38mm actual

    // Liquid physics: starts at 25mL (fills about 40% of flask base)
    const maxLiquidFill = coneHeight * 0.72; // max fill in conical section
    const baseLiquidHeight = maxLiquidFill * 0.45;  // initial 25mL fill
    const additionalHeight = (volumeAdded / 50) * maxLiquidFill * 0.5;
    const totalLiquidHeight = Math.min(baseLiquidHeight + additionalHeight, maxLiquidFill);

    // Bottom of flask interior starts at -coneHeight/2
    const liquidBottomY = -coneHeight / 2;
    const liquidY = liquidBottomY + totalLiquidHeight / 2;

    // Liquid top radius narrows as it rises through the cone
    // Cone goes from baseRadius at bottom to neckRadius at top over coneHeight
    const fillFraction = totalLiquidHeight / coneHeight;
    const liquidTopRadius = Math.max(neckRadius + 0.01, baseRadius - fillFraction * (baseRadius - neckRadius));

    // Graduation marks: 50mL, 100mL, 150mL, 200mL, 250mL 
    const gradMarks = useMemo(() => {
        return [50, 100, 150, 200, 250].map((vol) => {
            // Approximate where each volume level sits in the cone
            const fracFill = (vol / 250);
            const markHeight = -coneHeight / 2 + fracFill * coneHeight * 0.85;
            const markRadius = baseRadius - fracFill * (baseRadius - neckRadius) * 0.85;
            return { vol, y: markHeight, r: markRadius };
        });
    }, [baseRadius, coneHeight, neckRadius]);

    // Crystal-clear borosilicate glass
    const glassMaterial = (
        <meshPhysicalMaterial
            transparent={true}
            transmission={1.0}
            opacity={1}
            roughness={0.0}
            ior={1.47}
            thickness={0.003}
            clearcoat={1}
            clearcoatRoughness={0.02}
            color="#f8ffff"  // faint blue-green tint typical of borosilicate
            side={THREE.DoubleSide}
        />
    );

    return (
        <group ref={flaskGroup} position={[0, -0.54, 0]}>

            {/* === LIQUID === */}
            {totalLiquidHeight > 0.01 && (
                <mesh position={[0, liquidY, 0]} renderOrder={1}>
                    <cylinderGeometry args={[liquidTopRadius - 0.005, baseRadius - 0.005, totalLiquidHeight, 64]} />
                    {/* Solid material — always visible from all directions through the transparent glass */}
                    <meshStandardMaterial
                        color={liquidColor}
                        transparent={true}
                        opacity={0.92}
                        roughness={0.05}
                        metalness={0}
                        depthWrite={true}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* === ERLENMEYER FLASK GLASS === */}

            {/* Conical body — open top and bottom (true = open ended) */}
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[neckRadius, baseRadius, coneHeight, 64, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Flat bottom disc */}
            <mesh position={[0, -coneHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[baseRadius, baseRadius, 0.012, 64, 1, false]} />
                {glassMaterial}
            </mesh>

            {/* Cylindrical needle neck */}
            <mesh position={[0, coneHeight / 2 + neckHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 48, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Top rim / lip — reinforced rolled edge */}
            <mesh position={[0, coneHeight / 2 + neckHeight, 0]}>
                <torusGeometry args={[neckRadius + 0.003, 0.008, 10, 48]} />
                {glassMaterial}
            </mesh>

            {/* === GRADUATION MARKS ON THE SIDE === */}
            {gradMarks.map(({ vol, y, r }) => (
                <group key={vol} position={[0, y, 0]}>
                    {/* Horizontal mark line */}
                    <mesh>
                        <cylinderGeometry args={[r + 0.002, r + 0.002, 0.004, 32, 1, true, 0, Math.PI * 0.6]} />
                        <meshBasicMaterial color="#88aacc" side={THREE.DoubleSide} transparent opacity={0.7} />
                    </mesh>
                    {/* Volume label */}
                    <Text
                        position={[r + 0.025, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        fontSize={0.025}
                        color="#6699bb"
                        anchorX="left"
                        anchorY="middle"
                    >
                        {vol}
                    </Text>
                </group>
            ))}

            {/* === MAGNETIC STIRRER BAR (inside flask, white pill) === */}
            <mesh position={[0, -coneHeight / 2 + 0.015, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.01, 0.08, 6, 12]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.2} metalness={0.2} />
            </mesh>
        </group>
    );
}
