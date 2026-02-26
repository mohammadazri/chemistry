import { Environment, OrbitControls } from '@react-three/drei';

export default function LabEnvironment() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[-3, 3, -3]} intensity={0.5} color="#4fc3f7" />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#ecf0f1" />
            </mesh>

            {/* Lab Bench Box */}
            <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 0.2, 2]} />
                <meshStandardMaterial color="#8B6914" />
            </mesh>
        </>
    );
}
