import { Text } from '@react-three/drei';

/**
 * A realistic periodic table poster for the 3D lab wall.
 * Shows first 36 elements in an 18-column layout matching the real periodic table structure.
 * Color-coded by element category.
 */

// Element categories with colors
const CAT_COLORS: Record<string, string> = {
    'alkali': '#ef4444', // red
    'alkaline': '#f97316', // orange
    'transition': '#eab308', // yellow
    'post-trans': '#84cc16', // lime
    'metalloid': '#22c55e', // green
    'nonmetal': '#06b6d4', // cyan
    'halogen': '#3b82f6', // blue
    'noble': '#a855f7', // purple
    'lanthanide': '#ec4899', // pink
    'empty': 'transparent',
};

// Simplified periodic table layout: [symbol, atomicNumber, category, row, col]
const ELEMENTS: [string, number, string, number, number][] = [
    // Row 1
    ['H', 1, 'nonmetal', 0, 0], ['He', 2, 'noble', 0, 17],
    // Row 2
    ['Li', 3, 'alkali', 1, 0], ['Be', 4, 'alkaline', 1, 1],
    ['B', 5, 'metalloid', 1, 12], ['C', 6, 'nonmetal', 1, 13],
    ['N', 7, 'nonmetal', 1, 14], ['O', 8, 'nonmetal', 1, 15],
    ['F', 9, 'halogen', 1, 16], ['Ne', 10, 'noble', 1, 17],
    // Row 3
    ['Na', 11, 'alkali', 2, 0], ['Mg', 12, 'alkaline', 2, 1],
    ['Al', 13, 'post-trans', 2, 12], ['Si', 14, 'metalloid', 2, 13],
    ['P', 15, 'nonmetal', 2, 14], ['S', 16, 'nonmetal', 2, 15],
    ['Cl', 17, 'halogen', 2, 16], ['Ar', 18, 'noble', 2, 17],
    // Row 4
    ['K', 19, 'alkali', 3, 0], ['Ca', 20, 'alkaline', 3, 1],
    ['Sc', 21, 'transition', 3, 2], ['Ti', 22, 'transition', 3, 3],
    ['V', 23, 'transition', 3, 4], ['Cr', 24, 'transition', 3, 5],
    ['Mn', 25, 'transition', 3, 6], ['Fe', 26, 'transition', 3, 7],
    ['Co', 27, 'transition', 3, 8], ['Ni', 28, 'transition', 3, 9],
    ['Cu', 29, 'transition', 3, 10], ['Zn', 30, 'transition', 3, 11],
    ['Ga', 31, 'post-trans', 3, 12], ['Ge', 32, 'metalloid', 3, 13],
    ['As', 33, 'metalloid', 3, 14], ['Se', 34, 'nonmetal', 3, 15],
    ['Br', 35, 'halogen', 3, 16], ['Kr', 36, 'noble', 3, 17],
];

export default function PeriodicTablePoster({ position = [-2.8, 2.8, -4.96] as [number, number, number] }) {
    const cellW = 0.14;
    const cellH = 0.16;
    const gap = 0.015;
    const tableW = 18 * (cellW + gap) - gap;
    const tableH = 4 * (cellH + gap) - gap + 0.45; // extra for title

    return (
        <group position={position}>
            {/* Poster backing — deep blue */}
            <mesh position={[tableW / 2, -tableH / 2 + 0.35, -0.002]}>
                <planeGeometry args={[tableW + 0.15, tableH + 0.15]} />
                <meshStandardMaterial color="#0c1929" roughness={0.85} />
            </mesh>

            {/* White inner border */}
            <mesh position={[tableW / 2, -tableH / 2 + 0.35, -0.001]}>
                <planeGeometry args={[tableW + 0.08, tableH + 0.08]} />
                <meshStandardMaterial color="#f0f4f8" roughness={0.9} />
            </mesh>

            {/* Inner background */}
            <mesh position={[tableW / 2, -tableH / 2 + 0.35, 0]}>
                <planeGeometry args={[tableW + 0.02, tableH + 0.02]} />
                <meshStandardMaterial color="#1a2744" roughness={0.9} />
            </mesh>

            {/* Title */}
            <Text
                position={[tableW / 2, 0.32, 0.002]}
                fontSize={0.09}
                color="#e2e8f0"
                anchorX="center"
                anchorY="middle"
                fontWeight={700}
            >
                PERIODIC TABLE OF THE ELEMENTS
            </Text>

            {/* Subtitle */}
            <Text
                position={[tableW / 2, 0.22, 0.002]}
                fontSize={0.035}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
            >
                HoloLab Chemistry Department
            </Text>

            {/* Element cells */}
            {ELEMENTS.map(([symbol, num, cat, row, col]) => {
                const x = col * (cellW + gap);
                const y = -(row * (cellH + gap)) + 0.08;
                const color = CAT_COLORS[cat] || '#666';

                return (
                    <group key={`${symbol}-${num}`} position={[x, y, 0.001]}>
                        {/* Cell background */}
                        <mesh>
                            <planeGeometry args={[cellW, cellH]} />
                            <meshStandardMaterial color={color} roughness={0.85} />
                        </mesh>

                        {/* Atomic number */}
                        <Text
                            position={[0, cellH * 0.3, 0.001]}
                            fontSize={0.022}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {num.toString()}
                        </Text>

                        {/* Symbol — large */}
                        <Text
                            position={[0, 0, 0.001]}
                            fontSize={0.05}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                            fontWeight={700}
                        >
                            {symbol}
                        </Text>
                    </group>
                );
            })}

            {/* Legend */}
            {Object.entries(CAT_COLORS).filter(([k]) => k !== 'empty').map(([name, color], i) => {
                const lx = (i % 3) * 1.0 + 0.2;
                const ly = -4 * (cellH + gap) - 0.1 - Math.floor(i / 3) * 0.1 + 0.08;
                return (
                    <group key={name} position={[lx, ly, 0.002]}>
                        <mesh>
                            <planeGeometry args={[0.06, 0.06]} />
                            <meshStandardMaterial color={color} roughness={0.85} />
                        </mesh>
                        <Text
                            position={[0.10, 0, 0]}
                            fontSize={0.025}
                            color="#cbd5e1"
                            anchorX="left"
                            anchorY="middle"
                        >
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Text>
                    </group>
                );
            })}
        </group>
    );
}
