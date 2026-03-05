import { Suspense, useState, useRef, type MutableRefObject } from 'react';
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
import { ARCamera } from './ARCamera';
import { useLabInteractions } from '../../hooks/useLabInteractions';
import { useUiStore } from '../../store/uiStore';

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

interface LabSceneProps {
    panRef?: MutableRefObject<number>;
    zoomRef?: MutableRefObject<number>;
    faceYawRef?: MutableRefObject<number>;
    facePitchRef?: MutableRefObject<number>;
}

export default function LabScene({ panRef, zoomRef, faceYawRef, facePitchRef }: LabSceneProps) {
    const [webGLReady, setWebGLReady] = useState(false);
    const interactions = useLabInteractions();
    const arEnabled = useUiStore((s) => s.arEnabled);

    return (
        <>
            <div className="relative w-full h-full">
                <LoaderOverlay isWebGLReady={webGLReady} />
                <Canvas shadows camera={{ position: [0, 1.5, 7.5], fov: 52, near: 0.01, far: 100 }}
                    style={{ background: '#d0d0ca' }}
                >
                    <Suspense fallback={null}>
                        <WebGLStateTracker onReady={() => setWebGLReady(true)} />
                        {!arEnabled && <CameraController />}
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

                        {/* Simple lerping camera controlled via refs */}
                        {arEnabled && panRef && zoomRef && faceYawRef && facePitchRef && (
                            <ARCamera
                                panRef={panRef}
                                zoomRef={zoomRef}
                                faceYawRef={faceYawRef}
                                facePitchRef={facePitchRef}
                            />
                        )}

                        {!arEnabled && (
                            <OrbitControls
                                ref={(ref: any) => {
                                    if (ref) (window as any).__orbitControls = ref;
                                }}
                                target={[0, 0.5, 0]}
                                enablePan={true}
                                panSpeed={0.4}
                                maxPolarAngle={Math.PI / 2.1}
                                minDistance={0.5}
                                maxDistance={14}
                            />
                        )}
                    </Suspense>
                </Canvas>
            </div>

            {/* AR overlay buttons for 3D bottles — hit targets for the AR cursor dwell system */}
            {arEnabled && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
                    {interactions.canClickNaOH && (
                        <button
                            className="interactable-btn"
                            onClick={interactions.onNaOHBottleClick}
                            style={{
                                position: 'absolute', left: '30%', top: '38%',
                                transform: 'translate(-50%,-50%)', pointerEvents: 'auto',
                                background: 'rgba(99,102,241,0.18)', border: '1.5px solid rgba(99,102,241,0.5)',
                                borderRadius: 10, color: '#c7d2fe', fontSize: 11,
                                fontFamily: 'Inter,sans-serif', fontWeight: 600,
                                padding: '5px 12px', cursor: 'pointer',
                                backdropFilter: 'blur(4px)', whiteSpace: 'nowrap',
                            }}
                        >NaOH Bottle</button>
                    )}
                    {interactions.canClickHCl && (
                        <button
                            className="interactable-btn"
                            onClick={interactions.onHClBottleClick}
                            style={{
                                position: 'absolute', left: '68%', top: '38%',
                                transform: 'translate(-50%,-50%)', pointerEvents: 'auto',
                                background: 'rgba(99,102,241,0.18)', border: '1.5px solid rgba(99,102,241,0.5)',
                                borderRadius: 10, color: '#c7d2fe', fontSize: 11,
                                fontFamily: 'Inter,sans-serif', fontWeight: 600,
                                padding: '5px 12px', cursor: 'pointer',
                                backdropFilter: 'blur(4px)', whiteSpace: 'nowrap',
                            }}
                        >HCl Bottle</button>
                    )}
                </div>
            )}
        </>
    );
}
