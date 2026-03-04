import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface NFPAValues {
    health: string;
    flammability: string;
    reactivity: string;
    specific: string;
}

interface ReagentBottleProps {
    position: [number, number, number];
    liquidColor: string;
    liquidOpacity: number;
    glassColor: string;
    glassTransmission?: number;
    labelName: string;
    labelFormula: string;
    labelVolume: string;
    labelMoles?: string;
    nfpa: NFPAValues;
    showLiquid?: boolean;
    stopperColor?: string; // If provided, uses a plastic octagonal stopper instead of glass
}

export default function ReagentBottle({
    position,
    liquidColor,
    liquidOpacity,
    glassColor,
    glassTransmission = 0.88,
    labelName,
    labelFormula,
    labelVolume,
    labelMoles,
    nfpa,
    showLiquid = true,
    stopperColor
}: ReagentBottleProps) {
    return (
        <group position={position}>
            {/* ── BOTTLE BODY (Classic Reagent Round Bottle) ── */}
            <mesh position={[0, 0.175, 0]} castShadow renderOrder={2}>
                <cylinderGeometry args={[0.075, 0.080, 0.35, 32]} />
                <meshPhysicalMaterial
                    color={glassColor}
                    roughness={0.05}
                    transmission={glassTransmission}
                    thickness={0.03}
                    ior={1.48}
                    depthWrite={false}
                />
            </mesh>

            {/* ── LIQUID INSIDE ── */}
            {showLiquid && (
                <mesh position={[0, 0.115, 0]} renderOrder={1}>
                    <cylinderGeometry args={[0.065, 0.070, 0.22, 32]} />
                    <meshPhysicalMaterial
                        color={liquidColor}
                        roughness={0.1}
                        transmission={0.99}
                        ior={1.33}
                        depthWrite={false}
                        transparent
                        opacity={liquidOpacity}
                    />
                </mesh>
            )}

            {/* ── CURVED SHOULDER ── */}
            <mesh position={[0, 0.385, 0]} castShadow renderOrder={2}>
                {/* Curve up from body radius (0.075) to neck radius (0.025) */}
                <cylinderGeometry args={[0.025, 0.075, 0.07, 32]} />
                <meshPhysicalMaterial color={glassColor} roughness={0.05} transmission={glassTransmission} thickness={0.03} ior={1.48} depthWrite={false} />
            </mesh>

            {/* ── BOTTLE NECK ── */}
            <mesh position={[0, 0.44, 0]} castShadow renderOrder={2}>
                <cylinderGeometry args={[0.025, 0.025, 0.05, 24]} />
                <meshPhysicalMaterial color={glassColor} roughness={0.05} transmission={glassTransmission} thickness={0.03} ior={1.48} depthWrite={false} />
            </mesh>

            {/* ── NECK RIM / LIP ── */}
            <mesh position={[0, 0.465, 0]} castShadow renderOrder={2}>
                <cylinderGeometry args={[0.035, 0.035, 0.012, 24]} />
                <meshPhysicalMaterial color={glassColor} roughness={0.05} transmission={glassTransmission} thickness={0.03} ior={1.48} depthWrite={false} />
            </mesh>

            {/* ── STOPPER ── */}
            <group position={[0, 0.495, 0]}>
                {stopperColor ? (
                    // Colored Plastic Octagonal Stopper (like the red NaOH reference)
                    <>
                        <mesh position={[0, -0.015, 0]} renderOrder={2}>
                            <cylinderGeometry args={[0.023, 0.021, 0.03, 24]} />
                            <meshPhysicalMaterial color="#ffffff" roughness={0.4} transmission={0.9} ior={1.48} depthWrite={false} />
                        </mesh>
                        {/* Red Base */}
                        <mesh position={[0, 0.01, 0]} castShadow>
                            <cylinderGeometry args={[0.05, 0.02, 0.025, 8]} />
                            <meshStandardMaterial color={stopperColor} roughness={0.4} />
                        </mesh>
                        {/* Red Octagonal Top */}
                        <mesh position={[0, 0.03, 0]} castShadow>
                            <cylinderGeometry args={[0.05, 0.05, 0.015, 8]} />
                            <meshStandardMaterial color={stopperColor} roughness={0.4} />
                        </mesh>
                        <mesh position={[0, 0.038, 0]} castShadow>
                            <cylinderGeometry args={[0.02, 0.02, 0.005, 24]} />
                            <meshStandardMaterial color="#2d3748" roughness={0.7} />
                        </mesh>
                    </>
                ) : (
                    // Classic Clear Glass Stopper
                    <>
                        {/* Stopper core (fits in neck) */}
                        <mesh position={[0, -0.015, 0]} renderOrder={2}>
                            <cylinderGeometry args={[0.023, 0.021, 0.03, 24]} />
                            {/* Slightly frosted to simulate ground glass joint */}
                            <meshPhysicalMaterial color="#ffffff" roughness={0.4} transmission={0.9} ior={1.48} depthWrite={false} />
                        </mesh>
                        {/* Stopper flat disc top */}
                        <mesh position={[0, 0.005, 0]} castShadow renderOrder={2}>
                            <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
                            <meshPhysicalMaterial color={glassColor} roughness={0.05} transmission={glassTransmission} thickness={0.02} ior={1.48} depthWrite={false} />
                        </mesh>
                        {/* Stopper grip knob */}
                        <mesh position={[0, 0.02, 0]} castShadow renderOrder={2}>
                            <cylinderGeometry args={[0.02, 0.04, 0.02, 24]} />
                            <meshPhysicalMaterial color={glassColor} roughness={0.05} transmission={glassTransmission} thickness={0.02} ior={1.48} depthWrite={false} />
                        </mesh>
                    </>
                )}
            </group>

            {/* ── FRONT LABEL (Wrap-around Paper style) ── */}
            {/* Using a curved plane to wrap around the cylindrical body */}
            <group position={[0, 0.175, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh>
                    {/* Radius is slightly larger than body (0.075) */}
                    <cylinderGeometry args={[0.076, 0.076, 0.12, 32, 1, false, 0, Math.PI]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.95} side={THREE.DoubleSide} />
                </mesh>

                {/* Text content wrapped onto cylinder via flat group placed forward in Z */}
                <group position={[0, 0, 0.077]} rotation={[0, Math.PI / 2, 0]}>

                    {/* Top Name: SODIUM HYDROXIDE (UpperCase) */}
                    <Text position={[0, 0.03, 0]} fontSize={0.016} color="#000000" anchorX="center" anchorY="middle" fontWeight={800}>
                        {labelName.toUpperCase()}
                    </Text>

                    {/* Chemical Formula */}
                    <Text position={[0, 0.005, 0]} fontSize={0.018} color="#000000" anchorX="center" anchorY="middle" fontWeight={800}>
                        {labelFormula}
                    </Text>

                    {/* Moles / Volume below */}
                    <Text position={[0, -0.015, 0]} fontSize={0.010} color="#333333" anchorX="center" anchorY="middle" fontWeight={500}>
                        {labelMoles ? `${labelMoles}\n${labelVolume}` : labelVolume}
                    </Text>

                    {/* Render NFPA diamond smaller to fit on wrapped label */}
                    <group position={[0, -0.045, 0]} scale={0.25}>
                        {/* Blue (Health) */}
                        <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                            <planeGeometry args={[0.04, 0.04]} />
                            <meshBasicMaterial color="#0055a4" />
                        </mesh>
                        <Text position={[-0.03, 0, 0.001]} fontSize={0.024} color="#ffffff" fontWeight={700} anchorX="center" anchorY="middle">{nfpa.health}</Text>

                        {/* Red (Flammability) */}
                        <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 4]}>
                            <planeGeometry args={[0.04, 0.04]} />
                            <meshBasicMaterial color="#cc0000" />
                        </mesh>
                        <Text position={[0, 0.03, 0.001]} fontSize={0.024} color="#ffffff" fontWeight={700} anchorX="center" anchorY="middle">{nfpa.flammability}</Text>

                        {/* Yellow (Reactivity) */}
                        <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                            <planeGeometry args={[0.04, 0.04]} />
                            <meshBasicMaterial color="#ffcc00" />
                        </mesh>
                        <Text position={[0.03, 0, 0.001]} fontSize={0.024} color="#000000" fontWeight={700} anchorX="center" anchorY="middle">{nfpa.reactivity}</Text>

                        {/* White (Specific Hazard) */}
                        <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI / 4]}>
                            <planeGeometry args={[0.04, 0.04]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        <Text position={[0, -0.03, 0.001]} fontSize={0.014} color="#000000" fontWeight={700} anchorX="center" anchorY="middle">{nfpa.specific}</Text>

                        {/* Diamond Outline Background */}
                        <mesh position={[0, 0, -0.001]} rotation={[0, 0, Math.PI / 4]}>
                            <planeGeometry args={[0.086, 0.086]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </group>
                </group>
            </group>
        </group>
    );
}
