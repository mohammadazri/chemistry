import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

export interface HandState {
    isPresent: boolean;
    isPinching: boolean;
    isFist: boolean;
    pinchDist: number;
    wrist: { x: number; y: number; z: number };       // normalised 0-1, mirrored X
    indexTip: { x: number; y: number; z: number };
}

export interface TrackingLabData {
    left: HandState;
    right: HandState;
    faceYaw: number;   // -1 to +1, 0 = centre
    facePitch: number; // -1 to +1, 0 = centre
}

interface HandTrackerARProps {
    onUpdate: (data: TrackingLabData) => void;
    onCameraReady: () => void;
    onCalibrated: () => void;
}

export const HandTrackerAR: React.FC<HandTrackerARProps> = ({ onUpdate, onCameraReady, onCalibrated }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        let handLandmarker: HandLandmarker | null = null;
        let faceLandmarker: FaceLandmarker | null = null;
        let animationFrameId: number;
        let isMounted = true;

        const setupMediaPipe = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );

                if (!isMounted) return;

                handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 2
                });

                faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                if (isMounted) {
                    startCamera(handLandmarker, faceLandmarker);
                } else {
                    handLandmarker.close();
                    faceLandmarker.close();
                }
            } catch (err) {
                console.error("MediaPipe Load Error:", err);
                if (isMounted) setError("Failed to load tracking engine.");
            }
        };

        const startCamera = async (handLm: HandLandmarker, faceLm: FaceLandmarker) => {
            if (!videoRef.current) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'user' }
                });

                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                videoRef.current.srcObject = stream;
                videoRef.current.onloadeddata = () => {
                    if (isMounted) {
                        onCameraReady();
                        predictWebcam(handLm, faceLm);
                    }
                };
            } catch (err) {
                console.error("Camera Error:", err);
                if (isMounted) setError("Camera access denied.");
            }
        };

        // Calibration baseline — set on the first detected face frame
        let baselineYaw: number | null = null;
        let baselinePitch: number | null = null;
        let calibrated = false;

        const predictWebcam = (handLm: HandLandmarker, faceLm: FaceLandmarker) => {
            if (!videoRef.current || !isMounted) return;

            const startTimeMs = performance.now();
            let handResult = null;
            let faceResult = null;

            if (videoRef.current.readyState >= 2) {
                try {
                    handResult = handLm.detectForVideo(videoRef.current, startTimeMs);
                    faceResult = faceLm.detectForVideo(videoRef.current, startTimeMs);
                } catch (e) {
                    console.warn("Detection dropped frame", e);
                }
            }

            const trackingData: TrackingLabData = {
                left: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
                right: { isPresent: false, isPinching: false, isFist: false, pinchDist: 0, wrist: { x: 0, y: 0, z: 0 }, indexTip: { x: 0, y: 0, z: 0 } },
                faceYaw: 0,
                facePitch: 0
            };

            // Calculate Face Yaw & Pitch (Nose relative to eye midpoint)
            if (faceResult && faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
                const lm = faceResult.faceLandmarks[0];
                const nose = lm[1];
                const leftEye = lm[33];
                const rightEye = lm[263];

                const eyeMidX = (leftEye.x + rightEye.x) / 2;
                const eyeMidY = (leftEye.y + rightEye.y) / 2;

                const rawYaw = (nose.x - eyeMidX) * 10.0;
                const rawPitch = (nose.y - eyeMidY) * 10.0;

                // Capture the first reading as the neutral baseline
                if (baselineYaw === null) baselineYaw = rawYaw;
                if (baselinePitch === null) baselinePitch = rawPitch;

                // Fire onCalibrated once when baseline is first captured
                if (!calibrated) {
                    calibrated = true;
                    onCalibrated();
                }

                // Subtract baseline so the camera starts centred
                trackingData.faceYaw = rawYaw - baselineYaw;
                trackingData.facePitch = rawPitch - baselinePitch;
            }

            // Calculate Hands
            if (handResult && handResult.landmarks) {
                handResult.handedness.forEach((h, index) => {
                    const landmarks = handResult!.landmarks[index];
                    // MediaPipe 'Right' is User Left when mirrored
                    const isLeft = h[0].categoryName === 'Right';

                    const wrist = landmarks[0];
                    const thumbTip = landmarks[4];
                    const indexTip = landmarks[8];

                    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

                    // Fist detection: check if index, middle, ring, pinky are curled
                    const isCurled = (tipIdx: number, pipIdx: number) => {
                        const tip = landmarks[tipIdx];
                        const pip = landmarks[pipIdx];
                        const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
                        const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
                        return dTip < dPip;
                    };

                    const isFist = isCurled(8, 6) && isCurled(12, 10) && isCurled(16, 14) && isCurled(20, 18);

                    const state: HandState = {
                        isPresent: true,
                        isPinching: pinchDist < 0.10,
                        isFist: isFist,
                        pinchDist: pinchDist,
                        // Mirror X coordinate
                        wrist: { x: 1 - wrist.x, y: wrist.y, z: wrist.z },
                        indexTip: { x: 1 - indexTip.x, y: indexTip.y, z: indexTip.z }
                    };

                    if (isLeft) trackingData.left = state;
                    else trackingData.right = state;
                });
            }

            onUpdateRef.current(trackingData);
            animationFrameId = requestAnimationFrame(() => predictWebcam(handLm, faceLm));
        };

        setupMediaPipe();

        return () => {
            isMounted = false;
            cancelAnimationFrame(animationFrameId);
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
            if (handLandmarker) handLandmarker.close();
            if (faceLandmarker) faceLandmarker.close();
        };
    }, [onCameraReady]);

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
