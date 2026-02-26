import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LabEnvironment from './LabEnvironment';
import BuretteModel from './BuretteModel';
import FlaskModel from './FlaskModel';
import PhMeterModel from './PhMeterModel';
import MolecularView from './MolecularView';

export default function LabScene() {
    return (
        <div className="w-[70%] h-screen">
            <Canvas shadows camera={{ position: [0, 1.0, 7], fov: 52, near: 0.1, far: 100 }}
                style={{ background: '#d0d0ca' }}
            >
                <Suspense fallback={null}>
                    <LabEnvironment />
                    <MolecularView />
                    <BuretteModel />
                    <FlaskModel />
                    <PhMeterModel />
                    <OrbitControls
                        target={[0, 0.5, 0]}
                        enablePan={false}
                        maxPolarAngle={Math.PI / 2.2}
                        minDistance={3}
                        maxDistance={10}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
