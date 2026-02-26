import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';

const dummy = new THREE.Object3D();
const MAX_PARTICLES = 1000;

export default function MolecularView() {
    const showMolecular = useUiStore((state) => state.showMolecular);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);

    const h3oMeshRef = useRef<THREE.InstancedMesh>(null);
    const ohMeshRef = useRef<THREE.InstancedMesh>(null);
    const naMeshRef = useRef<THREE.InstancedMesh>(null);
    const clMeshRef = useRef<THREE.InstancedMesh>(null);

    // Rough calculation for visualization scaling
    const h3oCount = currentPH < 7 ? Math.min(MAX_PARTICLES, Math.floor(Math.pow(10, 7 - currentPH) * 10)) : 0;
    const ohCount = currentPH > 7 ? Math.min(MAX_PARTICLES, Math.floor(Math.pow(10, currentPH - 7) * 10)) : 0;
    const naCount = 50;
    const clCount = Math.min(MAX_PARTICLES, Math.floor(volumeAdded * 5));

    // Store target positions for Brownian motion interpolation
    const positionsData = useMemo(() => {
        return {
            h3o: new Array(MAX_PARTICLES).fill(0).map(() => getRandPos()),
            oh: new Array(MAX_PARTICLES).fill(0).map(() => getRandPos()),
            na: new Array(MAX_PARTICLES).fill(0).map(() => getRandPos()),
            cl: new Array(MAX_PARTICLES).fill(0).map(() => getRandPos()),
        };
    }, []);

    function getRandPos() {
        return new THREE.Vector3(
            (Math.random() - 0.5) * 0.8, // x: [-0.4, 0.4]
            (Math.random() - 0.5) * 0.6, // y: [-0.3, 0.3]
            (Math.random() - 0.5) * 0.8  // z: [-0.4, 0.4]
        );
    }

    useFrame((state) => {
        if (!showMolecular) return;
        const time = state.clock.getElapsedTime();

        // Brownian motion updates every 2s, but we interpolate continuously using sine waves
        const updateMesh = (
            mesh: THREE.InstancedMesh | null,
            count: number,
            basePositions: THREE.Vector3[],
            speed: number = 1
        ) => {
            if (!mesh) return;
            for (let i = 0; i < count; i++) {
                const base = basePositions[i];
                // add slight sine wave drift
                dummy.position.set(
                    base.x + Math.sin(time * speed + i) * 0.05,
                    base.y + Math.cos(time * speed * 0.8 + i) * 0.05,
                    base.z + Math.sin(time * speed * 1.2 + i) * 0.05
                );
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }
            mesh.instanceMatrix.needsUpdate = true;
            mesh.count = count;
        };

        updateMesh(h3oMeshRef.current, h3oCount, positionsData.h3o, 2.0);
        updateMesh(ohMeshRef.current, ohCount, positionsData.oh, 2.0);
        updateMesh(naMeshRef.current, naCount, positionsData.na, 1.0);
        updateMesh(clMeshRef.current, clCount, positionsData.cl, 1.5);
    });

    if (!showMolecular) return null;

    return (
        <group position={[-0.5, -0.2, 0]}>
            {/* H3O+ Ions (Red) */}
            <instancedMesh ref={h3oMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#ff4444" roughness={0.2} />
            </instancedMesh>

            {/* OH- Ions (Blue) */}
            <instancedMesh ref={ohMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#4444ff" roughness={0.2} />
            </instancedMesh>

            {/* Na+ Ions (Purple) */}
            <instancedMesh ref={naMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#aa44ff" roughness={0.2} />
            </instancedMesh>

            {/* Cl- Ions (Yellow) */}
            <instancedMesh ref={clMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#ffff44" roughness={0.2} />
            </instancedMesh>
        </group>
    );
}
