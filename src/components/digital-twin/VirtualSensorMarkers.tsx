import React from 'react';
import { Html } from '@react-three/drei';
import { useSHMStore } from '../../store/useSHMStore';
import { Activity } from 'lucide-react';
import { VirtualSensorPopover } from './VirtualSensorPopover';

export const VirtualSensorMarkers: React.FC = () => {
    const pinnData = useSHMStore((state) => state.pinnData);
    const selectedVirtualSensorId = useSHMStore((state) => state.selectedVirtualSensorId);
    const selectVirtualSensor = useSHMStore((state) => state.selectVirtualSensor);

    if (!pinnData || pinnData.status !== 'success' || !pinnData.virtual_sensors) {
        return null;
    }

    return (
        <group>
            {pinnData.virtual_sensors.map((sensor) => {
                // The physical bridge deck spans from roughly -60 (Left Abutment) to +60 (Right Abutment)
                // We linearly interpolate x_normalized (0.0 to 1.0) onto this -60 to +60 range.
                // 0.0 -> -60
                // 1.0 -> 60
                const xPos = (sensor.x_normalized * 120) - 60;
                const isDamaged = sensor.predicted_state === 'DAMAGED';
                const isSelected = selectedVirtualSensorId === sensor.sensor_id;

                return (
                    <group key={sensor.sensor_id} position={[xPos, 6.2, 3]}>
                        <mesh
                            onClick={(e) => {
                                e.stopPropagation();
                                selectVirtualSensor(isSelected ? null : sensor.sensor_id);
                            }}
                        >
                            <sphereGeometry args={[isSelected ? 0.6 : 0.4, 16, 16]} />
                            <meshStandardMaterial
                                color={isDamaged ? '#ef4444' : '#8b5cf6'}
                                emissive={isDamaged ? '#ef4444' : '#8b5cf6'}
                                emissiveIntensity={isDamaged ? 1.0 : 0.6}
                                transparent
                                opacity={0.8}
                            />
                        </mesh>
                        
                        {/* We only render the huge popover if the user explicitly clicked this sensor */}
                        {isSelected && (
                            <VirtualSensorPopover sensor={sensor} onClose={() => selectVirtualSensor(null)} />
                        )}
                        
                        {/* Always show a tiny badge for context, similar to physical sensors, but distinct */}
                        {!isSelected && (
                            <Html position={[0, 0.8, 0]} center zIndexRange={[50, 0]}>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectVirtualSensor(sensor.sensor_id);
                                    }}
                                    className="cursor-pointer hover:scale-110 transition-transform select-none"
                                >
                                    <div className={`flex items-center justify-center px-1.5 py-0.5 rounded shadow-lg backdrop-blur-md text-[9px] font-bold border ${isDamaged ? 'bg-red-950/80 border-red-500 text-red-200' : 'bg-purple-950/80 border-purple-500 text-purple-200'}`}>
                                        <Activity className="w-2.5 h-2.5 mr-0.5" />
                                        {sensor.sensor_id}
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
