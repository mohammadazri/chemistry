import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import * as THREE from 'three';
import { getLiquidColor } from './LiquidShader';

export default function FlaskModel() {
    const flaskGroup = useRef<THREE.Group>(null);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);

    // Liquid color based on current pH
    const liquidColor = getLiquidColor(currentPH);

    // Calculate liquid level based on initial 25mL + added volume (up to 50mL added)
    // Max total volume is 75mL. Let's scale the height.
    const baseLiquidHeight = 0.25;
    const additionalHeight = (volumeAdded / 50) * 0.15;
    const totalLiquidHeight = baseLiquidHeight + additionalHeight;
    // Y position of liquid needs to be offset so the bottom stays flat against the flask base
    const liquidY = -0.25 + (totalLiquidHeight / 2);

    // Top radius of the liquid cone changes as it gets higher
    // Base radius is 0.35, top of the conical part is 0.1 at height 0.4 from base
    const liquidTopRadius = 0.35 - ((totalLiquidHeight / 0.4) * (0.35 - 0.1));

    // Slow rotation animation (mimics swirling magnetic stirrer)
    useFrame(({ clock }) => {
        if (flaskGroup.current) {
            flaskGroup.current.rotation.y = clock.getElapsedTime() * 2;
        }
    });

    const glassMaterial = (
        <meshPhysicalMaterial
            transparent
            transmission={0.95}
            opacity={1}
            roughness={0}
            ior={1.52}
            thickness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            side={THREE.DoubleSide}
        />
    );

    return (
        <group ref={flaskGroup} position={[0, -0.54, 0]}>
            {/* --- LIQUID --- */}
            <mesh position={[0, liquidY, 0]}>
                <cylinderGeometry args={[Math.max(0.12, liquidTopRadius - 0.01), 0.33, totalLiquidHeight, 64]} />
                <meshStandardMaterial
                    color={liquidColor}
                    transparent={true}
                    opacity={0.8}
                    roughness={0.2}
                    metalness={0.1}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* --- ERLENMEYER FLASK GLASS --- */}

            {/* Conical Body */}
            <mesh position={[0, -0.05, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.35, 0.4, 64, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Flat Bottom Base */}
            <mesh position={[0, -0.25, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.02, 64]} />
                {glassMaterial}
            </mesh>

            {/* Cylindrical Neck */}
            <mesh position={[0, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.2, 64, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Flask Lip (Rim) */}
            <mesh position={[0, 0.36, 0]} castShadow>
                <torusGeometry args={[0.11, 0.02, 16, 64]} />
                {glassMaterial}
            </mesh>

            {/* Magnetic Stirrer Bar (Pill shape) */}
            <mesh position={[0, -0.23, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.015, 0.1, 8, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>
        </group>
    );
}
