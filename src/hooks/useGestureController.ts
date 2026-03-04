import { useRef, useEffect, useCallback, useState } from 'react';
import { GestureController } from '../lib/gesture/GestureController';
import type { ControllerStatus, GesturePayload } from '../lib/gesture';

interface UseGestureControllerOptions {
    enabled: boolean;
    onGesture?: (payload: GesturePayload) => void;
}

interface UseGestureControllerReturn {
    status: ControllerStatus;
    videoEl: HTMLVideoElement | null;
    pause: () => void;
    resume: () => void;
}

/**
 * useGestureController — React hook that manages the GestureController lifecycle.
 *
 * - Creates the controller once in a ref
 * - Starts when `enabled` becomes true, stops when it becomes false
 * - Subscribes `onGesture` to all gesture types
 * - Fully cleans up on unmount
 */
export function useGestureController({
    enabled,
    onGesture,
}: UseGestureControllerOptions): UseGestureControllerReturn {
    const controllerRef = useRef<GestureController | null>(null);
    const [status, setStatus] = useState<ControllerStatus>('idle');
    const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
    const onGestureRef = useRef(onGesture);

    // Keep ref in sync without triggering re-sub
    useEffect(() => {
        onGestureRef.current = onGesture;
    }, [onGesture]);

    useEffect(() => {
        if (enabled) {
            // Lazy-create the controller
            if (!controllerRef.current) {
                controllerRef.current = new GestureController();
            }
            const ctrl = controllerRef.current;

            setStatus('loading');

            // Subscribe to all gesture types
            const unsub = ctrl.onAny((payload) => {
                onGestureRef.current?.(payload);
            });

            ctrl.start()
                .then(() => {
                    setStatus(ctrl.getStatus());
                    setVideoEl(ctrl.getVideoElement());
                })
                .catch((err) => {
                    console.error('[useGestureController] Start failed:', err);
                    setStatus('error');
                });

            return () => {
                unsub();
                ctrl.stop();
                controllerRef.current = null;
                setStatus('idle');
                setVideoEl(null);
            };
        } else {
            // Ensure controller is stopped if it exists
            if (controllerRef.current) {
                controllerRef.current.stop();
                controllerRef.current = null;
                setStatus('idle');
                setVideoEl(null);
            }
        }
    }, [enabled]);

    const pause = useCallback(() => {
        controllerRef.current?.pause();
        setStatus('paused');
    }, []);

    const resume = useCallback(() => {
        controllerRef.current?.resume();
        setStatus('active');
    }, []);

    return { status, videoEl, pause, resume };
}
