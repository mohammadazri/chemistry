import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';

const dummy = new THREE.Object3D();
const MAX_PARTICLES = 300; // Keeping it performant while visually dense enough

export default function MolecularView() {
    const showMolecular = useUiStore((state) => state.showMolecular);
    const labStage = useExperimentStore((state) => state.labStage);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const flaskVolume = useExperimentStore((state) => state.flaskVolume);
    const buretteVolume = useExperimentStore((state) => state.buretteVolume);
    const hclConcentration = useExperimentStore((state) => state.hclConcentration);
    const naohConcentration = useExperimentStore((state) => state.naohConcentration);

    const h3oMeshRef = useRef<THREE.InstancedMesh>(null);
    const ohMeshRef = useRef<THREE.InstancedMesh>(null);
    const naMeshRef = useRef<THREE.InstancedMesh>(null);
    const clMeshRef = useRef<THREE.InstancedMesh>(null);
    const h2oMeshRef = useRef<THREE.InstancedMesh>(null);

    // === BEAKER GEOMETRY CONSTANTS ===
    const beakerRadius = 0.17;
    const beakerHeight = 0.40;
    const maxBeakerVolume = 300;

    const getHeightForVolume = (vol: number) => {
        return (vol / maxBeakerVolume) * beakerHeight;
    };

    // Calculate current liquid height to bound particles
    const targetBaseHeight = getHeightForVolume(flaskVolume || 25.0);
    const currentVol = (flaskVolume || 25.0) + volumeAdded;
    const targetTotalHeight = getHeightForVolume(currentVol);

    const totalLiquidHeight = labStage === 'setup' || labStage === 'fill-burette' ? 0
        : labStage === 'fill-flask' ? targetBaseHeight : targetTotalHeight;

    // === REACTION LOGIC & PARTICLE COUNTS ===
    // Calculate fraction of titration completed (0 to 1+)
    const equivVol = (flaskVolume * hclConcentration) / naohConcentration;
    const titrationProgress = Math.max(0, Math.min(1.0, volumeAdded / equivVol));
    const excessBase = Math.max(0, (volumeAdded - equivVol) / 5.0); // Rough excess after equivalence

    // Particles present initially (HCl only)
    const initialAcidCount = MAX_PARTICLES;

    // H3O+ (Red) decreases as it neutralizes.
    const h3oCount = labStage === 'setup' || labStage === 'fill-burette' ? 0 :
        Math.floor(initialAcidCount * (1 - titrationProgress));

    // OH- (Blue) zero until equivalence, then rises.
    const ohCount = labStage === 'setup' || labStage === 'fill-burette' || labStage === 'fill-flask' ? 0 :
        Math.floor(MAX_PARTICLES * 0.5 * excessBase);

    // Cl- (Purple) Spectator ion. Constant amount once flask is filled.
    const clCount = labStage === 'setup' || labStage === 'fill-burette' ? 0 :
        Math.floor(MAX_PARTICLES * 0.4);

    // Na+ (Yellow) Spectator ion. Increases as NaOH is added.
    const naCount = labStage === 'setup' || labStage === 'fill-burette' || labStage === 'fill-flask' ? 0 :
        Math.floor(MAX_PARTICLES * 0.4 * (volumeAdded / buretteVolume));

    // H2O (White) Product. Increases as titration progresses.
    const h2oCount = labStage === 'setup' || labStage === 'fill-burette' || labStage === 'fill-flask' ? 0 :
        Math.floor(initialAcidCount * titrationProgress);

    // Initialize random factors for Brownian motion
    const ionsData = useMemo(() => {
        const createIons = () => new Array(MAX_PARTICLES).fill(0).map(() => ({
            seed: Math.random() * 100,
            offset: new THREE.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)
        }));
        return {
            h3o: createIons(),
            oh: createIons(),
            cl: createIons(),
            na: createIons(),
            h2o: createIons()
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

                // Keep particles inside the varying liquid height
                const yFrac = (Math.sin(t * 0.6) + 1) / 2;
                const yOff = yFrac * totalLiquidHeight;
                const yPos = -beakerHeight / 2 + 0.006 + yOff;

                // Cylindrical bounds mapping (keep particles safely inside glass wall)
                const maxRadAtY = beakerRadius - 0.03;

                // Orbit around center
                const angle = t * 0.4 + i;
                const radFrac = (Math.cos(t * 0.8 + i * 0.3) + 1) / 2;
                const dist = radFrac * maxRadAtY;

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

        // Different speeds for visual texture
        updateMesh(h3oMeshRef.current, h3oCount, ionsData.h3o, 1.4);
        updateMesh(ohMeshRef.current, ohCount, ionsData.oh, 1.4);
        updateMesh(clMeshRef.current, clCount, ionsData.cl, 0.7);
        updateMesh(naMeshRef.current, naCount, ionsData.na, 0.7);
        updateMesh(h2oMeshRef.current, h2oCount, ionsData.h2o, 0.5); // H2O is more "calm"
    });

    if (!showMolecular) return null;

    return (
        <group position={[0, -0.33, -0.2]}>
            {/* H3O+ (Red) - Acidic species */}
            <instancedMesh ref={h3oMeshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshStandardMaterial color="#ff0000" emissive="#550000" roughness={0.2} metalness={0.1} />
            </instancedMesh>

            {/* OH- (Blue) - Basic species */}
            <instancedMesh ref={ohMeshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshStandardMaterial color="#0000ff" emissive="#000055" roughness={0.2} metalness={0.1} />
            </instancedMesh>

            {/* Cl- (Purple) - Spectator ion */}
            <instancedMesh ref={clMeshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
                <sphereGeometry args={[0.016, 12, 12]} />
                <meshStandardMaterial color="#8b5cf6" roughness={0.4} />
            </instancedMesh>

            {/* Na+ (Yellow) - Spectator ion */}
            <instancedMesh ref={naMeshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
                <sphereGeometry args={[0.016, 12, 12]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.4} />
            </instancedMesh>

            {/* H2O (White/Clear) - Neutral product */}
            <instancedMesh ref={h2oMeshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.1}
                    transmission={0.8} // slightly glassy/transparent 
                    thickness={0.05}
                />
            </instancedMesh>
        </group>
    );
}
