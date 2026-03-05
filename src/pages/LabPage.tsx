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

    // Reset arReady every time AR is toggled so the loader always shows
    useEffect(() => {
        if (arEnabled) setArReady(false);
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
            {arEnabled && (
                <>
                    <HandTrackerAR
                        onUpdate={handleTrackingUpdate}
                        onCameraReady={() => console.log('Camera ready')}
                        onCalibrated={() => setArReady(true)}
                    />
                    <HoloOverlay trackingRef={trackingRef} />

                    {/* Loading overlay — visible until face calibration completes */}
                    {!arReady && (
                        <div style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(5, 5, 20, 0.92)',
                            backdropFilter: 'blur(12px)',
                            animation: 'fadeIn 0.3s ease',
                        }}>
                            {/* Glowing ring */}
                            <div style={{
                                width: 90, height: 90, borderRadius: '50%',
                                border: '3px solid transparent',
                                borderTopColor: '#6366f1',
                                borderRightColor: '#8b5cf6',
                                animation: 'spin 1s linear infinite',
                                marginBottom: 28,
                                boxShadow: '0 0 30px rgba(99,102,241,0.5)',
                            }} />
                            <p style={{
                                color: '#c7d2fe', fontFamily: 'Inter, sans-serif',
                                fontSize: 18, fontWeight: 600, letterSpacing: '0.05em',
                                marginBottom: 8,
                            }}>Initialising AR</p>
                            <p style={{
                                color: '#6366f1', fontFamily: 'Inter, sans-serif',
                                fontSize: 13, opacity: 0.8,
                            }}>Loading models &amp; calibrating head position…</p>
                        </div>
                    )}

                    <style>{`
                        @keyframes spin { to { transform: rotate(360deg); } }
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    `}</style>
                </>
            )}
        </div>
    );
}
