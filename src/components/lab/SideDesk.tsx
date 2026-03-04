import * as THREE from 'three';

/**
 * Realistic laboratory bench with enhanced detailing:
 * - Dark epoxy countertop with front lip
 * - Light gray steel body with blue doors/drawers
 * - Overhead reagent shelving
 * - Detailed lab apparatus with graduated markings, rims, bottoms, stoppers
 */

/** Detailed beaker with bottom plate, rim, and graduation lines */
function Beaker({ position, color = '#4dc9f6', scale = 1 }: {
    position: [number, number, number]; color?: string; scale?: number;
}) {
    const h = 0.35 * scale, r = 0.10 * scale;
    return (
        <group position={position}>
            {/* Glass wall */}
            <mesh>
                <cylinderGeometry args={[r, r * 0.95, h, 20, 1, true]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.18}
                    roughness={0.03} transmission={0.82} ior={1.52} side={THREE.DoubleSide} />
            </mesh>
            {/* Bottom plate */}
            <mesh position={[0, -h / 2 + 0.003, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[r * 0.95, 20]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.12}
                    roughness={0.03} transmission={0.85} />
            </mesh>
            {/* Liquid */}
            <mesh position={[0, -h * 0.15, 0]}>
                <cylinderGeometry args={[r * 0.92, r * 0.88, h * 0.55, 20]} />
                <meshPhysicalMaterial color={color} transparent opacity={0.55}
                    roughness={0.08} transmission={0.4} />
            </mesh>
            {/* Liquid surface meniscus */}
            <mesh position={[0, h * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[r * 0.92, 20]} />
                <meshPhysicalMaterial color={color} transparent opacity={0.35}
                    roughness={0.02} transmission={0.5} />
            </mesh>
            {/* Pouring spout (small notch at top) */}
            <mesh position={[r * 0.85, h / 2 + 0.008, 0]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[0.015 * scale, 0.02 * scale, 0.025 * scale]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2}
                    roughness={0.03} transmission={0.8} />
            </mesh>
            {/* Graduation marks — white lines */}
            {[0.2, 0.35, 0.5, 0.65, 0.8].map((frac, i) => (
                <mesh key={i} position={[r * 0.97, -h / 2 + h * frac, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.001, 0.012 * scale, 0.015 * scale]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
}

/** Erlenmeyer flask with stopper option */
function Flask({ position, color = '#7bf590', withStopper = false }: {
    position: [number, number, number]; color?: string; withStopper?: boolean;
}) {
    return (
        <group position={position}>
            {/* Conical body */}
            <mesh>
                <cylinderGeometry args={[0.035, 0.12, 0.30, 20]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.16}
                    roughness={0.03} transmission={0.84} ior={1.52} side={THREE.DoubleSide} />
            </mesh>
            {/* Neck */}
            <mesh position={[0, 0.19, 0]}>
                <cylinderGeometry args={[0.03, 0.035, 0.10, 16]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.16}
                    roughness={0.03} transmission={0.84} side={THREE.DoubleSide} />
            </mesh>
            {/* Rim */}
            <mesh position={[0, 0.24, 0]}>
                <torusGeometry args={[0.031, 0.003, 8, 16]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.25}
                    roughness={0.03} transmission={0.7} />
            </mesh>
            {/* Liquid */}
            <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.05, 0.11, 0.18, 20]} />
                <meshPhysicalMaterial color={color} transparent opacity={0.5}
                    roughness={0.08} transmission={0.4} />
            </mesh>
            {/* Bottom — thick glass base */}
            <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.12, 20]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.15}
                    roughness={0.03} transmission={0.8} />
            </mesh>
            {/* Rubber stopper */}
            {withStopper && (
                <mesh position={[0, 0.26, 0]}>
                    <cylinderGeometry args={[0.020, 0.028, 0.04, 12]} />
                    <meshStandardMaterial color="#8b0000" roughness={0.85} />
                </mesh>
            )}
        </group>
    );
}

/** Test tube rack with rubber stoppers and rounded bottoms */
function TestTubeRack({ position }: { position: [number, number, number] }) {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#dda0dd', '#ffa07a'];
    return (
        <group position={position}>
            {/* Base platform */}
            <mesh>
                <boxGeometry args={[0.50, 0.035, 0.10]} />
                <meshStandardMaterial color="#6b4226" roughness={0.75} />
            </mesh>
            {/* Base edge trim */}
            <mesh position={[0, -0.018, 0.048]}>
                <boxGeometry args={[0.50, 0.035, 0.005]} />
                <meshStandardMaterial color="#5a3520" roughness={0.8} />
            </mesh>
            {/* Back support board */}
            <mesh position={[0, 0.12, -0.04]}>
                <boxGeometry args={[0.50, 0.24, 0.016]} />
                <meshStandardMaterial color="#6b4226" roughness={0.75} />
            </mesh>
            {/* Top holder bar with holes */}
            <mesh position={[0, 0.24, 0.01]}>
                <boxGeometry args={[0.50, 0.016, 0.08]} />
                <meshStandardMaterial color="#6b4226" roughness={0.75} />
            </mesh>
            {/* Test tubes */}
            {colors.map((c, i) => (
                <group key={i} position={[-0.19 + i * 0.076, 0.12, 0.01]}>
                    {/* Glass tube */}
                    <mesh>
                        <cylinderGeometry args={[0.014, 0.014, 0.24, 10, 1, true]} />
                        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.18}
                            roughness={0.03} transmission={0.82} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Rounded bottom */}
                    <mesh position={[0, -0.12, 0]}>
                        <sphereGeometry args={[0.014, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.18}
                            roughness={0.03} transmission={0.82} />
                    </mesh>
                    {/* Liquid */}
                    <mesh position={[0, -0.02, 0]}>
                        <cylinderGeometry args={[0.011, 0.011, 0.16, 10]} />
                        <meshPhysicalMaterial color={c} transparent opacity={0.55}
                            roughness={0.08} transmission={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/** Wash bottle with bent nozzle */
function WashBottle({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Body */}
            <mesh>
                <cylinderGeometry args={[0.05, 0.06, 0.24, 16]} />
                <meshPhysicalMaterial color="#e8e8ff" transparent opacity={0.28}
                    roughness={0.05} transmission={0.65} side={THREE.DoubleSide} />
            </mesh>
            {/* Water */}
            <mesh position={[0, -0.03, 0]}>
                <cylinderGeometry args={[0.045, 0.055, 0.15, 16]} />
                <meshPhysicalMaterial color="#a8d8ff" transparent opacity={0.4}
                    roughness={0.08} transmission={0.5} />
            </mesh>
            {/* Cap */}
            <mesh position={[0, 0.14, 0]}>
                <cylinderGeometry args={[0.025, 0.03, 0.035, 10]} />
                <meshStandardMaterial color="#1976d2" roughness={0.55} />
            </mesh>
            {/* Straw tube inside */}
            <mesh position={[0, 0.0, 0]}>
                <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
                <meshStandardMaterial color="#1976d2" roughness={0.6} />
            </mesh>
            {/* Spout — bent nozzle */}
            <mesh position={[0.01, 0.18, 0]} rotation={[0.25, 0, -0.15]}>
                <cylinderGeometry args={[0.005, 0.005, 0.10, 6]} />
                <meshStandardMaterial color="#1976d2" roughness={0.55} />
            </mesh>
            <mesh position={[0.03, 0.24, 0]} rotation={[0.6, 0, -0.3]}>
                <cylinderGeometry args={[0.004, 0.005, 0.06, 6]} />
                <meshStandardMaterial color="#1976d2" roughness={0.55} />
            </mesh>
        </group>
    );
}

/** Bunsen burner */
function BunsenBurner({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Heavy base */}
            <mesh position={[0, 0.01, 0]}>
                <cylinderGeometry args={[0.06, 0.065, 0.02, 16]} />
                <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Barrel */}
            <mesh position={[0, 0.10, 0]}>
                <cylinderGeometry args={[0.018, 0.022, 0.18, 12]} />
                <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Air hole collar */}
            <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.025, 12]} />
                <meshStandardMaterial color="#666" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Gas inlet tube */}
            <mesh position={[0.03, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.006, 0.006, 0.06, 8]} />
                <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
            </mesh>
        </group>
    );
}

/** Mortar and pestle */
function MortarPestle({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Mortar bowl */}
            <mesh>
                <cylinderGeometry args={[0.07, 0.055, 0.06, 16, 1, true]} />
                <meshStandardMaterial color="#e8e0d0" roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
            {/* Mortar base */}
            <mesh position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.055, 16]} />
                <meshStandardMaterial color="#d8d0c0" roughness={0.85} />
            </mesh>
            {/* Pestle */}
            <mesh position={[0.02, 0.06, 0.01]} rotation={[0.3, 0.2, 0.5]}>
                <cylinderGeometry args={[0.008, 0.018, 0.14, 8]} />
                <meshStandardMaterial color="#d8d0c0" roughness={0.8} />
            </mesh>
        </group>
    );
}

/** Graduated cylinder */
function GraduatedCylinder({ position, color = '#88ccff' }: {
    position: [number, number, number]; color?: string;
}) {
    return (
        <group position={position}>
            {/* Glass body — tall and narrow */}
            <mesh>
                <cylinderGeometry args={[0.025, 0.035, 0.35, 16, 1, true]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.16}
                    roughness={0.03} transmission={0.84} ior={1.52} side={THREE.DoubleSide} />
            </mesh>
            {/* Bottom */}
            <mesh position={[0, -0.175, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.035, 16]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.12}
                    roughness={0.03} transmission={0.85} />
            </mesh>
            {/* Liquid */}
            <mesh position={[0, -0.04, 0]}>
                <cylinderGeometry args={[0.022, 0.032, 0.24, 16]} />
                <meshPhysicalMaterial color={color} transparent opacity={0.45}
                    roughness={0.08} transmission={0.4} />
            </mesh>
            {/* Wide base foot */}
            <mesh position={[0, -0.18, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2}
                    roughness={0.03} transmission={0.75} />
            </mesh>
            {/* Graduation marks */}
            {[0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].map((frac, i) => (
                <mesh key={i} position={[0.027, -0.175 + 0.35 * frac, 0]}>
                    <boxGeometry args={[0.001, 0.008, 0.01]} />
                    <meshStandardMaterial color="#fff" transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

export default function SideDesk({ position, mirror = false }: {
    position: [number, number, number]; mirror?: boolean;
}) {
    const dir = mirror ? -1 : 1;
    const benchW = 4.0;
    const benchD = 0.85;
    const benchH = 0.06;
    const cabinetH = 1.6;
    const shelfH = 0.9;

    return (
        <group position={position} scale={[dir, 1, 1]}>

            {/* ════════ COUNTERTOP — dark epoxy resin ════════ */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[benchD, benchH, benchW]} />
                <meshPhysicalMaterial color="#2a2a2a" roughness={0.25} metalness={0.05}
                    clearcoat={0.7} clearcoatRoughness={0.15} />
            </mesh>
            {/* Front lip — slightly overhang */}
            <mesh position={[benchD / 2 - 0.01, -0.01, 0]}>
                <boxGeometry args={[0.04, benchH + 0.02, benchW + 0.02]} />
                <meshPhysicalMaterial color="#222" roughness={0.3} metalness={0.05}
                    clearcoat={0.5} clearcoatRoughness={0.2} />
            </mesh>

            {/* ════════ CABINET BODY — light gray steel ════════ */}
            <mesh position={[0, -(cabinetH / 2 + benchH / 2), 0]}>
                <boxGeometry args={[benchD - 0.02, cabinetH, benchW]} />
                <meshStandardMaterial color="#c8c6c0" roughness={0.65} metalness={0.15} />
            </mesh>
            {/* Kick plate at bottom */}
            <mesh position={[benchD / 2 - 0.01, -(cabinetH + benchH / 2 - 0.04), 0]}>
                <boxGeometry args={[0.02, 0.08, benchW - 0.02]} />
                <meshStandardMaterial color="#999" roughness={0.5} metalness={0.3} />
            </mesh>

            {/* ════════ BLUE CABINET DOORS (3 sections) ════════ */}
            {[-1.2, 0, 1.2].map((z, i) => (
                <group key={`cab-${i}`}>
                    {/* Door panel */}
                    <mesh position={[benchD / 2 + 0.005, -(cabinetH * 0.35 + benchH / 2), z]}>
                        <boxGeometry args={[0.02, cabinetH * 0.55, 1.05]} />
                        <meshStandardMaterial color="#5b8fc9" roughness={0.45} metalness={0.1} />
                    </mesh>
                    {/* Door border trim */}
                    <mesh position={[benchD / 2 + 0.015, -(cabinetH * 0.35 + benchH / 2), z]}>
                        <boxGeometry args={[0.005, cabinetH * 0.55 - 0.02, 1.03]} />
                        <meshStandardMaterial color="#4a7eb8" roughness={0.5} metalness={0.15} />
                    </mesh>
                    {/* Drawer above door */}
                    <mesh position={[benchD / 2 + 0.005, -(benchH / 2 + 0.15), z]}>
                        <boxGeometry args={[0.02, 0.22, 1.05]} />
                        <meshStandardMaterial color="#5b8fc9" roughness={0.45} metalness={0.1} />
                    </mesh>
                    {/* Drawer handle — chrome bar */}
                    <mesh position={[benchD / 2 + 0.025, -(benchH / 2 + 0.15), z]}>
                        <boxGeometry args={[0.012, 0.018, 0.18]} />
                        <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.85} />
                    </mesh>
                    {/* Door handle — chrome bar */}
                    <mesh position={[benchD / 2 + 0.025, -(cabinetH * 0.25 + benchH / 2), z]}>
                        <boxGeometry args={[0.012, 0.018, 0.14]} />
                        <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.85} />
                    </mesh>
                    {/* Divider strip between drawer and door */}
                    <mesh position={[benchD / 2 + 0.012, -(benchH / 2 + 0.27), z]}>
                        <boxGeometry args={[0.015, 0.008, 1.06]} />
                        <meshStandardMaterial color="#b0b0a8" roughness={0.5} metalness={0.3} />
                    </mesh>
                </group>
            ))}

            {/* ════════ OVERHEAD REAGENT SHELF ════════ */}
            {[-1.6, -0.5, 0.5, 1.6].map((z, i) => (
                <mesh key={`post-${i}`} position={[-benchD / 2 + 0.08, shelfH / 2 + benchH / 2, z]}>
                    <boxGeometry args={[0.04, shelfH, 0.04]} />
                    <meshStandardMaterial color="#b0b0a8" roughness={0.4} metalness={0.4} />
                </mesh>
            ))}
            {/* Post perforation detail — small holes */}
            {[-1.6, -0.5, 0.5, 1.6].map((z, pi) =>
                [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75].map((y, hi) => (
                    <mesh key={`hole-${pi}-${hi}`} position={[-benchD / 2 + 0.10, y, z]}>
                        <boxGeometry args={[0.003, 0.012, 0.015]} />
                        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.5} />
                    </mesh>
                ))
            )}

            {/* Lower shelf */}
            <mesh position={[-benchD / 2 + 0.08, 0.35, 0]}>
                <boxGeometry args={[0.30, 0.02, benchW - 0.2]} />
                <meshStandardMaterial color="#bbb" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Upper shelf */}
            <mesh position={[-benchD / 2 + 0.08, 0.65, 0]}>
                <boxGeometry args={[0.30, 0.02, benchW - 0.2]} />
                <meshStandardMaterial color="#bbb" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Anti-roll lips on shelves */}
            {[0.35, 0.65].map((y, i) => (
                <mesh key={`lip-${i}`} position={[-benchD / 2 + 0.22, y + 0.02, 0]}>
                    <boxGeometry args={[0.005, 0.025, benchW - 0.25]} />
                    <meshStandardMaterial color="#ccc" roughness={0.3} metalness={0.4} />
                </mesh>
            ))}
            {/* Horizontal rails */}
            {[0.25, 0.55].map((y, yi) => (
                <mesh key={`rail-${yi}`} position={[-benchD / 2 + 0.08, y, 0]}>
                    <boxGeometry args={[0.015, 0.015, benchW - 0.3]} />
                    <meshStandardMaterial color="#ccc" roughness={0.3} metalness={0.5} />
                </mesh>
            ))}
            {/* Post caps — teal accent */}
            {[-1.6, -0.5, 0.5, 1.6].map((z, i) => (
                <mesh key={`cap-${i}`} position={[-benchD / 2 + 0.08, shelfH + benchH / 2 + 0.02, z]}>
                    <boxGeometry args={[0.05, 0.03, 0.05]} />
                    <meshStandardMaterial color="#009688" roughness={0.5} />
                </mesh>
            ))}

            {/* ════════ APPARATUS ON COUNTERTOP ════════ */}

            <Beaker position={[0.1, 0.21, -1.2]} color="#4dc9f6" scale={1} />
            <Beaker position={[0.2, 0.18, 0.8]} color="#ffd700" scale={0.8} />
            <Beaker position={[-0.1, 0.21, 0.3]} color="#ff9999" scale={1} />

            <Flask position={[0.15, 0.18, -0.4]} color="#7bf590" />
            <Flask position={[-0.15, 0.18, 1.4]} color="#b388ff" withStopper />

            <TestTubeRack position={[0.0, 0.05, 0.0]} />

            <WashBottle position={[0.25, 0.15, 1.0]} />

            <BunsenBurner position={[-0.2, 0.03, -1.5]} />

            <MortarPestle position={[0.3, 0.03, -0.7]} />

            <GraduatedCylinder position={[-0.15, 0.21, 0.55]} color="#88ccff" />
            <GraduatedCylinder position={[0.3, 0.21, 1.5]} color="#ffcc88" />

            {/* Petri dishes — stacked with slight offsets */}
            {[0, 0.018, 0.036].map((y, i) => (
                <group key={`pd-${i}`} position={[-0.2, 0.04 + y, -0.8]}>
                    <mesh>
                        <cylinderGeometry args={[0.05, 0.05, 0.012, 20]} />
                        <meshPhysicalMaterial color="#eeeeff" transparent opacity={0.25}
                            roughness={0.03} transmission={0.7} />
                    </mesh>
                    {/* Rim */}
                    <mesh>
                        <torusGeometry args={[0.05, 0.002, 8, 20]} />
                        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.3}
                            roughness={0.03} transmission={0.6} />
                    </mesh>
                </group>
            ))}

            {/* ════════ REAGENT BOTTLES ON SHELVES ════════ */}
            {[-1.2, -0.7, -0.2, 0.3, 0.8, 1.3].map((z, i) => {
                const bottleColors = ['#8b4513', '#8b4513', '#f5f5dc', '#8b4513', '#f5f5dc', '#8b4513'];
                const liquidColors = ['#cc6600', '#ffdd00', '#ccffcc', '#cc6600', '#ffffcc', '#ff8844'];
                return (
                    <group key={`rb-${i}`} position={[-benchD / 2 + 0.08, 0.46, z]}>
                        <mesh>
                            <cylinderGeometry args={[0.030, 0.038, 0.18, 10]} />
                            <meshPhysicalMaterial color={bottleColors[i]} transparent opacity={0.45}
                                roughness={0.15} transmission={0.35} side={THREE.DoubleSide} />
                        </mesh>
                        {/* Liquid */}
                        <mesh position={[0, -0.02, 0]}>
                            <cylinderGeometry args={[0.026, 0.034, 0.12, 10]} />
                            <meshPhysicalMaterial color={liquidColors[i]} transparent opacity={0.5}
                                roughness={0.1} transmission={0.3} />
                        </mesh>
                        {/* Screw cap */}
                        <mesh position={[0, 0.10, 0]}>
                            <cylinderGeometry args={[0.018, 0.022, 0.025, 8]} />
                            <meshStandardMaterial color="#222" roughness={0.5} />
                        </mesh>
                        {/* Label */}
                        <mesh position={[0.032, 0, 0]}>
                            <planeGeometry args={[0.001, 0.06]} />
                            <meshStandardMaterial color="#fff" roughness={0.95} />
                        </mesh>
                    </group>
                );
            })}

            {/* Top shelf bottles — larger */}
            {[-0.9, -0.3, 0.3, 0.9].map((z, i) => (
                <group key={`tb-${i}`} position={[-benchD / 2 + 0.08, 0.76, z]}>
                    <mesh>
                        <cylinderGeometry args={[0.038, 0.042, 0.20, 10]} />
                        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.22}
                            roughness={0.03} transmission={0.72} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0, -0.02, 0]}>
                        <cylinderGeometry args={[0.033, 0.038, 0.14, 10]} />
                        <meshPhysicalMaterial color={['#88ccff', '#ffcc88', '#cc88ff', '#88ffcc'][i]}
                            transparent opacity={0.4} roughness={0.08} transmission={0.4} />
                    </mesh>
                    <mesh position={[0, 0.11, 0]}>
                        <cylinderGeometry args={[0.016, 0.020, 0.025, 8]} />
                        <meshStandardMaterial color="#333" roughness={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
