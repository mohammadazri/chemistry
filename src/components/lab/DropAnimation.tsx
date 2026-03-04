import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperimentStore } from '../../store/experimentStore';

// ── World positions ────────────────────────────────────────────────────────────
// Burette group Y=2.0, tip local Y = -(2.0/2) - 0.68 - 0.18 = -1.86 → world Y = 2.0-1.86 = 0.14
const TIP_X = 0;
const TIP_Z = -0.2;
const TIP_Y = 0.14;           // burette nozzle bottom — ABOVE flask

const BURST_DURATION = 1.6;   // seconds of flow per click
const DROP_INTERVAL = 0.30;   // seconds between drops

interface FallingDrop { id: number; t: number; size: number; }
interface SplashRing { id: number; progress: number; }
let _id = 0;

export default function DropAnimation() {
    const volumeAdded = useExperimentStore((s) => s.volumeAdded);
    const flaskVolume = useExperimentStore((s) => s.flaskVolume) || 25.0;
    const prevVol = useRef(0);

    // EXACT Match with FlaskModel:
    // Flask group is at Y=-0.33. Local beaker bottom is -0.40/2 + 0.006 = -0.194.
    // Absolute world bottom = -0.524. 
    const currentVol = flaskVolume + volumeAdded;
    const targetTotalHeight = (currentVol / 300) * 0.40;
    // The splash should be exactly AT the liquid surface.
    const currentFlaskY = -0.524 + targetTotalHeight;
    const currentTravel = currentFlaskY - TIP_Y;

    const flowTimer = useRef(0);
    const formProg = useRef(0);  // growing drop at tip: 0→1
    const dropTimer = useRef(0);
    const falling = useRef<FallingDrop[]>([]);
    const splashes = useRef<SplashRing[]>([]);

    const [, tick] = useState(0);

    // Trigger burst on volume change or reset
    useEffect(() => {
        if (volumeAdded === 0 && prevVol.current > 0) {
            // ── RESET detected: clear all animation state ─────────────────
            flowTimer.current = 0;
            formProg.current = 0;
            dropTimer.current = DROP_INTERVAL;
            falling.current = [];
            splashes.current = [];
            prevVol.current = 0;
        } else if (volumeAdded > prevVol.current) {
            // ── Volume added: trigger a new burst ────────────────────────
            flowTimer.current = BURST_DURATION;
            dropTimer.current = 0; // spawn first drop immediately
            prevVol.current = volumeAdded;
        }
    }, [volumeAdded]);

    useFrame((_, dt) => {
        const flowing = flowTimer.current > 0;

        if (flowing) flowTimer.current = Math.max(0, flowTimer.current - dt);

        // ── Forming drop at nozzle: grows while flowing, shrinks when not ──────
        formProg.current = flowing
            ? Math.min(1, formProg.current + dt * 2.5)
            : Math.max(0, formProg.current - dt * 5);

        // ── Spawn falling drops ───────────────────────────────────────────────
        if (flowing) {
            dropTimer.current -= dt;
            if (dropTimer.current <= 0) {
                dropTimer.current = DROP_INTERVAL;
                falling.current.push({ id: _id++, t: 0, size: 0.007 + Math.random() * 0.004 });
            }
        }

        // ── Advance drops (quadratic gravity: distance = ½at²) ────────────────
        falling.current = falling.current.filter((d) => {
            d.t += dt * (0.8 + d.t * 3.2);
            if (d.t >= 1) {
                splashes.current.push({ id: _id++, progress: 0 });
                return false;
            }
            return true;
        });
        if (falling.current.length > 10) falling.current = falling.current.slice(-10);

        // ── Advance splash rings ──────────────────────────────────────────────
        splashes.current = splashes.current.filter((r) => {
            r.progress += dt * 4;
            return r.progress < 1;
        });

        tick((n) => n + 1);
    });

    const flowing = flowTimer.current > 0;
    const color = '#b8d8f0';  // NaOH: near-clear pale blue

    // Stream hangs down from tip
    const streamLen = flowing
        ? Math.min(0.12, (BURST_DURATION - flowTimer.current < 0.1 ? 0.02 : 0.10))
        : 0;

    return (
        <group>
            {/* ── Hanging stream from nozzle tip ─────────────────────────── */}
            {streamLen > 0.005 && (
                <mesh position={[TIP_X, TIP_Y - streamLen / 2, TIP_Z]}>
                    {/* Tapers from thin at top to slightly thicker at break point */}
                    <cylinderGeometry args={[0.0016, 0.0028, streamLen, 6]} />
                    <meshPhysicalMaterial
                        color={color} transparent opacity={0.72}
                        roughness={0} clearcoat={1} ior={1.33} depthWrite={false}
                    />
                </mesh>
            )}

            {/* ── Forming drop swelling at tip ────────────────────────────── */}
            {formProg.current > 0.02 && (
                <mesh
                    position={[TIP_X, TIP_Y - streamLen - formProg.current * 0.022, TIP_Z]}
                    scale={[1, 1 + formProg.current * 0.6, 1]}
                >
                    <sphereGeometry args={[0.005 + formProg.current * 0.008, 12, 12]} />
                    <meshPhysicalMaterial
                        color={color} transparent opacity={0.88}
                        roughness={0} clearcoat={1} ior={1.33} depthWrite={false}
                    />
                </mesh>
            )}

            {/* ── Falling drops (tear-drop shaped, gravity-accelerated) ───── */}
            {falling.current.map((d) => {
                const eased = d.t * d.t;                     // quadratic: slow→fast
                const worldY = TIP_Y + eased * currentTravel;        // falls downward
                const scaleY = 1 + d.t * 1.4;                 // elongates in free fall
                const alpha = d.t > 0.8 ? (1 - d.t) / 0.2 : 0.85;
                return (
                    <mesh key={d.id} position={[TIP_X, worldY, TIP_Z]} scale={[1, scaleY, 1]}>
                        <sphereGeometry args={[d.size, 10, 10]} />
                        <meshPhysicalMaterial
                            color={color} transparent opacity={alpha}
                            roughness={0} clearcoat={1} ior={1.33} depthWrite={false}
                        />
                    </mesh>
                );
            })}

            {/* ── Splash ripple rings at liquid surface ──────────────────────── */}
            {splashes.current.map((r) => (
                <mesh
                    key={r.id}
                    position={[TIP_X, currentFlaskY + 0.002, TIP_Z]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <torusGeometry args={[0.01 + r.progress * 0.06, 0.0018, 6, 20]} />
                    <meshBasicMaterial
                        color={color} transparent opacity={(1 - r.progress) * 0.55}
                    />
                </mesh>
            ))}
        </group>
    );
}
