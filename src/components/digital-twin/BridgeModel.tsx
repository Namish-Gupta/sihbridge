import React, { useMemo } from 'react';
import * as THREE from 'three';

// Create a simple checkerboard texture for the arches and parapets
const createCheckerboardTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#ffffff'; // White
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#1e293b'; // Slate 800 (Dark/Black)
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillRect(64, 64, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
};

export const BridgeModel: React.FC = () => {
    const spanLength = 20;
    const numSpans = 6;
    const startX = -60;
    const archHeight = 10;
    const deckY = 7.5;
    const archBaseY = deckY + 0.75;
    
    const checkerTexture = useMemo(() => {
        const tex = createCheckerboardTexture();
        tex.repeat.set(40, 2); // Repeat along the tube
        return tex;
    }, []);

    const parapetTexture = useMemo(() => {
        const tex = createCheckerboardTexture();
        tex.repeat.set(120, 1); // Repeat along the parapet
        return tex;
    }, []);

    const arches = useMemo(() => {
        const archGroup: { curve: THREE.QuadraticBezierCurve3; z: number; centerX: number }[] = [];
        
        for (let i = 0; i < numSpans; i++) {
            const centerX = startX + (i * spanLength) + (spanLength / 2);
            const zOffsets = [-6.8, 6.8];
            
            zOffsets.forEach((z) => {
                const curve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(centerX - spanLength / 2, archBaseY, z),
                    new THREE.Vector3(centerX, archBaseY + archHeight * 2, z),
                    new THREE.Vector3(centerX + spanLength / 2, archBaseY, z)
                );
                archGroup.push({ curve, z, centerX });
            });
        }
        return archGroup;
    }, [numSpans, spanLength, startX, archHeight, archBaseY]);

    return (
        <group position={[0, 0, 0]}>
            {/* ABUTMENTS (Ends) */}
            <mesh position={[-62, 2.375, 0]} receiveShadow castShadow>
                <boxGeometry args={[8, 10.25, 16]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.8} />
            </mesh>

            <mesh position={[62, 2.375, 0]} receiveShadow castShadow>
                <boxGeometry args={[8, 10.25, 16]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.8} />
            </mesh>

            {/* PIERS (Supports) - now touching the deck correctly */}
            {/* Bottom of deck is 6.75. Ground is -2. */}
            {[-40, -20, 0, 20, 40].map((x, index) => (
                <group key={`pier-${index}`} position={[x, 0, 0]}>
                    {/* Vertical Pier Column from -2 to 5.25 -> center is 1.625, height 7.25 */}
                    <mesh position={[0, 1.625, 0]} receiveShadow castShadow>
                        <boxGeometry args={[4, 7.25, 10]} />
                        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
                    </mesh>
                    {/* Wider Pier Cap from 5.25 to 6.75 -> center is 6.0, height 1.5 */}
                    <mesh position={[0, 6.0, 0]} receiveShadow castShadow>
                        <boxGeometry args={[6, 1.5, 14]} />
                        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
                    </mesh>
                </group>
            ))}

            {/* NAPIER BRIDGE ARCHES (Checkerboard) */}
            {arches.map((arch, idx) => (
                <group key={`arch-${idx}`}>
                    <mesh receiveShadow castShadow>
                        <tubeGeometry args={[arch.curve, 32, 0.6, 8, false]} />
                        <meshStandardMaterial map={checkerTexture} roughness={0.6} />
                    </mesh>
                    
                    {/* Vertical suspenders hanging from arch to deck */}
                    {[-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].map((offsetX, suspIdx) => {
                        const suspX = arch.centerX + offsetX;
                        const t = (offsetX + (spanLength / 2)) / spanLength;
                        const pt = arch.curve.getPoint(t);
                        const suspHeight = pt.y - archBaseY;
                        if (suspHeight <= 0) return null;
                        
                        const suspCenterY = archBaseY + (suspHeight / 2);
                        
                        return (
                            <mesh key={`susp-${suspIdx}`} position={[suspX, suspCenterY, arch.z]} receiveShadow castShadow>
                                <cylinderGeometry args={[0.1, 0.1, suspHeight, 8]} />
                                <meshStandardMaterial color="#334155" roughness={0.7} />
                            </mesh>
                        );
                    })}
                </group>
            ))}

            {/* DECK & ROADWAY */}
            <group position={[0, 7.5, 0]}>
                {/* Structural Concrete Deck */}
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[120, 1.5, 14]} />
                    <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
                </mesh>
                
                {/* Dark Gray Asphalt Road Surface */}
                <mesh position={[0, 0.76, 0]} receiveShadow>
                    <boxGeometry args={[120, 0.05, 13]} />
                    <meshStandardMaterial color="#334155" roughness={1.0} />
                </mesh>

                {/* SIDE PARAPETS (Checkerboard) */}
                <mesh position={[0, 1.35, -6.7]} receiveShadow castShadow>
                    <boxGeometry args={[120, 1.2, 0.6]} />
                    <meshStandardMaterial map={parapetTexture} roughness={0.5} />
                </mesh>
                
                <mesh position={[0, 1.35, 6.7]} receiveShadow castShadow>
                    <boxGeometry args={[120, 1.2, 0.6]} />
                    <meshStandardMaterial map={parapetTexture} roughness={0.5} />
                </mesh>

                {/* Static Center Lane Marker */}
                <mesh position={[0, 0.8, 0]} receiveShadow>
                    <boxGeometry args={[116, 0.02, 0.2]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.9} />
                </mesh>
            </group>
        </group>
    );
};
