import * as THREE from 'three';

/**
 * Realistic laboratory bench matching reference:
 * - Dark countertop (epoxy resin / phenolic)
 * - Light gray steel body
 * - Blue cabinet doors with handles
 * - Overhead reagent shelf on steel posts
 * - Lab apparatus on top
 *
 * Placed against a wall. The desk sits ON the floor.
 * Pass position as the center of the countertop.
 */

/** Beaker with liquid */
function Beaker({ position, color = '#4dc9f6', scale = 1 }: {
    position: [number, number, number]; color?: string; scale?: number;
}) {
    const h = 0.35 * scale, r = 0.10 * scale;
    return (
        <group position={position}>
            <mesh>
                <cylinderGeometry args={[r, r * 0.95, h, 16, 1, true]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2}
                    roughness={0.05} transmission={0.8} ior={1.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -h * 0.15, 0]}>
                <cylinderGeometry args={[r * 0.9, r * 0.85, h * 0.55, 16]} />
                <meshPhysicalMaterial color={color} transparent opacity={0.55}
                    roughness={0.1} transmission={0.4} />
            </mesh>
        </group>
    );
}

/** Erlenmeyer flask */
function Flask({ position, color = '#7bf590' }: {
    position: [number, number, number]; color?: string;
}) {
    return (
        <group position={position}>
            <mesh>
                <cylinderGeometry args={[0.035, 0.12, 0.30, 16]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.18}
                    roughness={0.05} transmission={0.82} ior={1.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.19, 0]}>
                <cylinderGeometry args={[0.03, 0.035, 0.10, 12]} />
                <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.18}
                    roughness={0.05} transmission={0.82} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.05, 0.11, 0.18, 16]} />
                <meshPhysicalMaterial color={color} transparent opacity={0.5}
                    roughness={0.1} transmission={0.4} />
            </mesh>
        </group>
    );
}

/** Test tube rack */
function TestTubeRack({ position }: { position: [number, number, number] }) {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#dda0dd'];
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={[0.42, 0.035, 0.10]} />
                <meshStandardMaterial color="#7a5230" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.12, -0.04]}>
                <boxGeometry args={[0.42, 0.24, 0.018]} />
                <meshStandardMaterial color="#7a5230" roughness={0.7} />
            </mesh>
            {colors.map((c, i) => (
                <group key={i} position={[-0.15 + i * 0.075, 0.12, 0.01]}>
                    <mesh>
                        <cylinderGeometry args={[0.015, 0.015, 0.24, 8, 1, true]} />
                        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.2}
                            roughness={0.05} transmission={0.8} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0, -0.03, 0]}>
                        <cylinderGeometry args={[0.012, 0.012, 0.15, 8]} />
                        <meshPhysicalMaterial color={c} transparent opacity={0.55}
                            roughness={0.1} transmission={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/** Wash bottle */
function WashBottle({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh>
                <cylinderGeometry args={[0.05, 0.06, 0.24, 12]} />
                <meshPhysicalMaterial color="#e8e8ff" transparent opacity={0.3}
                    roughness={0.1} transmission={0.6} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -0.03, 0]}>
                <cylinderGeometry args={[0.045, 0.055, 0.15, 12]} />
                <meshPhysicalMaterial color="#a8d8ff" transparent opacity={0.4}
                    roughness={0.1} transmission={0.5} />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
                <cylinderGeometry args={[0.025, 0.03, 0.035, 8]} />
                <meshStandardMaterial color="#2196f3" roughness={0.6} />
            </mesh>
            <mesh position={[0.015, 0.19, 0]} rotation={[0.3, 0, -0.2]}>
                <cylinderGeometry args={[0.005, 0.005, 0.12, 6]} />
                <meshStandardMaterial color="#2196f3" roughness={0.6} />
            </mesh>
        </group>
    );
}

export default function SideDesk({ position, mirror = false }: {
    position: [number, number, number]; mirror?: boolean;
}) {
    const dir = mirror ? -1 : 1;
    const benchW = 4.0;   // width along wall (Z axis really, but we orient with X)
    const benchD = 0.85;  // depth from wall
    const benchH = 0.06;  // countertop thickness
    const cabinetH = 1.6; // cabinet height below top
    const shelfH = 0.9;   // shelf height above top

    return (
        <group position={position} scale={[dir, 1, 1]}>

            {/* ════════ COUNTERTOP — dark epoxy resin ════════ */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[benchD, benchH, benchW]} />
                <meshPhysicalMaterial color="#2a2a2a" roughness={0.25} metalness={0.05}
                    clearcoat={0.7} clearcoatRoughness={0.15} />
            </mesh>

            {/* ════════ CABINET BODY — light gray steel ════════ */}
            <mesh position={[0, -(cabinetH / 2 + benchH / 2), 0]}>
                <boxGeometry args={[benchD - 0.02, cabinetH, benchW]} />
                <meshStandardMaterial color="#c8c6c0" roughness={0.65} metalness={0.15} />
            </mesh>

            {/* ════════ BLUE CABINET DOORS (3 sections) ════════ */}
            {[-1.2, 0, 1.2].map((z, i) => (
                <group key={`cab-${i}`}>
                    {/* Door panel */}
                    <mesh position={[benchD / 2 + 0.005, -(cabinetH * 0.35 + benchH / 2), z]}>
                        <boxGeometry args={[0.02, cabinetH * 0.55, 1.05]} />
                        <meshStandardMaterial color="#5b8fc9" roughness={0.45} metalness={0.1} />
                    </mesh>
                    {/* Drawer above door */}
                    <mesh position={[benchD / 2 + 0.005, -(benchH / 2 + 0.15), z]}>
                        <boxGeometry args={[0.02, 0.22, 1.05]} />
                        <meshStandardMaterial color="#5b8fc9" roughness={0.45} metalness={0.1} />
                    </mesh>
                    {/* Drawer handle */}
                    <mesh position={[benchD / 2 + 0.02, -(benchH / 2 + 0.15), z]}>
                        <boxGeometry args={[0.015, 0.02, 0.15]} />
                        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.7} />
                    </mesh>
                    {/* Door handle */}
                    <mesh position={[benchD / 2 + 0.02, -(cabinetH * 0.25 + benchH / 2), z]}>
                        <boxGeometry args={[0.015, 0.02, 0.12]} />
                        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.7} />
                    </mesh>
                </group>
            ))}

            {/* ════════ OVERHEAD REAGENT SHELF ════════ */}
            {/* Vertical posts (4) */}
            {[-1.6, -0.5, 0.5, 1.6].map((z, i) => (
                <mesh key={`post-${i}`} position={[-benchD / 2 + 0.08, shelfH / 2 + benchH / 2, z]}>
                    <boxGeometry args={[0.04, shelfH, 0.04]} />
                    <meshStandardMaterial color="#b0b0a8" roughness={0.4} metalness={0.4} />
                </mesh>
            ))}

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

            {/* Horizontal rails between posts */}
            {[0.25, 0.55].map((y, yi) => (
                <mesh key={`rail-${yi}`} position={[-benchD / 2 + 0.08, y, 0]}>
                    <boxGeometry args={[0.015, 0.015, benchW - 0.3]} />
                    <meshStandardMaterial color="#ccc" roughness={0.3} metalness={0.5} />
                </mesh>
            ))}

            {/* Shelf post caps — teal/green accent */}
            {[-1.6, -0.5, 0.5, 1.6].map((z, i) => (
                <mesh key={`cap-${i}`} position={[-benchD / 2 + 0.08, shelfH + benchH / 2 + 0.02, z]}>
                    <boxGeometry args={[0.05, 0.03, 0.05]} />
                    <meshStandardMaterial color="#009688" roughness={0.5} />
                </mesh>
            ))}

            {/* ════════ APPARATUS ON COUNTERTOP ════════ */}

            {/* Beakers */}
            <Beaker position={[0.1, 0.21, -1.2]} color="#4dc9f6" scale={1} />
            <Beaker position={[0.2, 0.18, 0.8]} color="#ffd700" scale={0.8} />
            <Beaker position={[-0.1, 0.21, 0.3]} color="#ff9999" scale={1} />

            {/* Flasks */}
            <Flask position={[0.15, 0.18, -0.4]} color="#7bf590" />
            <Flask position={[-0.15, 0.18, 1.4]} color="#b388ff" />

            {/* Test tube rack */}
            <TestTubeRack position={[0.0, 0.05, 0.0]} />

            {/* Wash bottle */}
            <WashBottle position={[0.25, 0.15, 1.0]} />

            {/* Petri dishes */}
            {[0, 0.018, 0.036].map((y, i) => (
                <mesh key={`pd-${i}`} position={[-0.2, 0.04 + y, -0.8]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.012, 16]} />
                    <meshPhysicalMaterial color="#eeeeff" transparent opacity={0.3}
                        roughness={0.05} transmission={0.7} />
                </mesh>
            ))}

            {/* Reagent bottles on upper shelf */}
            {[-1.0, -0.5, 0.0, 0.5, 1.0].map((z, i) => {
                const colors = ['#8b4513', '#8b4513', '#f5f5dc', '#8b4513', '#f5f5dc'];
                return (
                    <group key={`rb-${i}`} position={[-benchD / 2 + 0.08, 0.45, z]}>
                        <mesh>
                            <cylinderGeometry args={[0.035, 0.04, 0.16, 8]} />
                            <meshPhysicalMaterial color={colors[i]} transparent opacity={0.5}
                                roughness={0.2} transmission={0.3} side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, 0.09, 0]}>
                            <cylinderGeometry args={[0.02, 0.025, 0.03, 8]} />
                            <meshStandardMaterial color="#222" roughness={0.5} />
                        </mesh>
                    </group>
                );
            })}

            {/* Bottles on top shelf */}
            {[-0.7, 0.0, 0.7].map((z, i) => (
                <group key={`tb-${i}`} position={[-benchD / 2 + 0.08, 0.75, z]}>
                    <mesh>
                        <cylinderGeometry args={[0.04, 0.045, 0.18, 8]} />
                        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.25}
                            roughness={0.05} transmission={0.7} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0, -0.02, 0]}>
                        <cylinderGeometry args={[0.035, 0.04, 0.12, 8]} />
                        <meshPhysicalMaterial color={['#88ccff', '#ffcc88', '#cc88ff'][i]}
                            transparent opacity={0.4} roughness={0.1} transmission={0.4} />
                    </mesh>
                    <mesh position={[0, 0.10, 0]}>
                        <cylinderGeometry args={[0.018, 0.022, 0.025, 8]} />
                        <meshStandardMaterial color="#333" roughness={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
