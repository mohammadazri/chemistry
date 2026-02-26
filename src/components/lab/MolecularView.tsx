import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';

const dummy = new THREE.Object3D();
const MAX_PARTICLES = 500; // Reduced for performance, still plenty for visualization

export default function MolecularView() {
    const showMolecular = useUiStore((state) => state.showMolecular);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const labStage = useExperimentStore((state) => state.labStage);

    const h3oMeshRef = useRef<THREE.InstancedMesh>(null);
    const ohMeshRef = useRef<THREE.InstancedMesh>(null);
    const naMeshRef = useRef<THREE.InstancedMesh>(null);
    const clMeshRef = useRef<THREE.InstancedMesh>(null);

    // === FLASK GEOMETRY CONSTANTS (Synced with FlaskModel.tsx) ===
    const baseRadius = 0.30;
    const coneHeight = 0.38;
    const neckRadius = 0.055;
    const maxLiquidFill = coneHeight * 0.70;
    const baseLiquidHeight = maxLiquidFill * 0.10;

    // Calculate current liquid height using the same logic as FlaskModel
    const additionalHeight = (volumeAdded / 30) * maxLiquidFill * 0.52;
    const totalLiquidHeight = labStage === 'setup' || labStage === 'fill-burette' ? 0
        : (labStage === 'fill-flask' ? baseLiquidHeight : baseLiquidHeight + additionalHeight);

    // Calculate number of ions to show
    const h3oCount = currentPH < 7 ? Math.min(MAX_PARTICLES, Math.floor(Math.pow(10, 7 - currentPH) * 8)) : 0;
    const ohCount = currentPH > 7 ? Math.min(MAX_PARTICLES, Math.floor(Math.pow(10, currentPH - 7) * 8)) : 0;
    const naCount = labStage === 'titrate' || labStage === 'done' ? 40 : 0;
    const clCount = labStage === 'titrate' || labStage === 'done' ? 40 : (labStage === 'fill-flask' ? 20 : 0);

    // Initialize random factors for Brownian motion
    const ionsData = useMemo(() => {
        const createIons = () => new Array(MAX_PARTICLES).fill(0).map(() => ({
            seed: Math.random() * 100,
            offset: new THREE.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)
        }));
        return {
            h3o: createIons(),
            oh: createIons(),
            na: createIons(),
            cl: createIons()
        };
    }, []);

    useFrame((state) => {
        if (!showMolecular || totalLiquidHeight <= 0.02) return;
        const time = state.clock.getElapsedTime();

        const updateMesh = (
            mesh: THREE.InstancedMesh | null,
            count: number,
            data: { seed: number; offset: THREE.Vector3 }[],
            speed: number = 1
        ) => {
            if (!mesh) return;

            for (let i = 0; i < count; i++) {
                const ion = data[i];
                const t = time * speed + ion.seed;

                // 1. Calculate Y position within liquid volume
                const yOff = ((Math.sin(t * 0.5) + 1) / 2) * totalLiquidHeight;
                const yPos = -coneHeight / 2 + yOff;

                // 2. Calculate horizontal bounds based on conical shape at this Y
                const fillFrac = yOff / coneHeight;
                const currentRadius = baseRadius - fillFrac * (baseRadius - neckRadius) - 0.05; // -0.05 safety margin

                // 3. Polar coordinates for internal movement within the radius
                const angle = t * 0.3 + i;
                const distFrac = (Math.cos(t * 0.7 + i * 0.5) + 1) / 2;
                const dist = distFrac * currentRadius;

                dummy.position.set(
                    Math.cos(angle) * dist,
                    yPos,
                    Math.sin(angle) * dist
                );

                dummy.scale.setScalar(1);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }

            mesh.instanceMatrix.needsUpdate = true;
            mesh.count = count;
        };

        updateMesh(h3oMeshRef.current, h3oCount, ionsData.h3o, 1.2);
        updateMesh(ohMeshRef.current, ohCount, ionsData.oh, 1.2);
        updateMesh(naMeshRef.current, naCount, ionsData.na, 0.8);
        updateMesh(clMeshRef.current, clCount, ionsData.cl, 1.0);
    });

    if (!showMolecular) return null;

    return (
        // === POSITION ALIGNED WITH FlaskModel.tsx [0, -0.35, -0.2] ===
        <group position={[0, -0.35, -0.2]}>
            {/* H3O+ Ions (Red) - Acidic species */}
            <instancedMesh ref={h3oMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshStandardMaterial color="#ff3333" emissive="#440000" roughness={0.3} />
            </instancedMesh>

            {/* OH- Ions (Blue) - Basic species */}
            <instancedMesh ref={ohMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshStandardMaterial color="#3366ff" emissive="#000044" roughness={0.3} />
            </instancedMesh>

            {/* Na+ Ions (Purple/Violet) - Standard Alkali Metal color */}
            <instancedMesh ref={naMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.018, 12, 12]} />
                <meshStandardMaterial color="#9f7aea" roughness={0.2} metalness={0.1} />
            </instancedMesh>

            {/* Cl- Ions (Light Green) - Standard Halogen/Chlorine color */}
            <instancedMesh ref={clMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[0.018, 12, 12]} />
                <meshStandardMaterial color="#4ade80" roughness={0.2} metalness={0.1} />
            </instancedMesh>
        </group>
    );
}
