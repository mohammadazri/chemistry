import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function BuretteModel() {
    const buretteGroup = useRef<THREE.Group>(null);
    const isStopcockOpen = useExperimentStore((state) => state.isStopcockOpen);
    const setStopcockOpen = useExperimentStore((state) => state.setStopcockOpen);
    const showMolecular = useUiStore((state) => state.showMolecular);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const addVolume = useExperimentStore((state) => state.addVolume);
    const isRunning = useExperimentStore((state) => state.isRunning);
    const labStage = useExperimentStore((state) => state.labStage);

    // Fill animation: 0→30 during fill-burette stage
    const [animFill, setAnimFill] = useState(0);  // mL shown during fill animation
    useEffect(() => {
        if (labStage === 'fill-burette') setAnimFill(0);
        if (labStage === 'titrate' || labStage === 'done') setAnimFill(30);
    }, [labStage]);

    // Realistic dimensions
    const maxVolume = 50;
    const tubeHeight = 2.0;
    const tubeRadius = 0.05;

    // In titrate/done: drain from 30 down. During fill-burette: animate up to 30. Setup: 0.
    const displayFill = labStage === 'setup' ? 0 : labStage === 'fill-burette' ? animFill : 30;
    const liquidHeight = Math.max(0, tubeHeight * (displayFill - volumeAdded) / maxVolume);
    const liquidY = (-tubeHeight / 2) + (liquidHeight / 2);

    // Handle continuous pouring if stopcock is open (titrate only)
    const fillTimerRef = useRef(0);
    useEffect(() => {
        if (labStage === 'fill-burette') fillTimerRef.current = 0;
    }, [labStage]);

    // Molecular View parameters
    const MAX_BURETTE_PARTICLES = 150;
    const naMeshRef = useRef<THREE.InstancedMesh>(null);
    const ohMeshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const ionsData = useMemo(() => {
        const createIons = () => new Array(MAX_BURETTE_PARTICLES).fill(0).map(() => ({
            seed: Math.random() * 100,
            offsetY: Math.random() // Initialize uniform distribution 0 to 1
        }));
        return {
            na: createIons(),
            oh: createIons()
        };
    }, []);

    useFrame((state, dt) => {
        if (isStopcockOpen && isRunning && volumeAdded < maxVolume) {
            addVolume(0.08);
        }
        // Animate fill in fill-burette stage
        if (labStage === 'fill-burette') {
            fillTimerRef.current += dt;
            // Delay until bottle is tilted (0.6 + 0.8 + 0.7 = 2.1s)
            if (fillTimerRef.current > 2.1) {
                setAnimFill((prev) => Math.min(30, prev + dt * 14));
            }
        }

        // Animate molecules if visible
        if (showMolecular && liquidHeight > 0.05) {
            const time = state.clock.getElapsedTime();

            const updateMesh = (
                mesh: THREE.InstancedMesh | null,
                data: { seed: number; offsetY: number }[],
                speed: number = 1
            ) => {
                if (!mesh) return;

                for (let i = 0; i < MAX_BURETTE_PARTICLES; i++) {
                    const ion = data[i];
                    const t = time * speed + ion.seed;

                    // Vertical fluid motion inside the changing liquid boundaries
                    let yFrac = ion.offsetY + Math.sin(t * 0.15) * 0.2;
                    yFrac -= Math.floor(yFrac); // keep between 0 and 1

                    // Scale local fraction by the total liquid height
                    const localY = (yFrac - 0.5) * liquidHeight;

                    // Horizontal fluid motion inside the tube
                    const angle = t * 0.5 + i;
                    const rFrac = (Math.cos(t * 0.6 + i * 0.4) + 1) / 2;
                    const dist = rFrac * (tubeRadius - 0.012); // keep away from glass walls

                    dummy.position.set(
                        Math.cos(angle) * dist,
                        liquidY + localY,
                        Math.sin(angle) * dist
                    );

                    dummy.scale.setScalar(1);
                    dummy.updateMatrix();
                    mesh.setMatrixAt(i, dummy.matrix);
                }
                mesh.instanceMatrix.needsUpdate = true;
            };

            updateMesh(naMeshRef.current, ionsData.na, 1.2);
            updateMesh(ohMeshRef.current, ionsData.oh, 1.4);
        }
    });

    const handleStopcockClick = (e: any) => {
        e.stopPropagation();
        if (!isRunning) return;
        setStopcockOpen(!isStopcockOpen);
    };

    // Opacity-based glass — same look but interior (liquid) stays visible
    const glassMaterial = (
        <meshPhysicalMaterial
            transparent={true}
            opacity={0.12}
            roughness={0.02}
            reflectivity={0.9}
            ior={1.47}
            clearcoat={1}
            clearcoatRoughness={0.02}
            color="#d0ecff"
            side={THREE.DoubleSide}
            depthWrite={false}
        />
    );

    // Generate accurate tick marks (50 major/minor ticks)
    const tickMarks = useMemo(() => {
        const marks = [];
        for (let i = 0; i <= maxVolume; i++) {
            const isMajor = i % 5 === 0;
            // Physical position: 0 is at the bottom, 50 is at the top
            // yPos: i=0 maps to bottom (-tubeHeight/2), i=50 maps to top (+tubeHeight/2)
            const yPos = (-tubeHeight / 2) + (i * (tubeHeight / maxVolume));
            // Label: show i (0 at bottom, 50 at top)
            const label = i;

            marks.push(
                <group key={i} position={[0, yPos, 0]}>
                    {/* Tick Line wrapped around tube */}
                    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[tubeRadius + 0.001, tubeRadius + 0.001, isMajor ? 0.008 : 0.003, isMajor ? 32 : 16, 1, true, 0, isMajor ? Math.PI : Math.PI / 2]} />
                        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                    </mesh>

                    {/* Numbers for major ticks */}
                    {isMajor && (
                        <Text
                            position={[tubeRadius + 0.015, 0, tubeRadius]}
                            rotation={[0, Math.PI / 4, 0]}
                            fontSize={0.04}
                            color="#ffffff"
                            anchorX="left"
                            anchorY="middle"
                        >
                            {label}
                        </Text>
                    )}
                </group>
            );
        }
        return marks;
    }, [maxVolume, tubeHeight, tubeRadius]);

    return (
        <group ref={buretteGroup} position={[0, 2.0, -0.2]}>

            {/* --- Main Glass Tube --- */}
            <mesh castShadow>
                <cylinderGeometry args={[tubeRadius, tubeRadius, tubeHeight, 32, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* Top Rim */}
            <mesh position={[0, tubeHeight / 2, 0]}>
                <torusGeometry args={[tubeRadius, 0.005, 16, 32]} />
                {glassMaterial}
            </mesh>

            {/* --- Lower Taper leading to stopcock --- */}
            <mesh position={[0, -tubeHeight / 2 - 0.2, 0]} castShadow>
                <cylinderGeometry args={[tubeRadius, 0.015, 0.4, 32, 1, true]} />
                {glassMaterial}
            </mesh>

            {!showMolecular && liquidHeight > 0 && (
                <mesh position={[0, liquidY, 0]} renderOrder={0}>
                    <cylinderGeometry args={[tubeRadius - 0.003, tubeRadius - 0.003, liquidHeight, 24]} />
                    {/* NaOH solution — clear/slightly blue-tinted */}
                    <meshStandardMaterial
                        color="#c8e8ff"
                        transparent={true}
                        opacity={0.88}
                        roughness={0.0}
                        metalness={0}
                        depthWrite={true}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {showMolecular && liquidHeight > 0.02 && (
                <group>
                    {/* Na+ Ions (Yellow) */}
                    <instancedMesh ref={naMeshRef} args={[undefined, undefined, MAX_BURETTE_PARTICLES]} frustumCulled={false}>
                        <sphereGeometry args={[0.006, 8, 8]} />
                        <meshStandardMaterial color="#fbbf24" roughness={0.4} />
                    </instancedMesh>
                    {/* OH- Ions (Blue) */}
                    <instancedMesh ref={ohMeshRef} args={[undefined, undefined, MAX_BURETTE_PARTICLES]} frustumCulled={false}>
                        <sphereGeometry args={[0.006, 8, 8]} />
                        <meshStandardMaterial color="#0000ff" emissive="#000055" roughness={0.2} metalness={0.1} />
                    </instancedMesh>
                </group>
            )}

            {/* --- Stopcock Assembly --- */}
            <group position={[0, -tubeHeight / 2 - 0.45, 0]}>
                {/* Thick glass barrel housing the valve */}
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.035, 0.03, 0.12, 32, 1, false]} />
                    {glassMaterial}
                </mesh>

                {/* The Stopcock Valve — fixed, no rotation animation */}
                <group onClick={handleStopcockClick}>
                    {/* Main Teflon Plug Body */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.033, 0.028, 0.14, 32]} />
                        <meshPhysicalMaterial color="#3b82f6" roughness={0.5} metalness={0.1} clearcoat={0.2} />
                    </mesh>

                    {/* Handle Grips */}
                    <mesh position={[0, 0, 0.09]}>
                        <boxGeometry args={[0.14, 0.04, 0.015]} />
                        <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
                    </mesh>

                    {/* The "bore" hole where liquid passes through (simulated as a dark cylinder) */}
                    <mesh rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.066, 16]} />
                        <meshBasicMaterial color="#020617" />
                    </mesh>
                </group>
            </group>

            {/* --- Tip (drip capillary tube below stopcock) --- */}
            <mesh position={[0, -tubeHeight / 2 - 0.68, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.006, 0.36, 16, 1, true]} />
                {glassMaterial}
            </mesh>

            {/* --- The Graduation Marks --- */}
            <group position={[0, 0, 0]}>
                {tickMarks}
            </group>
        </group>
    );
}
