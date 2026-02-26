import { Environment, ContactShadows } from '@react-three/drei';
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

            {/* === LAB BENCH — Dark black epoxy resin (industry standard) === */}
            {/* Main bench top — epoxy resin = dark, smooth, slight sheen */}
            <mesh position={[0, -0.62, -0.5]} receiveShadow castShadow>
                <boxGeometry args={[5.5, 0.07, 2.4]} />
                <meshPhysicalMaterial
                    color="#1c1c1c"
                    roughness={0.25}
                    metalness={0.05}
                    clearcoat={0.6}
                    clearcoatRoughness={0.2}
                />
            </mesh>

            {/* Bench front edge strip (slightly lighter for definition) */}
            <mesh position={[0, -0.66, 0.7]} receiveShadow>
                <boxGeometry args={[5.5, 0.01, 0.08]} />
                <meshStandardMaterial color="#2e2e2e" roughness={0.3} />
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

            {/* === RETORT STAND — properly holding the burette === */}
            {/*
                Key positions:
                - Burette tube is at X=0, Z=0
                - Stand rod is at X=0, Z=-0.12 (directly behind burette)
                - Bench top at Y=-0.62
                - Burette top is at Y=2.2 (group 1.2 + tube 1.0)
                - Clamp grips burette at Y=1.8 (upper third of burette)
            */}

            {/* Heavy cast iron BASE — larger to serve as proper stand foundation */}
            <mesh position={[0, -0.59, -0.22]} castShadow receiveShadow>
                <boxGeometry args={[0.6, 0.025, 0.7]} />
                <meshStandardMaterial color="#111111" metalness={0.85} roughness={0.35} />
            </mesh>
            {/* Base weight ribs for detail */}
            <mesh position={[0, -0.575, -0.22]}>
                <boxGeometry args={[0.4, 0.01, 0.01]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.5} />
            </mesh>

            {/* VERTICAL ROD — right behind the burette tube */}
            <mesh position={[0, 1.1, -0.12]} castShadow>
                <cylinderGeometry args={[0.011, 0.011, 3.4, 16]} />
                <meshStandardMaterial color="#cccccc" metalness={0.95} roughness={0.04} />
            </mesh>

            {/* ROD TOP CAP */}
            <mesh position={[0, 2.82, -0.12]}>
                <sphereGeometry args={[0.014, 12, 12]} />
                <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* CLAMP BODY — the block that slides on the rod and extends to burette */}
            {/* Boss clamped onto rod */}
            <mesh position={[0, 1.85, -0.12]} castShadow>
                <boxGeometry args={[0.04, 0.06, 0.04]} />
                <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.4} />
            </mesh>

            {/* Tightening screw on boss */}
            <mesh position={[0.025, 1.85, -0.12]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.03, 8]} />
                <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Horizontal arm from rod (Z=-0.12) to burette (Z=0) */}
            {/* Length = 0.12, center at Z=-0.06 */}
            <mesh position={[0, 1.85, -0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.006, 0.006, 0.12, 10]} />
                <meshStandardMaterial color="#b8b8b8" metalness={0.9} roughness={0.15} />
            </mesh>

            {/* CLAMP RING — U-shaped collar gripping the burette tube at Z=0 */}
            {/* Full torus ring around the burette */}
            <mesh position={[0, 1.85, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.058, 0.009, 10, 32, Math.PI * 1.8]} />
                <meshStandardMaterial color="#aaaaaa" metalness={0.85} roughness={0.15} side={THREE.DoubleSide} />
            </mesh>

            {/* Clamp tightening bolt at front of ring */}
            <mesh position={[0, 1.85, 0.065]}>
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

            {/* === BACKGROUND LAB DRESSING === */}

            {/* Wash bottle */}
            <mesh position={[-1.6, -0.485, -0.75]} castShadow>
                <cylinderGeometry args={[0.065, 0.085, 0.28, 28]} />
                <meshPhysicalMaterial color="#c8e6c9" roughness={0.1} transmission={0.65} opacity={1} ior={1.45} thickness={0.05} />
            </mesh>
            <mesh position={[-1.6, -0.33, -0.75]} castShadow>
                <cylinderGeometry args={[0.02, 0.05, 0.085, 14]} />
                <meshStandardMaterial color="#a5d6a7" roughness={0.4} />
            </mesh>

            {/* Beaker */}
            <mesh position={[1.7, -0.521, -0.7]} castShadow>
                <cylinderGeometry args={[0.085, 0.075, 0.22, 32, 1, true]} />
                <meshPhysicalMaterial transparent={true} transmission={0.92} roughness={0} ior={1.47} thickness={0.02} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[1.7, -0.634, -0.7]}>
                <cylinderGeometry args={[0.075, 0.075, 0.01, 32]} />
                <meshPhysicalMaterial transparent={true} transmission={0.92} roughness={0} />
            </mesh>
            {/* Beaker liquid inside */}
            <mesh position={[1.7, -0.56, -0.7]}>
                <cylinderGeometry args={[0.07, 0.07, 0.08, 32]} />
                <meshStandardMaterial color="#bbdefb" transparent={true} opacity={0.7} roughness={0.1} depthWrite={false} />
            </mesh>

            {/* Lab notebook */}
            <mesh position={[-2.0, -0.602, 0.1]} rotation={[0, 0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.32, 0.01, 0.24]} />
                <meshStandardMaterial color="#1565c0" roughness={0.92} />
            </mesh>
            <mesh position={[-2.0, -0.591, 0.1]} rotation={[0, 0.2, 0]}>
                <boxGeometry args={[0.28, 0.005, 0.2]} />
                <meshStandardMaterial color="#f5f5f5" roughness={0.92} />
            </mesh>

            {/* Chemical reagent bottle */}
            <mesh position={[2.1, -0.5, -0.7]} castShadow>
                <cylinderGeometry args={[0.045, 0.055, 0.24, 20]} />
                <meshPhysicalMaterial color="#ffe0b2" roughness={0.15} transmission={0.5} opacity={1} ior={1.4} thickness={0.04} />
            </mesh>
            <mesh position={[2.1, -0.365, -0.7]} castShadow>
                <cylinderGeometry args={[0.025, 0.04, 0.06, 16]} />
                <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.2} />
            </mesh>

            {/* Safety label on bottle */}
            <mesh position={[2.1, -0.5, -0.655]} rotation={[0, 0, 0]}>
                <planeGeometry args={[0.07, 0.1]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
        </>
    );
}
