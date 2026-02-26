import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import * as THREE from 'three';
import { getLiquidColor } from './LiquidShader';

export default function FlaskModel() {
    const flaskGroup = useRef<THREE.Group>(null);
    const currentPH = useExperimentStore((state) => state.currentPH);

    // Liquid color based on current pH
    const liquidColor = getLiquidColor(currentPH);

    // Slow rotation animation (mimics swirling)
    useFrame(() => {
        if (flaskGroup.current) {
            flaskGroup.current.rotation.y += 0.003;
        }
    });

    return (
        <group ref={flaskGroup} position={[-0.5, -0.2, 0]}>
            {/* Liquid inside flask (bottom 60%) */}
            <mesh position={[0, -0.15, 0]}>
                <cylinderGeometry args={[0.2, 0.18, 0.3, 20]} />
                <meshStandardMaterial color={liquidColor} transparent opacity={0.8} />
            </mesh>

            {/* Flask Body */}
            <mesh>
                <cylinderGeometry args={[0.3, 0.2, 0.6, 20]} />
                <meshPhysicalMaterial
                    transparent opacity={0.25}
                    roughness={0}
                    metalness={0}
                    transmission={0.9}
                    thickness={0.02}
                />
            </mesh>

            {/* Flask Neck */}
            <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.3, 12]} />
                <meshPhysicalMaterial
                    transparent opacity={0.25}
                    roughness={0}
                    metalness={0}
                    transmission={0.9}
                    thickness={0.02}
                />
            </mesh>
        </group>
    );
}
