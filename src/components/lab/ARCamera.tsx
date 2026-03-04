import { useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ARCameraProps {
    panRef: MutableRefObject<number>;
    zoomRef: MutableRefObject<number>;
    faceYawRef: MutableRefObject<number>;
}

export function ARCamera({ panRef, zoomRef, faceYawRef }: ARCameraProps) {
    const { camera } = useThree();

    // Store base position
    const baseX = 0;
    const baseY = 1.5;
    const baseZ = 7.5;

    // We accumulate the target values smoothly
    const targetX = useRef(baseX);
    const targetZ = useRef(baseZ);

    useFrame(() => {
        const LERP = 0.08;

        // Combine two-hand pan delta and face yaw
        // Pan maps to X movement. Zoom maps to Z movement.
        // faceYaw acts as an offset on X
        const currentPanX = panRef.current * 10.0; // amplify pan
        const currentZoomZ = zoomRef.current * 8.0; // amplify zoom
        const currentFaceYawX = faceYawRef.current * 3.0;

        // Clamp values so we don't fly off to infinity
        const clampedZoom = THREE.MathUtils.clamp(currentZoomZ, -4, 4);
        const clampedPan = THREE.MathUtils.clamp(currentPanX, -3, 3);
        const clampedFace = THREE.MathUtils.clamp(currentFaceYawX, -2, 2);

        // Calculate absolute target position
        targetX.current = baseX - clampedPan - clampedFace;
        targetZ.current = baseZ - clampedZoom;

        // Lerp camera
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX.current, LERP);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ.current, LERP);

        // Always smoothly look at center
        camera.lookAt(0, 0.5, 0);
    });

    return null;
}
