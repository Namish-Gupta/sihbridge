import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BridgeModel } from './BridgeModel';
import { SensorMarkers } from './SensorMarkers';
import { VirtualSensorMarkers } from './VirtualSensorMarkers';
import { useSHMStore } from '../../store/useSHMStore';
import {
    RotateCcw,
    Eye,
    Layers,
    Activity,
    Cpu,
    AlertOctagon,
    CheckCircle2,
    SlidersHorizontal,
    Zap
} from 'lucide-react';

// Smooth camera controller component inside Canvas
const CameraController: React.FC = () => {
    const cameraTarget = useSHMStore((state) => state.cameraTarget);
    const { camera } = useThree();

    useEffect(() => {
        if (cameraTarget) {
            const [tx, ty, tz] = cameraTarget;
            // Animate camera position relative to target
            const targetPos = new THREE.Vector3(tx + 12, ty + 10, tz + 25);

            let startTime = performance.now();
            const startPos = camera.position.clone();
            const duration = 1000; // ms

            const animateCamera = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
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
    const sensorFilter = useSHMStore((state) => state.sensorFilter);
    const setSensorFilter = useSHMStore((state) => state.setSensorFilter);
    const state0Mode = useSHMStore((state) => state.state0Mode);
    const setState0Mode = useSHMStore((state) => state.setState0Mode);
    const selectComponent = useSHMStore((state) => state.selectComponent);
    const focusAnomaly = useSHMStore((state) => state.focusAnomaly);
    const resetView = useSHMStore((state) => state.resetView);
    const setCameraTarget = useSHMStore((state) => state.setCameraTarget);
    const anomalies = useSHMStore((state) => state.anomalies);
    const sensors = useSHMStore((state) => state.sensors);

    const activeAnomaliesCount = anomalies.filter(a => a.status === 'ACTIVE').length;

    return (
        <div className="relative w-full h-full bg-shm-bg overflow-hidden flex flex-col">
            {/* --- TOP TOOLBAR OVERLAY --- */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                {/* Left Status & Camera Preset Buttons */}
                <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-xl">
                    <span className="px-2.5 py-1 text-xs font-semibold text-cyan-400 border-r border-slate-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        3D DIGITAL TWIN
                    </span>

                    <button
                        onClick={() => resetView()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        title="Reset Camera Overview"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset View
                    </button>

                    <button
                        onClick={() => focusAnomaly('ANOM-2026-091')}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-900/80 transition animate-subtle-pulse"
                    >
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                        Focus Anomaly (Pier P3)
                    </button>

                    <button
                        onClick={() => {
                            selectComponent('girder-g2');
                            setCameraTarget([0, 1.8, 3.5]);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-500/30 hover:bg-amber-900/70 transition"
                    >
                        Focus Girder G2
                    </button>

                    <button
                        onClick={() => setCameraTarget([0, 45, 1])}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Top View
                    </button>
                </div>

                {/* Right Sensor Filter & Difference Mode Toggles */}
                <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-xl">
                    <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
                        <button
                            onClick={() => setSensorFilter('all')}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition ${sensorFilter === 'all'
                                    ? 'bg-slate-800 text-white font-semibold shadow'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            All Sensors
                        </button>
                        <button
                            onClick={() => setSensorFilter('physical')}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${sensorFilter === 'physical'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-semibold'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Activity className="w-3 h-3 text-cyan-400" />
                            Measured
                        </button>
                        <button
                            onClick={() => setSensorFilter('virtual')}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${sensorFilter === 'virtual'
                                    ? 'bg-purple-950 text-purple-300 border border-purple-500/50 font-semibold'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Cpu className="w-3 h-3 text-purple-400" />
                            AI-Inferred
                        </button>
                    </div>

                    <button
                        onClick={() => setState0Mode(state0Mode === 'difference' ? 'slider' : 'difference')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${state0Mode === 'difference'
                                ? 'bg-red-950/80 border-red-500/60 text-red-200'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        {state0Mode === 'difference' ? 'Diff Heatmap Active' : 'Show Diff View'}
                    </button>
                </div>
            </div>

            {/* --- THREE.JS CANVAS --- */}
            <div className="w-full h-full">
                <Canvas
                    camera={{ position: [30, 20, 40], fov: 45 }}
                    shadows
                    gl={{ antialias: true, alpha: false }}
                    onCreated={({ gl }) => {
                        gl.setClearColor('#090d16');
                    }}
                >
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[50, 60, 30]} intensity={1.2} castShadow />
                    <directionalLight position={[-40, 30, -20]} intensity={0.5} />

                    <BridgeModel />
                    <SensorMarkers />
                    <VirtualSensorMarkers />
                    <CameraController />

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={10}
                        maxDistance={120}
                        maxPolarAngle={Math.PI / 2 - 0.05}
                    />
                </Canvas>
            </div>

            {/* --- BOTTOM FLOATING LEGEND & METRICS --- */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
                {/* Global Sensor Legend */}
                <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-800 shadow-xl flex items-center gap-5 text-xs">
                    <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider border-r border-slate-800 pr-3">
                        Legend
                    </span>

                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan"></span>
                        <span className="font-medium text-slate-200">Physical (MEASURED)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-glow-purple"></span>
                        <span className="font-medium text-slate-200">AI-Virtual (INFERRED)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                        <span className="font-semibold text-red-400">Critical Anomaly Zone</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span className="font-medium text-amber-300">Warning Zone</span>
                    </div>
                </div>

                {/* AI Model & Confidence Summary */}
                <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-800 shadow-xl flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">AI Virtual Sensors</div>
                            <div className="font-mono font-bold text-purple-300">18 Active Models (Avg 92% Conf)</div>
                        </div>
                    </div>

                    <div className="h-6 border-r border-slate-800"></div>

                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Physical Sensors</div>
                            <div className="font-mono font-bold text-cyan-300">24 Telemetry Nodes</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
