import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useSHMStore } from '../../store/useSHMStore';
import { X, Activity } from 'lucide-react';

export const SensorMarkers: React.FC = () => {
    const iotNodes = useSHMStore((state) => state.iotNodes);
    const nodeStatuses = useSHMStore((state) => state.nodeStatuses);
    
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // Hardcode locations for the two boundary physical nodes
    const nodePositions: Record<string, [number, number, number]> = {
        'NODE_01': [-60, 8.5, 2],
        'NODE_02': [60, 8.5, -2],
    };

    return (
        <group>
            {Object.keys(iotNodes).map((nodeId) => {
                const data = iotNodes[nodeId];
                const status = nodeStatuses[nodeId];
                const isSelected = selectedNode === nodeId;
                const pos = nodePositions[nodeId] || [0, 8.5, 0];

                if (!data) return null;

                const stickHeight = 2.4;
                const labelY = stickHeight + 0.2;

                return (
                    <group key={nodeId} position={pos}>
                        {/* Antenna Stick */}
                        <mesh position={[0, stickHeight / 2, 0]}>
                            <cylinderGeometry args={[0.03, 0.03, stickHeight]} />
                            <meshStandardMaterial color="#94a3b8" />
                        </mesh>

                        {/* Physical Sphere Marker */}
                        <mesh
                            renderOrder={10}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode(isSelected ? null : nodeId);
                            }}
                        >
                            <sphereGeometry args={[isSelected ? 0.6 : 0.45, 16, 16]} />
                            <meshStandardMaterial color="#2563eb" depthTest={false} />
                        </mesh>
                        
                        {/* Offset Label */}
                        {!isSelected && (
                            <Html position={[0, labelY, 0]} center zIndexRange={[50, 0]}>
                                <div 
                                    className="cursor-pointer select-none whitespace-nowrap bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] rounded px-2 py-0.5 shadow-sm hover:bg-blue-100 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(nodeId);
                                    }}
                                >
                                    {nodeId}
                                </div>
                            </Html>
                        )}

                        {/* Detail Popover Panel */}
                        {isSelected && (
                            <Html position={[0, labelY, 0]} center zIndexRange={[100, 0]}>
                                <div className="w-72 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden text-slate-800 select-none">
                                    <div className="px-4 py-3 flex items-center justify-between border-b bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-blue-500" />
                                            <div>
                                                <h3 className="font-bold text-sm tracking-tight text-slate-800">{nodeId}</h3>
                                                <p className="text-[10px] text-slate-500 font-mono">State: {status?.health || 'UNKNOWN'}</p>
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }} className="text-slate-400 hover:text-slate-700 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar text-xs">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="font-medium text-slate-500">TinyML prediction</span>
                                            <span className="font-bold text-slate-700">{data.tinyml?.prediction || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="font-medium text-slate-500">Damage probability</span>
                                            <span className="font-mono text-slate-700">
                                                {data.tinyml?.damage_probability !== undefined 
                                                    ? (data.tinyml.damage_probability * 100).toFixed(1) + '%' 
                                                    : 'N/A'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                <div className="text-[9px] text-slate-500 mb-1">Temperature</div>
                                                <div className="font-mono font-medium text-slate-700">{data.environment?.temperature?.toFixed(1) || 'N/A'} °C</div>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                <div className="text-[9px] text-slate-500 mb-1">Humidity</div>
                                                <div className="font-mono font-medium text-slate-700">{data.environment?.humidity?.toFixed(1) || 'N/A'} %</div>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <h4 className="text-[10px] font-bold text-slate-500 mb-1.5 border-b border-slate-100 pb-1">Sensor Features</h4>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center px-1 text-[10px] font-mono">
                                                    <span className="text-slate-500">MPU X/Y/Z</span>
                                                    <span className="text-slate-700">
                                                        {data.sensors?.mpu6500 ? `${data.sensors.mpu6500.x.toFixed(2)}, ${data.sensors.mpu6500.y.toFixed(2)}, ${data.sensors.mpu6500.z.toFixed(2)}` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center px-1 text-[10px] font-mono">
                                                    <span className="text-slate-500">ADXL X/Y/Z</span>
                                                    <span className="text-slate-700">
                                                        {data.sensors?.adxl345 ? `${data.sensors.adxl345.x.toFixed(2)}, ${data.sensors.adxl345.y.toFixed(2)}, ${data.sensors.adxl345.z.toFixed(2)}` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center px-1 text-[10px] font-mono">
                                                    <span className="text-slate-500">GY-61 X/Y/Z</span>
                                                    <span className="text-slate-700">
                                                        {data.sensors?.gy61 ? `${data.sensors.gy61.x.toFixed(2)}, ${data.sensors.gy61.y.toFixed(2)}, ${data.sensors.gy61.z.toFixed(2)}` : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}
        </group>
    );
};
