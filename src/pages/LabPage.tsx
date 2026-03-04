import { useRef, useCallback } from 'react';
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

    // Tracking state stored in a ref (no re-renders)
    const trackingRef = useRef<TrackingLabData>({
        left: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
        right: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
        faceYaw: 0
    });

    // Processors & camera refs
    const gestureProcessor = useRef(new GestureProcessor());
    const panRef = useRef(0);
    const zoomRef = useRef(0);
    const faceYawRef = useRef(0);

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
            onFaceYaw: (yaw) => { faceYawRef.current = yaw; },
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
                    <LabScene panRef={panRef} zoomRef={zoomRef} faceYawRef={faceYawRef} />
                </div>

                {/* Sidebar Controls */}
                <RightSidebar />
            </div>

            {/* AR Elements */}
            {arEnabled && (
                <>
                    <HandTrackerAR onUpdate={handleTrackingUpdate} onCameraReady={() => console.log('Camera ready')} />
                    <HoloOverlay trackingRef={trackingRef} />
                </>
            )}
        </div>
    );
}
