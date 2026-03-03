import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExperimentStore } from '../../store/experimentStore';
import * as THREE from 'three';

/**
 * RealisticPourSequence handles the physical movement of bottles from the bench, 
 * picking them up, tilting to pour, and returning them.
 */

// Phase durations
const D_RISE = 0.6;
const D_MOVE = 0.8;
const D_TILT = 0.7;
const D_POUR = 2.5;
const D_RETURN = 1.2;

const TOTAL_D = D_RISE + D_MOVE + D_TILT + D_POUR + D_RETURN;

interface Particle { id: number; pos: THREE.Vector3; vel: THREE.Vector3; life: number }

export default function RealisticPourSequence() {
    const labStage = useExperimentStore((s) => s.labStage);
    const setLabStage = useExperimentStore((s) => s.setLabStage);

    const groupRef = useRef<THREE.Group>(null);
    const [particles, setParticles] = useState<Particle[]>([]);
    const timeRef = useRef(0);
    const activeStage = useRef<string | null>(null);

    // Initial positions (from LabEnvironment)
    // NaOH at [-1.5, -0.41, -0.6], HCl at [-1.5, -0.41, -0.15]
    const NAOH_BENCH = new THREE.Vector3(-1.5, -0.41, -0.6);
    const HCL_BENCH = new THREE.Vector3(-1.5, -0.41, -0.15);

    // Targets (top of burette / mouth of flask)
    // Adjusted height for larger bottles
    const BURETTE_TARGET = new THREE.Vector3(0, 3.10, -0.2); // top of burette is exactly at 3.00
    const FLASK_TARGET = new THREE.Vector3(0, 0.05, -0.2);   // top of flask is exactly at -0.02

    useEffect(() => {
        if (labStage === 'fill-burette' || labStage === 'fill-flask') {
            timeRef.current = 0;
            activeStage.current = labStage;
            setParticles([]);
        } else {
            activeStage.current = null;
            setParticles([]);
        }
    }, [labStage]);

    useFrame((_, dt) => {
        if (!activeStage.current) return;

        timeRef.current += dt;
        const t = timeRef.current;

        if (!groupRef.current) return;

        const isBurette = activeStage.current === 'fill-burette';
        const startPos = isBurette ? NAOH_BENCH : HCL_BENCH;
        const endPos = isBurette ? BURETTE_TARGET : FLASK_TARGET;

        // 1. RISE & MOVE & TILT logic
        let currentPos = new THREE.Vector3().copy(startPos);
        let currentRot = new THREE.Euler(0, 0, 0);

        // Pivot point (lower lip of the bottle neck)
        const pivot = new THREE.Vector3(0.04, 0.29, 0);

        if (t < D_RISE) {
            // Phase 1: Rise
            const p = t / D_RISE;
            currentPos.y = startPos.y + p * 0.6;
        } else if (t < D_RISE + D_MOVE) {
            // Phase 2: Move to target
            const p = (t - D_RISE) / D_MOVE;
            const riseY = startPos.y + 0.6;
            const targetPos = endPos.clone().sub(pivot);
            currentPos.set(
                startPos.x + (targetPos.x - startPos.x) * p,
                riseY + (targetPos.y - riseY) * p,
                startPos.z + (targetPos.z - startPos.z) * p
            );
        } else if (t < D_RISE + D_MOVE + D_TILT) {
            // Phase 3: Tilt
            const p = (t - D_RISE - D_MOVE) / D_TILT;
            // Tilt ~105 degrees (1.83 rad)
            currentRot.z = -p * 1.83;
            const rotatedPivot = pivot.clone().applyEuler(currentRot);
            currentPos.copy(endPos).sub(rotatedPivot);
        } else if (t < D_RISE + D_MOVE + D_TILT + D_POUR) {
            // Phase 4: Pour
            currentRot.z = -1.83;
            const rotatedPivot = pivot.clone().applyEuler(currentRot);
            currentPos.copy(endPos).sub(rotatedPivot);

            // Spawn Particles
            if (Math.random() > 0.4) {
                const spawnPos = currentPos.clone().add(rotatedPivot);
                setParticles(prev => [
                    ...prev,
                    {
                        id: Math.random(),
                        pos: spawnPos,
                        vel: new THREE.Vector3((Math.random() - 0.5) * 0.05, -3.2 - Math.random(), (Math.random() - 0.5) * 0.05),
                        life: 1.0
                    }
                ]);
            }
        } else if (t < TOTAL_D) {
            // Phase 5: Return
            const p = (t - D_RISE - D_MOVE - D_TILT - D_POUR) / D_RETURN;

            // Untilt first half, move back second half
            if (p < 0.3) {
                const pp = p / 0.3;
                currentRot.z = -1.83 * (1 - pp);
                const rotatedPivot = pivot.clone().applyEuler(currentRot);
                currentPos.copy(endPos).sub(rotatedPivot);
            } else {
                const pp = (p - 0.3) / 0.7;
                const uprightPos = endPos.clone().sub(pivot);
                currentPos.set(
                    uprightPos.x + (startPos.x - uprightPos.x) * pp,
                    uprightPos.y + (startPos.y - uprightPos.y) * pp,
                    uprightPos.z + (startPos.z - uprightPos.z) * pp
                );
            }
        } else {
            // Done
            const next = activeStage.current === 'fill-burette' ? 'fill-flask' : 'titrate';
            setLabStage(next);
            activeStage.current = null;
        }

        groupRef.current.position.copy(currentPos);
        groupRef.current.rotation.copy(currentRot);

        // Update Particles
        setParticles(prev => prev.map(p => ({
            ...p,
            pos: p.pos.clone().add(p.vel.clone().multiplyScalar(dt)),
            life: p.life - dt * 2.2
        })).filter(p => p.life > 0));
    });

    if (!activeStage.current) return null;

    const isBurette = activeStage.current === 'fill-burette';
    // NaOH is clear but in blue shade for visibility (#c8e8ff). HCl is clear (#FFF8F0).
    const liquidColor = isBurette ? '#c8e8ff' : '#FFF8F0';

    return (
        <group>
            {/* THE BOTTLE PROXY */}
            <group ref={groupRef}>
                {isBurette ? (
                    // NaOH Bottle (Amber) - UPDATED SCALE
                    <group>
                        <mesh castShadow>
                            <cylinderGeometry args={[0.078, 0.085, 0.35, 28]} />
                            <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.5} thickness={0.07} />
                        </mesh>
                        <mesh position={[0, 0.205, 0]} castShadow>
                            <cylinderGeometry args={[0.035, 0.075, 0.065, 22]} />
                            <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.35} thickness={0.05} />
                        </mesh>
                        <mesh position={[0, 0.255, 0]} castShadow>
                            <cylinderGeometry args={[0.03, 0.03, 0.045, 18]} />
                            <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.3} />
                        </mesh>
                        <mesh position={[0, 0.29, 0]} castShadow>
                            <cylinderGeometry args={[0.042, 0.042, 0.04, 16]} />
                            <meshStandardMaterial color="#1d4ed8" roughness={0.45} />
                        </mesh>
                        <mesh position={[0, -0.005, 0.088]}>
                            <planeGeometry args={[0.13, 0.2]} />
                            <meshStandardMaterial color="#f9f9f9" />
                        </mesh>
                        <Text position={[0, 0.03, 0.091]} fontSize={0.035} color="#111" fontWeight={700}>NaOH</Text>
                    </group>
                ) : (
                    // HCl Bottle (Clear) - UPDATED SCALE
                    <group>
                        <mesh castShadow>
                            <cylinderGeometry args={[0.07, 0.08, 0.35, 28]} />
                            <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.82} thickness={0.035} />
                        </mesh>
                        <mesh position={[0, -0.075, 0]}>
                            <cylinderGeometry args={[0.062, 0.07, 0.20, 22]} />
                            <meshStandardMaterial color="#fffde7" transparent opacity={0.4} />
                        </mesh>
                        <mesh position={[0, 0.205, 0]} castShadow>
                            <cylinderGeometry args={[0.032, 0.068, 0.065, 22]} />
                            <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.65} />
                        </mesh>
                        <mesh position={[0, 0.255, 0]} castShadow>
                            <cylinderGeometry args={[0.03, 0.03, 0.045, 18]} />
                            <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.5} />
                        </mesh>
                        <mesh position={[0, 0.29, 0]} castShadow>
                            <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
                            <meshStandardMaterial color="#ea580c" roughness={0.42} />
                        </mesh>
                        <mesh position={[0, -0.005, 0.083]}>
                            <planeGeometry args={[0.13, 0.2]} />
                            <meshStandardMaterial color="#f9f9f9" />
                        </mesh>
                        <Text position={[0, 0.03, 0.086]} fontSize={0.035} color="#111" fontWeight={700}>HCl</Text>
                    </group>
                )}
            </group>

            {/* THE POURING STREAM (Particles) */}
            {particles.map(p => (
                <mesh key={p.id} position={[p.pos.x, p.pos.y, p.pos.z]}>
                    <sphereGeometry args={[0.012, 6, 6]} />
                    <meshStandardMaterial color={liquidColor} transparent opacity={p.life} />
                </mesh>
            ))}
        </group>
    );
}
