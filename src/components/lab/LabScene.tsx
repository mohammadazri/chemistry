import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LabEnvironment from './LabEnvironment';
import BuretteModel from './BuretteModel';
import FlaskModel from './FlaskModel';
import PhMeterModel from './PhMeterModel';
import MolecularView from './MolecularView';
import DropAnimation from './DropAnimation';
import CameraController from './CameraController';
import RealisticPourSequence from './RealisticPourSequence';
import LoaderOverlay from './LoaderOverlay';
import { useLabInteractions } from '../../hooks/useLabInteractions';

// ------------------------------------------------------------------------------------------
// Core Bug Fix: Dynamically tracks EXACTLY when the WebGL shaders finish compiling
// Once Suspense resolves and this mounts, Three.js synchronously freezes the whole browser
// to compile shaders. The `useFrame` loop won't physically execute until that finishes.
// By waiting for 2 frames, we absolutely guarantee the canvas is fully painted to the screen.
// ------------------------------------------------------------------------------------------
function WebGLStateTracker({ onReady }: { onReady: () => void }) {
    const frameCount = useRef(0);
    useFrame(() => {
        frameCount.current += 1;
        if (frameCount.current === 2) {
            onReady();
        }
    });
    return null;
}

export default function LabScene() {
    const [webGLReady, setWebGLReady] = useState(false);
    const interactions = useLabInteractions();

    return (
        <div className="relative w-full h-full">
            <LoaderOverlay isWebGLReady={webGLReady} />
            <Canvas shadows camera={{ position: [0, 1.5, 7.5], fov: 52, near: 0.01, far: 100 }}
                style={{ background: '#d0d0ca' }}
            >
                <Suspense fallback={null}>
                    <WebGLStateTracker onReady={() => setWebGLReady(true)} />
                    <CameraController />
                    <LabEnvironment
                        onNaOHBottleClick={interactions.onNaOHBottleClick}
                        onHClBottleClick={interactions.onHClBottleClick}
                        canClickNaOH={interactions.canClickNaOH}
                        canClickHCl={interactions.canClickHCl}
                    />
                    <MolecularView />
                    <BuretteModel />
                    <FlaskModel />
                    <DropAnimation />
                    <RealisticPourSequence />
                    <PhMeterModel />
                    <OrbitControls
                        ref={(ref: any) => {
                            // Store ref globally so CameraController can access it
                            if (ref) (window as any).__orbitControls = ref;
                        }}
                        target={[0, 0.5, 0]}
                        enablePan={true}
                        panSpeed={0.4}
                        maxPolarAngle={Math.PI / 2.1}
                        minDistance={0.5}
                        maxDistance={14}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
