import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LabEnvironment from './LabEnvironment';
import BuretteModel from './BuretteModel';
import FlaskModel from './FlaskModel';
import PhMeterModel from './PhMeterModel';
import MolecularView from './MolecularView';
import DropAnimation from './DropAnimation';

export default function LabScene() {
    return (
        <div className="w-[70%] h-screen">
            <Canvas shadows camera={{ position: [0, 1.0, 7], fov: 52, near: 0.01, far: 100 }}
                style={{ background: '#d0d0ca' }}
            >
                <Suspense fallback={null}>
                    <LabEnvironment />
                    <MolecularView />
                    <BuretteModel />
                    <FlaskModel />
                    <DropAnimation />
                    <PhMeterModel />
                    <OrbitControls
                        target={[0, 0.5, 0]}
                        enablePan={true}
                        panSpeed={0.4}
                        maxPolarAngle={Math.PI / 2.1}
                        minDistance={0.5}
                        maxDistance={12}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
