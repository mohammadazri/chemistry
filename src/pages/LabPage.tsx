import { useRef, useCallback, useState, useEffect } from 'react';
import LabScene from '../components/lab/LabScene';
import RightSidebar from '../components/panels/RightSidebar';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import QuizModal from '../components/tutorial/QuizModal';
import ResultsModal from '../components/results/ResultsModal';
import LabAssistant from '../components/lab/LabAssistant';
import LabToolbar from '../components/lab/LabToolbar';
import { useUiStore } from '../store/uiStore';
import { useExperimentStore } from '../store/experimentStore';
import { HandTrackerAR, type TrackingLabData } from '../components/lab/HandTrackerAR';
import { GestureProcessor } from '../components/lab/GestureProcessor';
import { HoloOverlay } from '../components/lab/HoloOverlay';

export default function LabPage() {
    const arEnabled = useUiStore((s) => s.arEnabled);
    const [arReady, setArReady] = useState(false);
    const [arStatus, setArStatus] = useState('');

    // Reset each time AR is toggled
    useEffect(() => {
        if (arEnabled) { setArReady(false); setArStatus(''); }
    }, [arEnabled]);

    // Tracking state stored in a ref (no re-renders)
    const trackingRef = useRef<TrackingLabData>({
        left: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
        right: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
        faceYaw: 0,
        facePitch: 0
    });

    // Processors & camera refs
    const gestureProcessor = useRef(new GestureProcessor());
    const panRef = useRef(0);
    const zoomRef = useRef(0);
    const faceYawRef = useRef(0);
    const facePitchRef = useRef(0);

    const handleTrackingUpdate = useCallback((data: TrackingLabData) => {
        // 1. Update main ref for HoloOverlay fast path
        trackingRef.current = data;

        // 2. Drive Camera Refs directly
        faceYawRef.current = data.faceYaw;

        // 3. Process the 5 exact gestures
        gestureProcessor.current.processFrame(data, {
            onSwipeLeft: () => {
                const tabs = ['controls', 'data', 'chart'] as const;
                const idx = tabs.indexOf(useUiStore.getState().sidebarTab);
                useUiStore.getState().setSidebarTab(tabs[(idx + tabs.length - 1) % tabs.length]);
            },
            onSwipeRight: () => {
                const tabs = ['controls', 'data', 'chart'] as const;
                const idx = tabs.indexOf(useUiStore.getState().sidebarTab);
                useUiStore.getState().setSidebarTab(tabs[(idx + 1) % tabs.length]);
            },
            onSwipeUp: () => useExperimentStore.getState().addVolume(1.0),
            onSwipeDown: () => useExperimentStore.getState().addVolume(0.1),
            onFaceYaw: (yaw) => {
                faceYawRef.current = yaw;
            },
            onFacePitch: (pitch) => {
                facePitchRef.current = pitch;
            },
            onZoom: (delta) => { zoomRef.current += delta; },
            onPan: (dx) => { panRef.current += dx; },
        });
    }, []);

    return (
        <div className="flex flex-col flex-1 w-full overflow-y-auto lg:overflow-hidden bg-background relative">
            <LabToolbar />
            <TutorialOverlay />
            <QuizModal />
            <ResultsModal />

            <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden relative w-full h-full bg-background">
                {/* 3D Scene */}
                <div className="flex-[2] lg:flex-[3] min-h-[50vh] lg:min-h-0 relative w-full h-full">
                    <LabAssistant />
                    {/* Pass camera refs downwards */}
                    <LabScene
                        panRef={panRef}
                        zoomRef={zoomRef}
                        faceYawRef={faceYawRef}
                        facePitchRef={facePitchRef}
                    />
                </div>

                {/* Sidebar Controls */}
                <RightSidebar />
            </div>

            {/* AR Elements */}
            {arEnabled && (() => {
                const STEPS = [
                    'Downloading Vision engine…',
                    'Loading hand tracking model…',
                    'Loading face tracking model…',
                    'Requesting camera access…',
                    'Camera ready — detecting face…',
                ];
                const currentIdx = STEPS.indexOf(arStatus);

                return (
                    <>
                        <HandTrackerAR
                            onUpdate={handleTrackingUpdate}
                            onCameraReady={() => { }}
                            onCalibrated={() => setArReady(true)}
                            onStatus={(s) => setArStatus(s)}
                        />
                        <HoloOverlay trackingRef={trackingRef} />

                        {/* Loading overlay — shown until face calibration completes */}
                        {!arReady && (
                            <div style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(5, 5, 20, 0.92)',
                                backdropFilter: 'blur(12px)',
                            }}>
                                {/* Spinner */}
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    border: '3px solid rgba(99,102,241,0.2)',
                                    borderTopColor: '#6366f1',
                                    borderRightColor: '#8b5cf6',
                                    animation: 'ar-spin 1s linear infinite',
                                    marginBottom: 32,
                                    boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                                }} />

                                <p style={{
                                    color: '#e0e7ff', fontFamily: 'Inter,sans-serif',
                                    fontSize: 20, fontWeight: 700, letterSpacing: '0.04em',
                                    marginBottom: 24,
                                }}>Initialising AR</p>

                                {/* Real dynamic step list */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 320 }}>
                                    {STEPS.map((step, i) => {
                                        const done = i < currentIdx;
                                        const active = i === currentIdx;
                                        return (
                                            <div key={step} style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                opacity: i > currentIdx ? 0.25 : 1,
                                                transition: 'opacity 0.4s',
                                            }}>
                                                <span style={{
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: done ? '#10b981' : active ? '#6366f1' : 'transparent',
                                                    border: done ? 'none' : active ? '2px solid #6366f1' : '2px solid rgba(99,102,241,0.3)',
                                                    animation: active ? 'ar-pulse 1s ease-in-out infinite' : 'none',
                                                    flexShrink: 0, fontSize: 11,
                                                }}>
                                                    {done ? '✓' : ''}
                                                </span>
                                                <span style={{
                                                    color: done ? '#10b981' : active ? '#c7d2fe' : '#4b5563',
                                                    fontFamily: 'Inter,sans-serif',
                                                    fontSize: 13,
                                                    fontWeight: active ? 600 : 400,
                                                }}>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <style>{`
                            @keyframes ar-spin  { to { transform: rotate(360deg); } }
                            @keyframes ar-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 6px rgba(99,102,241,0); } }
                        `}</style>
                    </>
                );
            })()}
        </div>
    );
}
