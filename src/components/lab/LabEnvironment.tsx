import { Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

// Fluorescent ceiling fixture
function FluorescentFixture({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Housing */}
            <mesh>
                <boxGeometry args={[1.4, 0.06, 0.22]} />
                <meshStandardMaterial color="#c8c8c4" roughness={0.7} metalness={0.3} />
            </mesh>
            {/* Diffuser Panel — emissive glow */}
            <mesh position={[0, -0.04, 0]}>
                <boxGeometry args={[1.3, 0.01, 0.18]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#d8eeff"
                    emissiveIntensity={2.5}
                    roughness={0.5}
                />
            </mesh>
        </group>
    );
}

export default function LabEnvironment() {
    return (
        <>
            {/* === LIGHTING — Cool white fluorescent, 5500K === */}

            {/* Soft ambient fill — slightly warm so shadows aren't pure black */}
            <ambientLight intensity={0.35} color="#cce4ff" />

            {/* Main overhead key light — slightly forward to avoid flat look */}
            <directionalLight
                position={[0, 6, 2]}
                intensity={1.4}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.5}
                shadow-camera-far={25}
                shadow-camera-left={-4}
                shadow-camera-right={4}
                shadow-camera-top={4}
                shadow-camera-bottom={-4}
                color="#e8f0ff"
                shadow-bias={-0.001}
            />

            {/* Left fill — counteracts harsh shadows */}
            <pointLight position={[-3, 4, 1]} intensity={0.7} color="#ddeeff" distance={10} />
            {/* Right fill */}
            <pointLight position={[3, 4, 1]} intensity={0.7} color="#ddeeff" distance={10} />
            {/* Front bounce — simulates light bouncing off bench surface */}
            <pointLight position={[0, 0.5, 4]} intensity={0.3} color="#fffbe8" distance={6} />

            {/* Glass-quality environment map */}
            <Environment preset="warehouse" environmentIntensity={0.25} />

            {/* Soft contact shadow beneath equipment */}
            <ContactShadows
                resolution={1024}
                scale={5}
                blur={2}
                opacity={0.5}
                far={4}
                color="#111122"
                position={[0, -0.609, 0]}
            />

            {/* === ROOM === */}

            {/* Floor — medium gray vinyl tiles */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial color="#8a8a84" roughness={0.9} metalness={0.0} />
            </mesh>

            {/* Back wall — light gray (#d6d6d0) */}
            <mesh position={[0, 2.5, -5]} receiveShadow>
                <planeGeometry args={[20, 12]} />
                <meshStandardMaterial color="#d0d0ca" roughness={0.95} />
            </mesh>

            {/* Left side wall */}
            <mesh position={[-7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[14, 12]} />
                <meshStandardMaterial color="#cacac4" roughness={0.95} side={THREE.DoubleSide} />
            </mesh>

            {/* Ceiling — off-white */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
                <planeGeometry args={[20, 14]} />
                <meshStandardMaterial color="#eaeae6" roughness={1.0} />
            </mesh>

            {/* === CEILING FLUORESCENT FIXTURES === */}
            <FluorescentFixture position={[-2.5, 5.44, 0]} />
            <pointLight position={[-2.5, 5, 0]} intensity={1.5} color="#d8eeff" distance={8} />

            <FluorescentFixture position={[2.5, 5.44, 0]} />
            <pointLight position={[2.5, 5, 0]} intensity={1.5} color="#d8eeff" distance={8} />

            {/* === LAB BENCH — Natural oak wood with chemical-resistant clearcoat === */}
            {/* Main bench top — medium oak wood */}
            <mesh position={[0, -0.62, -0.5]} receiveShadow castShadow>
                <boxGeometry args={[5.5, 0.07, 2.4]} />
                <meshPhysicalMaterial
                    color="#8b5e3c"
                    roughness={0.55}
                    metalness={0.0}
                    clearcoat={0.45}
                    clearcoatRoughness={0.35}
                />
            </mesh>

            {/* Wood grain lines (light streaks) */}
            {[-1.5, -0.5, 0.4, 1.3, 2.1].map((z, i) => (
                <mesh key={i} position={[0, -0.584, z - 0.5]}>
                    <boxGeometry args={[5.4, 0.001, 0.008]} />
                    <meshStandardMaterial color="#6b4423" roughness={1} />
                </mesh>
            ))}

            {/* Bench front edge strip */}
            <mesh position={[0, -0.66, 0.7]} receiveShadow>
                <boxGeometry args={[5.5, 0.01, 0.08]} />
                <meshStandardMaterial color="#6b4423" roughness={0.6} />
            </mesh>

            {/* Front fascia panel */}
            <mesh position={[0, -1.1, 0.72]} receiveShadow>
                <boxGeometry args={[5.5, 0.9, 0.04]} />
                <meshStandardMaterial color="#d0cec8" roughness={0.85} />
            </mesh>

            {/* Bench base/legs */}
            {[-2.3, 2.3].map((x, i) => (
                <mesh key={i} position={[x, -1.6, -0.5]} receiveShadow>
                    <boxGeometry args={[0.07, 1.9, 2.35]} />
                    <meshStandardMaterial color="#b8b6b0" roughness={0.7} />
                </mesh>
            ))}

            {/* Under-bench cabinet back panel */}
            <mesh position={[0, -1.6, -1.72]} receiveShadow>
                <boxGeometry args={[5.5, 1.9, 0.04]} />
                <meshStandardMaterial color="#c4c2bc" roughness={0.9} />
            </mesh>

            {/* === RETORT STAND — rod to the RIGHT of flask, burette hangs over centre === */}
            {/*
                Real lab layout:
                - Flask at X=0, Z=-0.2 (centre of bench)
                - Stand rod at X=0.35, Z=-0.2 (beside and behind flask)
                - Horizontal clamp arm from X=0.35 → X=0 (over flask)
                - Burette tube at X=0 (directly above flask mouth)
            */}

            {/* Heavy BLACK METAL BASE — cast iron stand base */}
            <mesh position={[0.2, -0.59, -0.22]} castShadow receiveShadow>
                <boxGeometry args={[0.6, 0.025, 0.7]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.7} roughness={0.45} />
            </mesh>
            {/* Base ribs detail */}
            <mesh position={[0.2, -0.575, -0.22]}>
                <boxGeometry args={[0.55, 0.008, 0.01]} />
                <meshStandardMaterial color="#222222" roughness={0.8} />
            </mesh>

            {/* VERTICAL ROD — at X=0.35, clear of flask */}
            <mesh position={[0.35, 1.1, -0.2]} castShadow>
                <cylinderGeometry args={[0.011, 0.011, 3.4, 16]} />
                <meshStandardMaterial color="#cccccc" metalness={0.95} roughness={0.04} />
            </mesh>

            {/* ROD TOP CAP */}
            <mesh position={[0.35, 2.82, -0.2]}>
                <sphereGeometry args={[0.014, 12, 12]} />
                <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* CLAMP BOSS — block sliding on rod */}
            <mesh position={[0.35, 2.35, -0.2]} castShadow>
                <boxGeometry args={[0.04, 0.065, 0.04]} />
                <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.4} />
            </mesh>

            {/* Tightening screw on boss */}
            <mesh position={[0.35, 2.35, -0.178]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
                <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* STRAIGHT CLAMP ARM — rod at X=0.35 to burette at X=0, both at Z=-0.2 */}
            <mesh position={[0.175, 2.35, -0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.006, 0.006, 0.35, 10]} />
                <meshStandardMaterial color="#b8b8b8" metalness={0.9} roughness={0.15} />
            </mesh>

            {/* CLAMP RING — gripping burette at X=0, Z=-0.2 */}
            <mesh position={[0, 2.35, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.058, 0.009, 10, 32, Math.PI * 1.8]} />
                <meshStandardMaterial color="#aaaaaa" metalness={0.85} roughness={0.15} side={THREE.DoubleSide} />
            </mesh>

            {/* Clamp bolt */}
            <mesh position={[0, 2.35, -0.135]}>
                <boxGeometry args={[0.02, 0.014, 0.012]} />
                <meshStandardMaterial color="#777777" metalness={0.7} roughness={0.4} />
            </mesh>

            {/* === MAGNETIC STIRRER === */}
            <mesh position={[0, -0.572, -0.2]} castShadow receiveShadow>
                <boxGeometry args={[0.44, 0.078, 0.42]} />
                <meshPhysicalMaterial color="#1e1e22" roughness={0.35} metalness={0.1} clearcoat={0.3} />
            </mesh>
            {/* Ceramic top */}
            <mesh position={[0, -0.534, -0.2]}>
                <cylinderGeometry args={[0.18, 0.18, 0.01, 40]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.06} />
            </mesh>
            {/* LED indicator */}
            <mesh position={[-0.16, -0.531, 0.18]}>
                <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
                <meshStandardMaterial color="#00ff00" emissive="#00dd00" emissiveIntensity={3} />
            </mesh>
            {/* Knobs */}
            {[0.12, -0.12].map((x, i) => (
                <mesh key={i} position={[x, -0.532, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.022, 0.022, 0.013, 20]} />
                    <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
                </mesh>
            ))}

            {/* === BENCH REAGENTS — Titration essentials only === */}

            {/* ── BOTTLE 1: 0.1M NaOH — Amber borosilicate glass, GL45 blue PP cap ── */}
            {/* Body (slightly narrower at base realistic profile) */}
            <mesh position={[-1.5, -0.51, -0.6]} castShadow>
                <cylinderGeometry args={[0.054, 0.062, 0.25, 28]} />
                <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.50} opacity={1} ior={1.52} thickness={0.07} />
            </mesh>
            {/* Shoulder taper */}
            <mesh position={[-1.5, -0.372, -0.6]} castShadow>
                <cylinderGeometry args={[0.030, 0.052, 0.055, 22]} />
                <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.35} opacity={1} ior={1.52} thickness={0.05} />
            </mesh>
            {/* Neck */}
            <mesh position={[-1.5, -0.332, -0.6]} castShadow>
                <cylinderGeometry args={[0.026, 0.026, 0.03, 18]} />
                <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.3} ior={1.52} />
            </mesh>
            {/* GL45 Blue PP screw cap — ribbed outer rim */}
            <mesh position={[-1.5, -0.303, -0.6]} castShadow>
                <cylinderGeometry args={[0.032, 0.032, 0.032, 16]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.45} metalness={0.05} />
            </mesh>
            {/* Cap top disc */}
            <mesh position={[-1.5, -0.287, -0.6]}>
                <cylinderGeometry args={[0.032, 0.032, 0.005, 16]} />
                <meshStandardMaterial color="#1e40af" roughness={0.3} />
            </mesh>
            {/* White label background */}
            <mesh position={[-1.5, -0.515, -0.542]}>
                <planeGeometry args={[0.092, 0.14]} />
                <meshStandardMaterial color="#f9f9f9" roughness={0.92} />
            </mesh>
            {/* Compound name */}
            <Text position={[-1.5, -0.488, -0.539]} fontSize={0.022} color="#111111"
                anchorX="center" anchorY="middle" maxWidth={0.086} textAlign="center" fontWeight={700}>
                NaOH
            </Text>
            {/* Concentration */}
            <Text position={[-1.5, -0.52, -0.539]} fontSize={0.016} color="#222222"
                anchorX="center" anchorY="middle" maxWidth={0.086} textAlign="center">
                {`Sodium Hydroxide\n0.1 mol/L\n500 mL`}
            </Text>
            {/* GHS Corrosion pictogram box (red border) */}
            <mesh position={[-1.5, -0.572, -0.539]}>
                <planeGeometry args={[0.038, 0.038]} />
                <meshStandardMaterial color="#cc0000" roughness={0.9} />
            </mesh>
            <mesh position={[-1.5, -0.572, -0.538]}>
                <planeGeometry args={[0.030, 0.030]} />
                <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
            {/* DANGER text */}
            <Text position={[-1.5, -0.596, -0.538]} fontSize={0.013} color="#cc0000"
                anchorX="center" anchorY="middle" fontWeight={700}>
                ⚠ DANGER
            </Text>
            {/* Hazard statement */}
            <Text position={[-1.5, -0.614, -0.538]} fontSize={0.009} color="#333333"
                anchorX="center" anchorY="middle" maxWidth={0.085} textAlign="center">
                H314: Causes severe burns
            </Text>

            {/* ── BOTTLE 2: 0.1M HCl — Clear borosilicate glass, orange PP cap ── */}
            {/* NaOH in glass is unusual; HCl clear is standard */}
            <mesh position={[-1.5, -0.51, -0.15]} castShadow>
                <cylinderGeometry args={[0.050, 0.058, 0.25, 28]} />
                <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.82} opacity={1} ior={1.47} thickness={0.035} />
            </mesh>
            {/* HCl liquid — faint yellowish clear */}
            <mesh position={[-1.5, -0.565, -0.15]}>
                <cylinderGeometry args={[0.043, 0.050, 0.12, 22]} />
                <meshStandardMaterial color="#fffde7" transparent opacity={0.45} roughness={0.04} depthWrite={false} />
            </mesh>
            {/* Shoulder */}
            <mesh position={[-1.5, -0.372, -0.15]} castShadow>
                <cylinderGeometry args={[0.026, 0.048, 0.055, 22]} />
                <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.65} ior={1.47} />
            </mesh>
            {/* Neck */}
            <mesh position={[-1.5, -0.332, -0.15]} castShadow>
                <cylinderGeometry args={[0.023, 0.023, 0.03, 18]} />
                <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.5} ior={1.47} />
            </mesh>
            {/* Orange screw cap — acids convention */}
            <mesh position={[-1.5, -0.303, -0.15]} castShadow>
                <cylinderGeometry args={[0.028, 0.028, 0.030, 16]} />
                <meshStandardMaterial color="#ea580c" roughness={0.42} metalness={0.05} />
            </mesh>
            <mesh position={[-1.5, -0.288, -0.15]}>
                <cylinderGeometry args={[0.028, 0.028, 0.005, 16]} />
                <meshStandardMaterial color="#c2410c" roughness={0.3} />
            </mesh>
            {/* Label */}
            <mesh position={[-1.5, -0.515, -0.100]}>
                <planeGeometry args={[0.088, 0.14]} />
                <meshStandardMaterial color="#f9f9f9" roughness={0.92} />
            </mesh>
            <Text position={[-1.5, -0.488, -0.097]} fontSize={0.022} color="#111111"
                anchorX="center" anchorY="middle" maxWidth={0.082} textAlign="center" fontWeight={700}>
                HCl
            </Text>
            <Text position={[-1.5, -0.52, -0.097]} fontSize={0.016} color="#222222"
                anchorX="center" anchorY="middle" maxWidth={0.082} textAlign="center">
                {`Hydrochloric Acid\n0.1 mol/L\n500 mL`}
            </Text>
            {/* GHS diamond */}
            <mesh position={[-1.5, -0.572, -0.097]}>
                <planeGeometry args={[0.038, 0.038]} />
                <meshStandardMaterial color="#cc0000" roughness={0.9} />
            </mesh>
            <mesh position={[-1.5, -0.572, -0.096]}>
                <planeGeometry args={[0.030, 0.030]} />
                <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
            <Text position={[-1.5, -0.596, -0.096]} fontSize={0.013} color="#cc0000"
                anchorX="center" anchorY="middle" fontWeight={700}>
                ⚠ DANGER
            </Text>
            <Text position={[-1.5, -0.614, -0.096]} fontSize={0.009} color="#333333"
                anchorX="center" anchorY="middle" maxWidth={0.082} textAlign="center">
                H314 · H335 Corrosive
            </Text>

            {/* ── WASH BOTTLE — LDPE polyethylene, green screw top, nozzle tip ── */}
            {/* Squeezable LDPE body — slightly translucent green */}
            <mesh position={[-1.55, -0.495, 0.28]} castShadow>
                <cylinderGeometry args={[0.045, 0.055, 0.230, 22]} />
                <meshPhysicalMaterial color="#bbf7d0" roughness={0.55} transmission={0.38} opacity={1} ior={1.42} thickness={0.06} />
            </mesh>
            {/* Shoulder */}
            <mesh position={[-1.55, -0.365, 0.28]} castShadow>
                <cylinderGeometry args={[0.016, 0.040, 0.055, 14]} />
                <meshStandardMaterial color="#16a34a" roughness={0.5} />
            </mesh>
            {/* Green cap body */}
            <mesh position={[-1.55, -0.33, 0.28]} castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.022, 14]} />
                <meshStandardMaterial color="#15803d" roughness={0.45} />
            </mesh>
            {/* Nozzle spout */}
            <mesh position={[-1.55, -0.305, 0.28]} rotation={[0.4, 0, 0]} castShadow>
                <cylinderGeometry args={[0.005, 0.010, 0.060, 10]} />
                <meshStandardMaterial color="#14532d" roughness={0.4} />
            </mesh>
            {/* DI Water label */}
            <mesh position={[-1.55, -0.50, 0.327]}>
                <planeGeometry args={[0.075, 0.10]} />
                <meshStandardMaterial color="#f0fdf4" roughness={0.95} />
            </mesh>
            <Text position={[-1.55, -0.488, 0.330]} fontSize={0.020} color="#14532d"
                anchorX="center" anchorY="middle" maxWidth={0.070} textAlign="center" fontWeight={700}>
                {`DI\nWater`}
            </Text>
            <Text position={[-1.55, -0.528, 0.330]} fontSize={0.012} color="#166534"
                anchorX="center" anchorY="middle" maxWidth={0.070} textAlign="center">
                HPLC Grade
            </Text>
        </>
    );
}
