import { useExperimentStore } from '../../store/experimentStore';
import { Text } from '@react-three/drei';

export default function PhMeterModel() {
    const currentPH = useExperimentStore((state) => state.currentPH);

    // Color logic for the digital screen text
    let textColor = '#44ff44'; // Neutral
    if (currentPH < 7) textColor = '#ff4444'; // Acidic
    if (currentPH > 7) textColor = '#4444ff'; // Basic

    return (
        <group position={[1.2, 0, 0]}>
            {/* Device Body */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.6, 0.4, 0.15]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Screen Face */}
            <mesh position={[0, 0.2, 0.08]}>
                <boxGeometry args={[0.45, 0.25, 0.02]} />
                <meshStandardMaterial color="#001a00" emissive="#001a00" />
            </mesh>

            {/* pH Label */}
            <Text
                position={[0, 0.26, 0.092]}
                fontSize={0.06}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                pH
            </Text>

            {/* Digital Number */}
            <Text
                position={[0, 0.16, 0.092]}
                fontSize={0.12}
                color={textColor}
                anchorX="center"
                anchorY="middle"
            >
                {currentPH.toFixed(2)}
            </Text>

            {/* Electrode extending into flask area */}
            <mesh position={[-1.6, -0.4, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
                <meshStandardMaterial color="#aaaaaa" />
            </mesh>

            {/* Wire connecting electrode to meter */}
            <mesh position={[-0.8, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.005, 0.005, 1.6, 8]} />
                <meshStandardMaterial color="#222222" />
            </mesh>
        </group>
    );
}
