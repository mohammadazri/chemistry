import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LabEnvironment from './LabEnvironment';

export default function LabScene() {
    return (
        <div className="w-[70%] h-screen bg-[#1a1a2e]">
            <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    <LabEnvironment />
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
                </Suspense>
            </Canvas>
        </div>
    );
}
