import { useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ARCameraProps {
    panRef: MutableRefObject<number>;
    zoomRef: MutableRefObject<number>;
    faceYawRef: MutableRefObject<number>;
    facePitchRef: MutableRefObject<number>;
}

// Target that the camera always looks at
const LOOK_TARGET = new THREE.Vector3(0, 0.5, 0);

export function ARCamera({ panRef, zoomRef, faceYawRef, facePitchRef }: ARCameraProps) {
    const { camera } = useThree();

    // Base "home" position when no head tracking offset is applied
    const baseX = 0;
    const baseY = 1.5;
    const baseZ = 7.5;

    // Accumulated zoom distance (positive = closer, negative = further)
    const prevZoomRef = useRef(0);

    useFrame(() => {
        const LERP = 0.08;

        // ── 1. Face offsets (pan & pitch from head tracking) ────────────────
        const faceOffsetX = THREE.MathUtils.clamp(faceYawRef.current * 8.0, -5, 5);
        const faceOffsetY = THREE.MathUtils.clamp(facePitchRef.current * 6.0, -3, 3);
        const panOffsetX = THREE.MathUtils.clamp(panRef.current * 10.0, -3, 3);

        // ── 2. The "natural" position based on head pose (before zoom) ───────
        //   This is where the camera sits if zoomRef = 0
        const naturalPos = new THREE.Vector3(
            baseX - panOffsetX - faceOffsetX,
            baseY + faceOffsetY,
            baseZ
        );

        // ── 3. Compute forward direction from naturalPos toward LOOK_TARGET ──
        //   This is the direction zoom should travel along
        const forward = new THREE.Vector3()
            .subVectors(LOOK_TARGET, naturalPos)
            .normalize();

        // ── 4. Apply zoom along the forward direction ─────────────────────────
        const zoomAmount = THREE.MathUtils.clamp(zoomRef.current * 8.0, -10, 10);
        const targetPos = new THREE.Vector3()
            .copy(naturalPos)
            .addScaledVector(forward, zoomAmount);

        // ── 5. Lerp camera position ─────────────────────────────────────────
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPos.x, LERP);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPos.y, LERP);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPos.z, LERP);

        // Keep looking at the centre of the lab bench
        camera.lookAt(LOOK_TARGET);

        prevZoomRef.current = zoomAmount;
    });

    return null;
}
