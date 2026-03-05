import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

export interface HandState {
    isPresent: boolean;
    isPinching: boolean;
    isFist: boolean;
    pinchDist: number;
    wrist: { x: number; y: number; z: number };
    indexTip: { x: number; y: number; z: number };
}

export interface TrackingLabData {
    left: HandState;
    right: HandState;
    faceYaw: number;
    facePitch: number;
}

interface HandTrackerARProps {
    onUpdate: (data: TrackingLabData) => void;
    onCameraReady: () => void;
    onCalibrated: () => void;
    onStatus: (step: string) => void;
}

// ─── Module-level singleton ───────────────────────────────────────────────────
// Lives outside React so Strict Mode remounts never restart the download.
let mediaPipePromise: Promise<{ handLm: HandLandmarker; faceLm: FaceLandmarker }> | null = null;

async function getMediaPipe(
    onStatus: (s: string) => void
): Promise<{ handLm: HandLandmarker; faceLm: FaceLandmarker }> {
    if (!mediaPipePromise) {
        mediaPipePromise = (async () => {
            onStatus('Downloading Vision engine…');
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
            );

            onStatus('Loading hand tracking model…');
            const handLm = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 2,
            });

            onStatus('Loading face tracking model…');
            const faceLm = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numFaces: 1,
            });

            return { handLm, faceLm };
        })();
    }
    return mediaPipePromise;
}
// ─────────────────────────────────────────────────────────────────────────────

export const HandTrackerAR: React.FC<HandTrackerARProps> = ({
    onUpdate,
    onCameraReady,
    onCalibrated,
    onStatus,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    // Keep all callbacks in refs so closures are always fresh
    const onUpdateRef = useRef(onUpdate);
    const onStatusRef = useRef(onStatus);
    const onCalibratedRef = useRef(onCalibrated);
    const onCameraReadyRef = useRef(onCameraReady);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
        onStatusRef.current = onStatus;
        onCalibratedRef.current = onCalibrated;
        onCameraReadyRef.current = onCameraReady;
    }, [onUpdate, onStatus, onCalibrated, onCameraReady]);

    useEffect(() => {
        let animationFrameId: number;
        let active = true; // local to THIS effect run

        let baselineYaw: number | null = null;
        let baselinePitch: number | null = null;
        let calibrated = false;

        const run = async () => {
            let handLm: HandLandmarker, faceLm: FaceLandmarker;
            try {
                // If models are already cached, this resolves instantly
                ({ handLm, faceLm } = await getMediaPipe((s) => {
                    if (active) onStatusRef.current(s);
                }));
            } catch (err) {
                console.error('MediaPipe Load Error:', err);
                if (active) setError('Failed to load tracking engine.');
                return;
            }

            if (!active || !videoRef.current) return;

            // Camera access
            let stream: MediaStream;
            try {
                onStatusRef.current('Requesting camera access…');
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'user' },
                });
            } catch (err) {
                console.error('Camera Error:', err);
                if (active) setError('Camera access denied.');
                return;
            }

            if (!active) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }

            videoRef.current.srcObject = stream;

            await new Promise<void>((resolve) => {
                videoRef.current!.onloadeddata = () => resolve();
            });

            if (!active) return;

            onStatusRef.current('Camera ready — detecting face…');
            onCameraReadyRef.current();

            // Safety fallback: dismiss loader after 10 s if no face detected
            const timeout = setTimeout(() => {
                if (!calibrated && active) {
                    calibrated = true;
                    onCalibratedRef.current();
                }
            }, 10_000);

            const predict = () => {
                if (!active || !videoRef.current) return;

                const t = performance.now();
                let handResult = null, faceResult = null;

                if (videoRef.current.readyState >= 2) {
                    try {
                        handResult = handLm.detectForVideo(videoRef.current, t);
                        faceResult = faceLm.detectForVideo(videoRef.current, t);
                    } catch (e) {
                        console.warn('Dropped frame', e);
                    }
                }

                const trackingData: TrackingLabData = {
                    left: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
                    right: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
                    faceYaw: 0,
                    facePitch: 0,
                };

                // Face Yaw & Pitch
                if (faceResult?.faceLandmarks?.length) {
                    const lm = faceResult.faceLandmarks[0];
                    const nose = lm[1], leftEye = lm[33], rightEye = lm[263];
                    const eyeMidX = (leftEye.x + rightEye.x) / 2;
                    const eyeMidY = (leftEye.y + rightEye.y) / 2;
                    const rawYaw = (nose.x - eyeMidX) * 10;
                    const rawPitch = (nose.y - eyeMidY) * 10;

                    if (baselineYaw === null) baselineYaw = rawYaw;
                    if (baselinePitch === null) baselinePitch = rawPitch;

                    if (!calibrated) {
                        calibrated = true;
                        clearTimeout(timeout);
                        onCalibratedRef.current();
                    }

                    trackingData.faceYaw = rawYaw - baselineYaw;
                    trackingData.facePitch = rawPitch - baselinePitch;
                }

                // Hands
                if (handResult?.landmarks) {
                    handResult.handedness.forEach((h, i) => {
                        const lm = handResult!.landmarks[i];
                        const isLeft = h[0].categoryName === 'Right';
                        const wrist = lm[0], thumbTip = lm[4], indexTip = lm[8];
                        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
                        const isCurled = (tip: number, pip: number) => {
                            const dTip = Math.hypot(lm[tip].x - wrist.x, lm[tip].y - wrist.y);
                            const dPip = Math.hypot(lm[pip].x - wrist.x, lm[pip].y - wrist.y);
                            return dTip < dPip;
                        };
                        const state: HandState = {
                            isPresent: true,
                            isPinching: pinchDist < 0.10,
                            isFist: isCurled(8, 6) && isCurled(12, 10) && isCurled(16, 14) && isCurled(20, 18),
                            pinchDist,
                            wrist: { x: 1 - wrist.x, y: wrist.y, z: wrist.z },
                            indexTip: { x: 1 - indexTip.x, y: indexTip.y, z: indexTip.z },
                        };
                        if (isLeft) trackingData.left = state;
                        else trackingData.right = state;
                    });
                }

                onUpdateRef.current(trackingData);
                animationFrameId = requestAnimationFrame(predict);
            };

            predict();
        };

        run();

        return () => {
            active = false;
            cancelAnimationFrame(animationFrameId);
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="fixed bottom-6 right-6 w-48 rounded-xl object-cover z-[100] border border-indigo-500/30 opacity-80 shadow-2xl pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
            />
            {error && (
                <div className="fixed bottom-6 right-6 z-[100] bg-red-900/90 p-4 rounded-xl border border-red-500 text-white text-xs text-center shadow-lg">
                    {error}
                </div>
            )}
        </>
    );
};
