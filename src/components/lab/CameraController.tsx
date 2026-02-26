import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import type { LabStage } from '../../store/experimentStore';
import * as THREE from 'three';

// ── Camera presets per lab stage ────────────────────────────────────────────
const CAMERA_PRESETS: Record<LabStage, { pos: [number, number, number]; target: [number, number, number] }> = {
    'setup': { pos: [0, 1.5, 7.5], target: [0, 0.3, 0] },
    'fill-burette': { pos: [-1.0, 1.2, 4.5], target: [-0.8, 0.3, -0.3] },
    'fill-flask': { pos: [-0.6, 0.0, 3.5], target: [-0.5, -0.4, -0.2] },
    'titrate': { pos: [0.4, 0.8, 6.0], target: [0, 0.2, -0.2] },
    'done': { pos: [0, 1.0, 6.0], target: [0, 0.2, 0] },
};

export default function CameraController() {
    const { camera } = useThree();
    const labStage = useExperimentStore((s) => s.labStage);
    const targetPos = useRef(new THREE.Vector3(0, 1.5, 7.5));
    const targetLook = useRef(new THREE.Vector3(0, 0.3, 0));

    const transitionStart = useRef(Date.now());

    useEffect(() => {
        const preset = CAMERA_PRESETS[labStage];
        targetPos.current.set(...preset.pos);
        targetLook.current.set(...preset.target);
        transitionStart.current = Date.now();
    }, [labStage]);

    useFrame(() => {
        // Only automate camera for the first 2 seconds of a stage
        if (Date.now() - transitionStart.current < 2000) {
            camera.position.lerp(targetPos.current, 0.04);

            const currentLook = new THREE.Vector3();
            camera.getWorldDirection(currentLook);
            const desiredDir = targetLook.current.clone().sub(camera.position).normalize();
            currentLook.lerp(desiredDir, 0.04);
            camera.lookAt(camera.position.clone().add(currentLook));
        }
    });

    return null;
}
