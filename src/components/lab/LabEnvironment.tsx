import { Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useExperimentStore } from '../../store/experimentStore';
import AnalogClock from './AnalogClock';
import PeriodicTablePoster from './PeriodicTablePoster';
import SideDesk from './SideDesk';

// Checkered vinyl floor tiles — classic chemistry lab look
function CheckeredFloor() {
    const tileSize = 1.0;
    const gridCount = 15; // 15x15 tiles
    const tiles = [];
    for (let x = -Math.floor(gridCount / 2); x <= Math.floor(gridCount / 2); x++) {
        for (let z = -Math.floor(gridCount / 2); z <= Math.floor(gridCount / 2); z++) {
            const isLight = (x + z) % 2 === 0;
            tiles.push(
                <mesh
                    key={`${x}-${z}`}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[x * tileSize, -3.001, z * tileSize]}
                    receiveShadow
                >
                    <planeGeometry args={[tileSize, tileSize]} />
                    <meshStandardMaterial
                        color={isLight ? '#b8b8b2' : '#8a8a84'}
                        roughness={0.75}
                        metalness={0.02}
                    />
                </mesh>
            );
        }
    }
    return <>{tiles}</>;
}

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
    const labStage = useExperimentStore((state) => state.labStage);
    const showNaOHBottle = labStage !== 'fill-burette';
    const showHClBottle = labStage !== 'fill-flask';

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

            {/* Floor — checkered vinyl tiles */}
            <CheckeredFloor />

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

            {/* Right side wall */}
            <mesh position={[7, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[14, 12]} />
                <meshStandardMaterial color="#cacac4" roughness={0.95} side={THREE.DoubleSide} />
            </mesh>


            {/* === BASEBOARD TRIM === */}
            {/* Back wall baseboard */}
            <mesh position={[0, -2.9, -4.97]}>
                <boxGeometry args={[20, 0.15, 0.04]} />
                <meshStandardMaterial color="#a0a098" roughness={0.7} />
            </mesh>
            {/* Left wall baseboard */}
            <mesh position={[-6.97, -2.9, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[14, 0.15, 0.04]} />
                <meshStandardMaterial color="#a0a098" roughness={0.7} />
            </mesh>
            {/* Right wall baseboard */}
            <mesh position={[6.97, -2.9, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <boxGeometry args={[14, 0.15, 0.04]} />
                <meshStandardMaterial color="#a0a098" roughness={0.7} />
            </mesh>

            {/* === WALL DECORATIONS === */}

            {/* Safety poster — left wall */}
            <group position={[-6.94, 1.5, -1.5]} rotation={[0, Math.PI / 2, 0]}>
                {/* White poster board */}
                <mesh>
                    <planeGeometry args={[1.0, 1.4]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.92} />
                </mesh>
                {/* Thin border */}
                <mesh position={[0, 0, -0.001]}>
                    <planeGeometry args={[1.06, 1.46]} />
                    <meshStandardMaterial color="#333333" roughness={0.9} />
                </mesh>

                {/* Red header bar */}
                <mesh position={[0, 0.56, 0.001]}>
                    <planeGeometry args={[1.0, 0.26]} />
                    <meshStandardMaterial color="#cc0000" roughness={0.85} />
                </mesh>
                <Text position={[0, 0.56, 0.003]} fontSize={0.09} color="#ffffff"
                    anchorX="center" anchorY="middle" fontWeight={700}>
                    SAFETY FIRST
                </Text>

                {/* Section 1 — Goggles */}
                <mesh position={[-0.35, 0.30, 0.001]}>
                    <circleGeometry args={[0.06, 20]} />
                    <meshStandardMaterial color="#2563eb" />
                </mesh>
                <Text position={[-0.35, 0.30, 0.003]} fontSize={0.05} color="#ffffff"
                    anchorX="center" anchorY="middle" fontWeight={700}>G</Text>
                <Text position={[0.05, 0.32, 0.002]} fontSize={0.045} color="#1a1a1a"
                    anchorX="left" anchorY="middle" fontWeight={700}>
                    Wear safety goggles
                </Text>
                <Text position={[0.05, 0.26, 0.002]} fontSize={0.035} color="#555555"
                    anchorX="left" anchorY="middle">
                    at all times
                </Text>

                {/* Divider line */}
                <mesh position={[0, 0.19, 0.001]}>
                    <planeGeometry args={[0.85, 0.003]} />
                    <meshStandardMaterial color="#dddddd" />
                </mesh>

                {/* Section 2 — No food */}
                <mesh position={[-0.35, 0.08, 0.001]}>
                    <circleGeometry args={[0.06, 20]} />
                    <meshStandardMaterial color="#dc2626" />
                </mesh>
                <Text position={[-0.35, 0.08, 0.003]} fontSize={0.05} color="#ffffff"
                    anchorX="center" anchorY="middle" fontWeight={700}>X</Text>
                <Text position={[0.05, 0.10, 0.002]} fontSize={0.045} color="#1a1a1a"
                    anchorX="left" anchorY="middle" fontWeight={700}>
                    No food or drinks
                </Text>
                <Text position={[0.05, 0.04, 0.002]} fontSize={0.035} color="#555555"
                    anchorX="left" anchorY="middle">
                    in the laboratory
                </Text>

                {/* Divider line */}
                <mesh position={[0, -0.03, 0.001]}>
                    <planeGeometry args={[0.85, 0.003]} />
                    <meshStandardMaterial color="#dddddd" />
                </mesh>

                {/* Section 3 — Spills */}
                <mesh position={[-0.35, -0.14, 0.001]}>
                    <circleGeometry args={[0.06, 20]} />
                    <meshStandardMaterial color="#f59e0b" />
                </mesh>
                <Text position={[-0.35, -0.14, 0.003]} fontSize={0.05} color="#ffffff"
                    anchorX="center" anchorY="middle" fontWeight={700}>!</Text>
                <Text position={[0.05, -0.12, 0.002]} fontSize={0.045} color="#1a1a1a"
                    anchorX="left" anchorY="middle" fontWeight={700}>
                    Report all spills
                </Text>
                <Text position={[0.05, -0.18, 0.002]} fontSize={0.035} color="#555555"
                    anchorX="left" anchorY="middle">
                    immediately
                </Text>

                {/* Bottom danger bar */}
                <mesh position={[0, -0.58, 0.001]}>
                    <planeGeometry args={[1.0, 0.12]} />
                    <meshStandardMaterial color="#cc0000" roughness={0.85} />
                </mesh>
                <Text position={[0, -0.58, 0.003]} fontSize={0.04} color="#ffffff"
                    anchorX="center" anchorY="middle" fontWeight={700}>
                    CHEMICAL LABORATORY — AUTHORIZED PERSONNEL ONLY
                </Text>
            </group>

            {/* Periodic Table poster — back wall (realistic with real elements) */}
            {/* Periodic Table poster — back wall (realistic with real elements) */}
            <PeriodicTablePoster position={[-4.0, 3.5, -4.96]} />

            {/* Emergency Shower Sign — back wall top */}
            <group position={[4, 4.0, -4.96]}>
                <mesh>
                    <planeGeometry args={[0.9, 0.35]} />
                    <meshStandardMaterial color="#15803d" roughness={0.8} />
                </mesh>
                <Text position={[0, 0, 0.003]} fontSize={0.06} color="#ffffff" anchorX="center" anchorY="middle" fontWeight={700}>
                    🚿 EMERGENCY SHOWER
                </Text>
            </group>

            {/* === ANALOG CLOCK — back wall, upper right === */}
            <AnalogClock position={[5.5, 3.2, -4.93]} />

            {/* === SIDE DESK WITH LAB APPARATUS — right wall === */}
            {/* Countertop at Y=-0.62 (same as main bench), cabinet drops to floor (Y=-3) */}
            <SideDesk position={[5.8, -0.62, -1.0]} mirror />

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
            {showNaOHBottle && (
                <group>
                    {/* ── BOTTLE 1: 0.1M NaOH — Amber borosilicate glass, GL45 blue PP cap ── */}
                    {/* Body (radius: 0.054 -> 0.08, height: 0.25 -> 0.35) */}
                    <mesh position={[-1.5, -0.41, -0.6]} castShadow>
                        <cylinderGeometry args={[0.078, 0.085, 0.35, 28]} />
                        <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.50} opacity={1} ior={1.52} thickness={0.07} />
                    </mesh>
                    {/* Shoulder taper */}
                    <mesh position={[-1.5, -0.205, -0.6]} castShadow>
                        <cylinderGeometry args={[0.035, 0.075, 0.065, 22]} />
                        <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.35} opacity={1} ior={1.52} thickness={0.05} />
                    </mesh>
                    {/* Neck */}
                    <mesh position={[-1.5, -0.155, -0.6]} castShadow>
                        <cylinderGeometry args={[0.03, 0.03, 0.045, 18]} />
                        <meshPhysicalMaterial color="#b87400" roughness={0.12} transmission={0.3} ior={1.52} />
                    </mesh>
                    {/* GL45 Blue PP screw cap */}
                    <mesh position={[-1.5, -0.12, -0.6]} castShadow>
                        <cylinderGeometry args={[0.042, 0.042, 0.04, 16]} />
                        <meshStandardMaterial color="#1d4ed8" roughness={0.45} metalness={0.05} />
                    </mesh>
                    {/* Cap top disc */}
                    <mesh position={[-1.5, -0.10, -0.6]}>
                        <cylinderGeometry args={[0.042, 0.042, 0.005, 16]} />
                        <meshStandardMaterial color="#1e40af" roughness={0.3} />
                    </mesh>
                    {/* White label background */}
                    <mesh position={[-1.5, -0.415, -0.512]}>
                        <planeGeometry args={[0.13, 0.2]} />
                        <meshStandardMaterial color="#f9f9f9" roughness={0.92} />
                    </mesh>
                    {/* Compound name */}
                    <Text position={[-1.5, -0.38, -0.509]} fontSize={0.04} color="#111"
                        anchorX="center" anchorY="middle" maxWidth={0.12} textAlign="center" fontWeight={700}>
                        NaOH
                    </Text>
                    {/* Concentration */}
                    <Text position={[-1.5, -0.43, -0.509]} fontSize={0.022} color="#222"
                        anchorX="center" anchorY="middle" maxWidth={0.12} textAlign="center">
                        {`Sodium Hydroxide\n0.1 mol/L\n500 mL`}
                    </Text>
                    {/* DANGER text */}
                    <Text position={[-1.5, -0.51, -0.509]} fontSize={0.016} color="#cc0000"
                        anchorX="center" anchorY="middle" fontWeight={700}>
                        ⚠ DANGER
                    </Text>
                </group>
            )}

            {/* ── BOTTLE 2: 0.1M HCl — Clear borosilicate glass, orange PP cap ── */}
            {showHClBottle && (
                <group>
                    {/* Body */}
                    <mesh position={[-1.5, -0.41, -0.15]} castShadow>
                        <cylinderGeometry args={[0.07, 0.08, 0.35, 28]} />
                        <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.82} opacity={1} ior={1.47} thickness={0.035} />
                    </mesh>
                    {/* HCl liquid */}
                    <mesh position={[-1.5, -0.485, -0.15]}>
                        <cylinderGeometry args={[0.062, 0.07, 0.20, 22]} />
                        <meshStandardMaterial color="#fffde7" transparent opacity={0.45} roughness={0.04} depthWrite={false} />
                    </mesh>
                    {/* Shoulder */}
                    <mesh position={[-1.5, -0.205, -0.15]} castShadow>
                        <cylinderGeometry args={[0.032, 0.068, 0.065, 22]} />
                        <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.65} ior={1.47} />
                    </mesh>
                    {/* Neck */}
                    <mesh position={[-1.5, -0.155, -0.15]} castShadow>
                        <cylinderGeometry args={[0.03, 0.03, 0.045, 18]} />
                        <meshPhysicalMaterial color="#e8f4ff" roughness={0.06} transmission={0.5} ior={1.47} />
                    </mesh>
                    {/* Orange screw cap */}
                    <mesh position={[-1.5, -0.12, -0.15]} castShadow>
                        <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
                        <meshStandardMaterial color="#ea580c" roughness={0.42} metalness={0.05} />
                    </mesh>
                    <mesh position={[-1.5, -0.10, -0.15]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.005, 16]} />
                        <meshStandardMaterial color="#c2410c" roughness={0.3} />
                    </mesh>
                    {/* White label background */}
                    <mesh position={[-1.5, -0.415, -0.067]}>
                        <planeGeometry args={[0.13, 0.2]} />
                        <meshStandardMaterial color="#f9f9f9" roughness={0.92} />
                    </mesh>
                    {/* Compound name */}
                    <Text position={[-1.5, -0.38, -0.064]} fontSize={0.04} color="#111"
                        anchorX="center" anchorY="middle" maxWidth={0.12} textAlign="center" fontWeight={700}>
                        HCl
                    </Text>
                    <Text position={[-1.5, -0.43, -0.064]} fontSize={0.022} color="#222"
                        anchorX="center" anchorY="middle" maxWidth={0.12} textAlign="center">
                        {`Hydrochloric Acid\n0.1 mol/L\n500 mL`}
                    </Text>
                    {/* DANGER text */}
                    <Text position={[-1.5, -0.51, -0.064]} fontSize={0.016} color="#cc0000"
                        anchorX="center" anchorY="middle" fontWeight={700}>
                        ⚠ DANGER
                    </Text>
                </group>
            )}

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
