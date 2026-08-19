import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BridgeModel } from './BridgeModel';
import { SensorMarkers } from './SensorMarkers';
import { VirtualSensorMarkers } from './VirtualSensorMarkers';
import { useSHMStore } from '../../store/useSHMStore';
import { RotateCcw } from 'lucide-react';

const CameraController: React.FC = () => {
    const cameraTarget = useSHMStore((state) => state.cameraTarget);
    const { camera } = useThree();

    useEffect(() => {
        if (cameraTarget) {
            const [tx, ty, tz] = cameraTarget;
            const targetPos = new THREE.Vector3(tx + 12, ty + 10, tz + 25);
            
            let startTime = performance.now();
            const startPos = camera.position.clone();
            const duration = 1000;

            const animateCamera = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);

                camera.position.lerpVectors(startPos, targetPos, ease);
                camera.lookAt(tx, ty, tz);

                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                }
            };
            requestAnimationFrame(animateCamera);
        }
    }, [cameraTarget, camera]);

    return null;
};

export const DigitalTwinView: React.FC = () => {
    const resetView = useSHMStore((state) => state.resetView);

    return (
        <div className="relative w-full h-full bg-slate-50 overflow-hidden flex flex-col font-sans">
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2 rounded shadow-sm border border-slate-200 flex items-center gap-4">
                    <span className="font-bold text-[13px] text-slate-700 tracking-tight">Napier Bridge SHM</span>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Telemetry</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button
                        onClick={() => resetView()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Reset Camera Overview"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset View
                    </button>
                </div>
            </div>

            {/* THREE.JS CANVAS */}
            <div className="w-full h-full">
                <Canvas
                    camera={{ position: [0, 40, 100], fov: 50 }}
                    shadows
                    gl={{ antialias: true, alpha: false }}
                    onCreated={({ gl }) => {
                        gl.setClearColor('#f8fafc');
                    }}
                >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[50, 60, 30]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={100} shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={50} shadow-camera-bottom={-50} />
                    <directionalLight position={[-40, 30, -20]} intensity={0.6} />
                    <hemisphereLight groundColor="#94a3b8" intensity={0.4} />

                    <BridgeModel />
                    <SensorMarkers />
                    <VirtualSensorMarkers />
                    <CameraController />

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={250}
                        maxPolarAngle={Math.PI / 2 - 0.05}
                    />
                </Canvas>
            </div>

            {/* BOTTOM LEGEND */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-5 text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest border-r border-slate-200 pr-4">
                        Legend
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span>
                        <span className="font-semibold text-slate-700">Physical ESP32</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
                        <span className="font-semibold text-slate-700">Healthy Virtual</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
                        <span className="font-semibold text-slate-700">Damaged Virtual</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
