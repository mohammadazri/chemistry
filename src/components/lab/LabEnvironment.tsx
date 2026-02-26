import { Environment, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';

export default function LabEnvironment() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
            <pointLight position={[-3, 3, -3]} intensity={1} color="#e0f7fa" />
            <pointLight position={[0, 1, 2]} intensity={0.5} color="#ffffff" />

            {/* Environment map for realistic glass reflections */}
            <Environment preset="studio" environmentIntensity={0.8} />

            {/* Realistic soft ground shadow */}
            <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -0.65, 0]} />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.66, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.2} />
            </mesh>

            {/* Subtle lab bench grid for technical feel */}
            <Grid position={[0, -0.65, 0]} cellColor="#ffffff" cellThickness={0.5} sectionColor="#ffffff" sectionThickness={1} fadeDistance={15} />

            {/* Lab Bench Surface */}
            <mesh position={[0, -0.7, 0]} receiveShadow>
                <boxGeometry args={[6, 0.1, 3]} />
                <meshPhysicalMaterial color="#0f172a" roughness={0.2} metalness={0.1} clearcoat={1} />
            </mesh>

            {/* Base Stand for Burette */}
            <mesh position={[0.5, -0.6, -0.2]} castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.05, 0.6]} />
                <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Stand Pole */}
            <mesh position={[0.5, 1.2, -0.4]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 3.6, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Clamp holding Burette */}
            <mesh position={[0.5, 1.5, -0.2]} castShadow>
                <boxGeometry args={[0.06, 0.04, 0.4]} />
                <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.5} />
            </mesh>
            <mesh position={[0.5, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <ringGeometry args={[0.08, 0.11, 32]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
            </mesh>
        </>
    );
}
