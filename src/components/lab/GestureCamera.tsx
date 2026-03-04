import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { GesturePayload } from '../lib/gesture';

interface GestureCameraProps {
    /**
     * Callback to register: the component calls this with its handler
     * so the parent can pipe HEAD_YAW / HEAD_PITCH / ZOOM events in.
     */
    onRegisterHandler: (handler: (payload: GesturePayload) => void) => void;
}

/**
 * GestureCamera — R3F scene component that moves the camera
 * in response to HEAD_YAW, HEAD_PITCH, and ZOOM gesture events.
 *
 * Uses lerp for smooth, cinematic camera movement.
 * Must be placed inside <Canvas>.
 */
export default function GestureCamera({ onRegisterHandler }: GestureCameraProps) {
    const { camera } = useThree();

    // Target offsets (accumulated from gesture events)
    const targetYaw = useRef(0);
    const targetPitch = useRef(0);
    const targetZoom = useRef(0);

    // Register our handler with the parent on mount
    useEffect(() => {
        const handler = (payload: GesturePayload) => {
            const v = payload.value ?? 0;
            if (payload.type === 'HEAD_YAW') {
                // Clamp yaw range to ±0.6rad so we don't orbit too far
                targetYaw.current = THREE.MathUtils.clamp(
                    targetYaw.current + v * 0.04,
                    -0.6, 0.6
                );
            } else if (payload.type === 'HEAD_PITCH') {
                targetPitch.current = THREE.MathUtils.clamp(
                    targetPitch.current + v * 0.03,
                    -0.3, 0.3
                );
            } else if (payload.type === 'ZOOM') {
                targetZoom.current = THREE.MathUtils.clamp(
                    targetZoom.current + v * 2,
                    -3, 3
                );
            }
        };
        onRegisterHandler(handler);
    }, [onRegisterHandler]);

    // Lerp camera position every frame
    useFrame(() => {
        const LERP = 0.05; // lower = smoother / slower to respond

        // Base position from initial camera setup
        const baseX = 0;
        const baseY = 1.5;
        const baseZ = 7.5;

        const targetX = baseX + targetYaw.current * 2;
        const targetY = baseY + targetPitch.current * 1.5;
        const targetZ = baseZ + targetZoom.current;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, LERP);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, LERP);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, LERP);

        // Always look at the lab centre
        camera.lookAt(0, 0.5, 0);
    });

    return null; // No visual output
}
