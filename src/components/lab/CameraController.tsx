import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';
import type { CameraViewPreset } from '../../store/uiStore';
import type { LabStage } from '../../store/experimentStore';
import * as THREE from 'three';

// ── Camera presets per lab stage ────────────────────────────────────────────
const CAMERA_PRESETS: Record<LabStage, { pos: [number, number, number]; target: [number, number, number] }> = {
    'setup': { pos: [0, 1.5, 7.5], target: [0, 0.3, 0] },
    'fill-burette': { pos: [0.0, 1.2, 4.5], target: [0, 0.6, -0.2] },
    'fill-flask': { pos: [0.0, -0.1, 2.5], target: [0, -0.35, -0.2] },
    'titrate': { pos: [0.0, 0.5, 3.5], target: [0, -0.1, -0.2] },
    'done': { pos: [0.0, 0.5, 5.0], target: [0, 0.0, 0] },
};

const MANUAL_CAMERA_PRESETS: Record<Exclude<CameraViewPreset, 'auto'>, { pos: [number, number, number]; target: [number, number, number] }> = {
    'periodic_table': { pos: [-2.8, 2.8, 0.5], target: [-2.8, 2.8, -4.96] },
    'emergency_shower': { pos: [-5.0, 2.5, 3.5], target: [-6.5, 2.5, -3.5] },
    'safety_first': { pos: [-4.0, 1.5, -1.5], target: [-6.94, 1.5, -1.5] },
    'side_desk': { pos: [2.5, 1.8, 1.5], target: [5.0, 0.5, 0] }, // Looks at right side desk area
    'wall_clock': { pos: [4.0, 3.0, -2.0], target: [5.5, 3.2, -4.93] },
};

export default function CameraController() {
    const { camera } = useThree();
    const labStage = useExperimentStore((s) => s.labStage);
    const cameraResetKey = useUiStore((s) => s.cameraResetKey);
    const activeCameraView = useUiStore((s) => s.activeCameraView);
    const targetPos = useRef(new THREE.Vector3(0, 1.5, 7.5));
    const targetLook = useRef(new THREE.Vector3(0, 0.3, 0));

    const transitionStart = useRef(Date.now());

    useEffect(() => {
        const preset = activeCameraView === 'auto'
            ? CAMERA_PRESETS[labStage]
            : MANUAL_CAMERA_PRESETS[activeCameraView];

        targetPos.current.set(...preset.pos);
        targetLook.current.set(...preset.target);
        transitionStart.current = Date.now();

        // Also reset OrbitControls target so orbit pivots around the experiment
        const controls = (window as any).__orbitControls;
        if (controls) {
            controls.target.set(...preset.target);
            controls.update();
        }
    }, [labStage, cameraResetKey, activeCameraView]);

    useFrame(() => {
        // Automate camera for the first 2 seconds of a stage or manual view change
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
