import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSHMStore } from '../../store/useSHMStore';

export const BridgeModel: React.FC = () => {
    const selectedComponentId = useSHMStore((state) => state.selectedComponentId);
    const selectComponent = useSHMStore((state) => state.selectComponent);
    const state0Mode = useSHMStore((state) => state.state0Mode);
    const state0SliderPos = useSHMStore((state) => state.state0SliderPos);

    const pierP3Ref = useRef<THREE.Mesh>(null);
    const girderG2Ref = useRef<THREE.Mesh>(null);

    // Pulse animation for anomalous elements
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        if (pierP3Ref.current) {
            const material = pierP3Ref.current.material as THREE.MeshStandardMaterial;
            if (material) {
                // Red glowing pulsation for critical Pier P3
                const pulse = (Math.sin(elapsedTime * 4) + 1) / 2;
                material.emissive.setRGB(0.8 + pulse * 0.2, 0.1, 0.1);
                material.emissiveIntensity = 0.5 + pulse * 0.8;
            }
        }

        if (girderG2Ref.current) {
            const material = girderG2Ref.current.material as THREE.MeshStandardMaterial;
            if (material) {
                // Amber warning pulsation for Girder G2
                const pulse = (Math.sin(elapsedTime * 3) + 1) / 2;
                material.emissive.setRGB(0.7, 0.4 + pulse * 0.3, 0.0);
                material.emissiveIntensity = 0.3 + pulse * 0.4;
            }
        }
    });

    const getMaterialColor = (id: string, defaultHex: string, status: 'normal' | 'warning' | 'critical') => {
        const isSelected = selectedComponentId === id;
        if (isSelected) return '#06b6d4'; // Cyan outline selection

        // In difference view, highlight changed areas according to slider
        if (state0Mode === 'difference') {
            if (id === 'pier-p3') return '#ef4444'; // High difference
            if (id === 'girder-g2' || id === 'deck-d2') return '#f59e0b'; // Moderate difference
            return '#334155'; // Minor/no difference
        }

        if (status === 'critical') return '#ef4444';
        if (status === 'warning') return '#f59e0b';
        return defaultHex;
    };

    return (
        <group position={[0, 0, 0]}>
            {/* --- Ambient Water / Terrain Grid --- */}
            <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[250, 100]} />
                <meshStandardMaterial color="#070d18" roughness={0.9} metalness={0.1} />
            </mesh>
            <gridHelper args={[240, 60, '#1e293b', '#0f172a']} position={[0, -9.9, 0]} />

            {/* --- ABUTMENTS (Ends) --- */}
            {/* Left Abutment */}
            <mesh position={[-62, -2, 0]}>
                <boxGeometry args={[8, 12, 16]} />
                <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>

            {/* Right Abutment */}
            <mesh position={[62, -2, 0]}>
                <boxGeometry args={[8, 12, 16]} />
                <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>

            {/* --- PIERS (P1 to P4) --- */}
            {/* Pier P1 */}
            <group position={[-45, -2, 0]} onClick={(e) => { e.stopPropagation(); selectComponent('pier-p1'); }}>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[2.2, 2.8, 12, 16]} />
                    <meshStandardMaterial
                        color={getMaterialColor('pier-p1', '#475569', 'normal')}
                        roughness={0.5}
                    />
                </mesh>
                {/* Pier Cap */}
                <mesh position={[0, 5.8, 0]}>
                    <boxGeometry args={[5, 1.2, 12]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
            </group>

            {/* Pier P2 */}
            <group position={[-15, -2, 0]} onClick={(e) => { e.stopPropagation(); selectComponent('pier-p2'); }}>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[2.4, 3.0, 12, 16]} />
                    <meshStandardMaterial
                        color={getMaterialColor('pier-p2', '#475569', 'normal')}
                        roughness={0.5}
                    />
                </mesh>
                {/* Pier Cap */}
                <mesh position={[0, 5.8, 0]}>
                    <boxGeometry args={[5, 1.2, 12]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
            </group>

            {/* Pier P3 - CRITICAL ANOMALY */}
            <group position={[15, -2, 0]} onClick={(e) => { e.stopPropagation(); selectComponent('pier-p3'); }}>
                <mesh ref={pierP3Ref} position={[0, 0, 0]}>
                    <cylinderGeometry args={[2.4, 3.0, 12, 16]} />
                    <meshStandardMaterial
                        color={getMaterialColor('pier-p3', '#ef4444', 'critical')}
                        emissive="#ef4444"
                        emissiveIntensity={0.6}
                        roughness={0.4}
                    />
                </mesh>
                {/* Pier Cap */}
                <mesh position={[0, 5.8, 0]}>
                    <boxGeometry args={[5.2, 1.2, 12]} />
                    <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.4} />
                </mesh>
            </group>

            {/* Pier P4 */}
            <group position={[45, -2, 0]} onClick={(e) => { e.stopPropagation(); selectComponent('pier-p4'); }}>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[2.2, 2.8, 12, 16]} />
                    <meshStandardMaterial
                        color={getMaterialColor('pier-p4', '#475569', 'normal')}
                        roughness={0.5}
                    />
                </mesh>
                {/* Pier Cap */}
                <mesh position={[0, 5.8, 0]}>
                    <boxGeometry args={[5, 1.2, 12]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
            </group>

            {/* --- GIRDERS (G1 North, G2 South) --- */}
            {/* Main Girder G1 (North) */}
            <mesh
                position={[0, 4.6, -3.5]}
                onClick={(e) => { e.stopPropagation(); selectComponent('girder-g1'); }}
            >
                <boxGeometry args={[120, 1.8, 2.0]} />
                <meshStandardMaterial
                    color={getMaterialColor('girder-g1', '#334155', 'normal')}
                    roughness={0.5}
                />
            </mesh>

            {/* Main Girder G2 (South - WARNING) */}
            <mesh
                ref={girderG2Ref}
                position={[0, 4.6, 3.5]}
                onClick={(e) => { e.stopPropagation(); selectComponent('girder-g2'); }}
            >
                <boxGeometry args={[120, 1.8, 2.0]} />
                <meshStandardMaterial
                    color={getMaterialColor('girder-g2', '#f59e0b', 'warning')}
                    emissive="#f59e0b"
                    emissiveIntensity={0.3}
                    roughness={0.5}
                />
            </mesh>

            {/* --- DECK & ROADWAY --- */}
            {/* Deck Span D1 (Left Span) */}
            <group position={[-30, 5.8, 0]} onClick={(e) => { e.stopPropagation(); selectComponent('deck-d1'); }}>
                {/* Main Concrete Slab */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[60, 0.8, 14]} />
                    <meshStandardMaterial color={getMaterialColor('deck-d1', '#1e293b', 'normal')} roughness={0.4} />
                </mesh>
                {/* Asphalt Road Top */}
                <mesh position={[0, 0.42, 0]}>
                    <boxGeometry args={[59.8, 0.05, 13.6]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.9} />
                </mesh>
            </group>

            {/* Deck Span D2 (Right Span) */}
            <group position={[30, 5.8, 0]} onClick={(e) => { e.stopPropagation(); selectComponent('deck-d2'); }}>
                {/* Main Concrete Slab */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[60, 0.8, 14]} />
                    <meshStandardMaterial color={getMaterialColor('deck-d2', '#1e293b', 'warning')} roughness={0.4} />
                </mesh>
                {/* Asphalt Road Top */}
                <mesh position={[0, 0.42, 0]}>
                    <boxGeometry args={[59.8, 0.05, 13.6]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.9} />
                </mesh>
            </group>

            {/* --- ROADWAY DETAILS (Lane Lines & Safety Crash Barriers) --- */}
            {/* Crash Barriers North */}
            <mesh position={[0, 6.6, -6.8]}>
                <boxGeometry args={[120, 0.8, 0.4]} />
                <meshStandardMaterial color="#64748b" roughness={0.3} />
            </mesh>
            {/* Crash Barriers South */}
            <mesh position={[0, 6.6, 6.8]}>
                <boxGeometry args={[120, 0.8, 0.4]} />
                <meshStandardMaterial color="#64748b" roughness={0.3} />
            </mesh>

            {/* --- EXPANSION JOINTS --- */}
            {/* EJ1 */}
            <mesh
                position={[-30, 5.85, 0]}
                onClick={(e) => { e.stopPropagation(); selectComponent('ej-ej1'); }}
            >
                <boxGeometry args={[0.6, 0.85, 14]} />
                <meshStandardMaterial color={getMaterialColor('ej-ej1', '#475569', 'normal')} metalness={0.8} />
            </mesh>

            {/* EJ2 */}
            <mesh
                position={[30, 5.85, 0]}
                onClick={(e) => { e.stopPropagation(); selectComponent('ej-ej2'); }}
            >
                <boxGeometry args={[0.6, 0.85, 14]} />
                <meshStandardMaterial color={getMaterialColor('ej-ej2', '#475569', 'normal')} metalness={0.8} />
            </mesh>

            {/* Center Line Marker */}
            <mesh position={[0, 6.28, 0]}>
                <boxGeometry args={[116, 0.02, 0.3]} />
                <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.2} />
            </mesh>
        </group>
    );
};
