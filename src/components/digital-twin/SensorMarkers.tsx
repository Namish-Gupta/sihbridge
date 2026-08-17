import React from 'react';
import { Html } from '@react-three/drei';
import { useSHMStore } from '../../store/useSHMStore';
import { Sensor } from '../../types/shm';
import { Activity, Cpu, AlertTriangle } from 'lucide-react';

export const SensorMarkers: React.FC = () => {
    const sensors = useSHMStore((state) => state.sensors);
    const sensorFilter = useSHMStore((state) => state.sensorFilter);
    const selectedComponentId = useSHMStore((state) => state.selectedComponentId);
    const selectComponent = useSHMStore((state) => state.selectComponent);

    const filteredSensors = sensors.filter((sensor) => {
        if (sensorFilter === 'all') return true;
        return sensor.source === sensorFilter;
    });

    return (
        <group>
            {filteredSensors.map((sensor) => {
                const isPhysical = sensor.source === 'physical';
                const isCritical = sensor.status === 'critical';
                const isWarning = sensor.status === 'warning';
                const isComponentSelected = selectedComponentId === sensor.componentId;

                return (
                    <group
                        key={sensor.id}
                        position={[sensor.position.x, sensor.position.y, sensor.position.z]}
                    >
                        {/* 3D Sphere Marker in Scene */}
                        <mesh
                            onClick={(e) => {
                                e.stopPropagation();
                                selectComponent(sensor.componentId);
                            }}
                        >
                            <sphereGeometry args={[isCritical ? 0.7 : 0.5, 16, 16]} />
                            <meshStandardMaterial
                                color={
                                    isCritical
                                        ? '#ef4444'
                                        : isWarning
                                            ? '#f59e0b'
                                            : isPhysical
                                                ? '#06b6d4'
                                                : '#8b5cf6'
                                }
                                emissive={
                                    isCritical
                                        ? '#ef4444'
                                        : isPhysical
                                            ? '#06b6d4'
                                            : '#8b5cf6'
                                }
                                emissiveIntensity={isCritical ? 1.0 : 0.6}
                            />
                        </mesh>

                        {/* HTML Overlay Badge attached in 3D Space */}
                        <Html
                            position={[0, 1.2, 0]}
                            center
                            distanceFactor={35}
                            zIndexRange={[100, 0]}
                        >
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectComponent(sensor.componentId);
                                }}
                                className={`cursor-pointer transition-all duration-200 select-none ${isComponentSelected ? 'scale-110 z-30' : 'hover:scale-105'
                                    }`}
                            >
                                <div
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border shadow-lg backdrop-blur-md transition-all ${isCritical
                                            ? 'bg-red-950/90 border-red-500 text-red-200 shadow-red-950/50 animate-pulse-glow'
                                            : isWarning
                                                ? 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-amber-950/50'
                                                : isPhysical
                                                    ? 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-cyan-950/40'
                                                    : 'bg-purple-950/90 border-purple-500/60 text-purple-200 shadow-purple-950/40'
                                        }`}
                                >
                                    {/* Icon */}
                                    {isCritical ? (
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                                    ) : isPhysical ? (
                                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                                    ) : (
                                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                    )}

                                    {/* Sensor ID & Source Badge */}
                                    <span className="font-mono font-bold tracking-tight">{sensor.id}</span>

                                    <span
                                        className={`px-1 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${isPhysical
                                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            }`}
                                    >
                                        {isPhysical ? 'MEASURED' : 'AI-INFERRED'}
                                    </span>

                                    {/* Live Telemetry Value */}
                                    <span className="font-mono font-semibold ml-0.5 text-slate-100">
                                        {sensor.value} {sensor.unit}
                                    </span>

                                    {/* AI Confidence Badge */}
                                    {!isPhysical && sensor.confidence && (
                                        <span
                                            className={`text-[9px] font-mono font-bold px-1 rounded ${sensor.confidence >= 90
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                    : 'bg-amber-500/20 text-amber-300'
                                                }`}
                                            title={`Model Confidence: ${sensor.confidence}% (${sensor.modelType || 'AI Engine'})`}
                                        >
                                            {sensor.confidence}% Conf
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};
