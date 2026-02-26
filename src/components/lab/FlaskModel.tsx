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

    // === ACCURATE 250mL ERLENMEYER FLASK DIMENSIONS ===
    const baseRadius = 0.30;
    const coneHeight = 0.38;
    const neckRadius = 0.055;
    const neckHeight = 0.14;

    // Liquid level calibrated so volumeAdded=0 shows at 25mL mark
    const maxLiquidFill = coneHeight * 0.70;
    const baseLiquidHeight = maxLiquidFill * 0.10;           // 25mL HCl at start
    const additionalHeight = (volumeAdded / 30) * maxLiquidFill * 0.52; // grows as NaOH added
    const totalLiquidHeight = Math.min(baseLiquidHeight + additionalHeight, maxLiquidFill);

    const liquidBottomY = -coneHeight / 2 + 0.005;
    const liquidY = liquidBottomY + totalLiquidHeight / 2;

    // Top width of liquid narrows as it rises in the cone
    const fillFraction = totalLiquidHeight / coneHeight;
    const liquidTopRadius = Math.max(neckRadius + 0.02, baseRadius - fillFraction * (baseRadius - neckRadius) * 0.95);

    // Graduation marks
    const gradMarks = useMemo(() => {
        return [50, 100, 150, 200, 250].map((vol) => {
            const fracFill = vol / 250;
            const markHeight = -coneHeight / 2 + fracFill * coneHeight * 0.85;
            const markRadius = baseRadius - fracFill * (baseRadius - neckRadius) * 0.85;
            return { vol, y: markHeight, r: markRadius };
        });
    }, [baseRadius, coneHeight, neckRadius]);

    // ===== KEY FIX: Use OPACITY-BASED glass, NOT transmission =====
    // transmission=1.0 makes Three.js hide interior geometry.
    // opacity=0.12 gives identical glass look but reveals liquid inside.
    const glassMaterial = (
        <meshPhysicalMaterial
            transparent={true}
            opacity={0.13}
            roughness={0.02}
            metalness={0}
            reflectivity={0.9}
            ior={1.47}
            clearcoat={1}
            clearcoatRoughness={0.02}
            color="#c8e8ff"   // slight blue-green tint of borosilicate
            side={THREE.DoubleSide}
            depthWrite={false}
        />
    );

    return (
        <group ref={flaskGroup} position={[0, -0.35, -0.2]}>

            {/* === LIQUID — rendered first (renderOrder=0) so glass appears over it === */}
            {totalLiquidHeight > 0.01 && (
                <mesh position={[0, liquidY, 0]} renderOrder={0}>
                    <cylinderGeometry args={[liquidTopRadius, baseRadius - 0.008, totalLiquidHeight, 64]} />
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

            {/* Meniscus — concave top surface of liquid */}
            {totalLiquidHeight > 0.01 && (
                <mesh position={[0, liquidY + totalLiquidHeight / 2 - 0.005, 0]} renderOrder={0}>
                    <cylinderGeometry args={[liquidTopRadius * 0.85, liquidTopRadius, 0.012, 48]} />
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

            {/* === FLASK GLASS (opacity-based) === */}

            {/* Conical body */}
            <mesh position={[0, 0, 0]} castShadow renderOrder={1}>
                <cylinderGeometry args={[neckRadius, baseRadius, coneHeight, 64, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Flat bottom disc */}
            <mesh position={[0, -coneHeight / 2, 0]} castShadow renderOrder={1}>
                <cylinderGeometry args={[baseRadius, baseRadius, 0.012, 64, 1, false]} />
                {glassMaterial}
            </mesh>

            {/* Cylindrical neck */}
            <mesh position={[0, coneHeight / 2 + neckHeight / 2, 0]} castShadow renderOrder={1}>
                <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 48, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Top rolled rim */}
            <mesh position={[0, coneHeight / 2 + neckHeight, 0]} renderOrder={1}>
                <torusGeometry args={[neckRadius + 0.003, 0.007, 10, 48]} />
                {glassMaterial}
            </mesh>

            {/* === GRADUATION MARKS === */}
            {gradMarks.map(({ vol, y, r }) => (
                <group key={vol} position={[0, y, 0]}>
                    <mesh>
                        <cylinderGeometry args={[r + 0.001, r + 0.001, 0.003, 32, 1, true, 0, Math.PI * 0.5]} />
                        <meshBasicMaterial color="#6699bb" side={THREE.DoubleSide} transparent opacity={0.8} />
                    </mesh>
                    <Text
                        position={[r + 0.025, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        fontSize={0.022}
                        color="#557799"
                        anchorX="left"
                        anchorY="middle"
                    >
                        {vol}
                    </Text>
                </group>
            ))}

            {/* === MAGNETIC STIRRER BAR === */}
            <mesh position={[0, -coneHeight / 2 + 0.014, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.009, 0.075, 6, 12]} />
                <meshStandardMaterial color="#e8e8e8" roughness={0.15} metalness={0.3} />
            </mesh>
        </group>
    );
}
