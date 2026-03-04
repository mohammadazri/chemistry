import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { getLiquidColor } from '../lab/LiquidShader';

export default function FlaskModel() {
    const flaskGroup = useRef<THREE.Group>(null);
    const showMolecular = useUiStore((state) => state.showMolecular);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const labStage = useExperimentStore((state) => state.labStage);
    const flaskVolume = useExperimentStore((state) => state.flaskVolume) || 25.0;

    const liquidColor = getLiquidColor(currentPH);

    // === ACCURATE 250mL ERLENMEYER FLASK DIMENSIONS ===
    const baseRadius = 0.30;
    const coneHeight = 0.38;
    const neckRadius = 0.055;
    const neckHeight = 0.14;

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
            // Delay until bottle is tilted (2.1s)
            if (fillTimerRef.current > 2.1) {
                setAnimFrac((prev) => Math.min(1, prev + dt * 0.5));
            }
        }
    });

    // Volume of a truncated cone (frustum)
    const getConeVolume = (h: number) => {
        if (h <= 0) return 0;
        const hClamped = Math.min(h, coneHeight);
        const rTop = baseRadius - (baseRadius - neckRadius) * (hClamped / coneHeight);
        let v = (Math.PI / 3) * hClamped * (baseRadius * baseRadius + baseRadius * rTop + rTop * rTop);
        // If liquid goes into the neck
        if (h > coneHeight) {
            v += Math.PI * neckRadius * neckRadius * (h - coneHeight);
        }
        return v;
    };

    // We calibrate the visual model: Let's say the 250mL mark is at 85% of cone height.
    const v250_mark_height = coneHeight * 0.85;
    const v250_math = getConeVolume(v250_mark_height);
    const ML_TO_CUBIC = v250_math / 250.0;

    const getHeightForVolume = (vol: number) => {
        let low = 0;
        let high = coneHeight + neckHeight;
        for (let i = 0; i < 25; i++) {
            const mid = (low + high) / 2;
            const v = getConeVolume(mid) / ML_TO_CUBIC;
            if (v < vol) low = mid;
            else high = mid;
        }
        return (low + high) / 2;
    };

    const currentVol = flaskVolume + volumeAdded;
    const targetBaseHeight = getHeightForVolume(flaskVolume);
    const targetTotalHeight = getHeightForVolume(currentVol);

    const showLiquid = labStage !== 'setup' && labStage !== 'fill-burette' && !showMolecular;
    const totalLiquidHeight = labStage === 'setup' || labStage === 'fill-burette' ? 0
        : labStage === 'fill-flask' ? targetBaseHeight * animFrac
            : targetTotalHeight;

    const liquidBottomY = -coneHeight / 2 + 0.005;
    const liquidY = liquidBottomY + totalLiquidHeight / 2;

    // Top width of liquid narrows as it rises in the cone
    const fillFraction = Math.min(1, totalLiquidHeight / coneHeight);
    const liquidTopRadius = Math.max(neckRadius + 0.02, baseRadius - fillFraction * (baseRadius - neckRadius) * 0.95);

    // Graduation marks (accurate scaling!)
    const gradMarks = useMemo(() => {
        return [50, 100, 150, 200, 250].map((vol) => {
            const markHeight = getHeightForVolume(vol);
            const y = -coneHeight / 2 + markHeight;
            const r = markHeight <= coneHeight
                ? baseRadius - (baseRadius - neckRadius) * (markHeight / coneHeight)
                : neckRadius;
            return { vol, y, r };
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
            {showLiquid && totalLiquidHeight > 0.01 && (
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
            {showLiquid && totalLiquidHeight > 0.01 && (
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
                        position={[r + 0.02, 0, 0]}
                        rotation={[0, 0, 0]}
                        fontSize={0.022}
                        color="#557799"
                        anchorX="left"
                        anchorY="middle"
                        fontWeight={700}
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
