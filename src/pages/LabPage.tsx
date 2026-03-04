import { useRef, useCallback } from 'react';
import LabScene from '../components/lab/LabScene';
import RightSidebar from '../components/panels/RightSidebar';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import QuizModal from '../components/tutorial/QuizModal';
import ResultsModal from '../components/results/ResultsModal';
import LabAssistant from '../components/lab/LabAssistant';
import LabToolbar from '../components/lab/LabToolbar';
import GestureHUD from '../components/lab/GestureHUD';
import type { GesturePayload } from '../lib/gesture';

export default function LabPage() {
    // Ref to the camera gesture handler registered by GestureCamera inside LabScene.
    // GestureHUD calls this to route HEAD_YAW / HEAD_PITCH / ZOOM events into the 3D canvas.
    const cameraHandlerRef = useRef<((payload: GesturePayload) => void) | null>(null);

    const handleCameraGesture = useCallback((payload: GesturePayload) => {
        cameraHandlerRef.current?.(payload);
    }, []);

    const registerCameraHandler = useCallback((handler: (payload: GesturePayload) => void) => {
        cameraHandlerRef.current = handler;
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
                    <LabScene onRegisterCameraHandler={registerCameraHandler} />
                </div>

                {/* Sidebar Controls */}
                <RightSidebar />
            </div>

            {/* AR Gesture HUD — fixed to bottom-right, overlays everything */}
            <GestureHUD onCameraGesture={handleCameraGesture} />
        </div>
    );
}
