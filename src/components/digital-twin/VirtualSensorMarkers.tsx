import React from 'react';
import { Html } from '@react-three/drei';
import { useSHMStore } from '../../store/useSHMStore';
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
            {pinnData.virtual_sensors.map((sensor, index) => {
                const xPos = (sensor.x_normalized * 120) - 60;
                const isDamaged = sensor.predicted_state === 'DAMAGED';
                const isSelected = selectedVirtualSensorId === sensor.sensor_id;
                
                // Alternate label heights to prevent overlap along the deck
                const isEven = index % 2 === 0;
                const stickHeight = isEven ? 1.0 : 1.8;
                const labelY = stickHeight + 0.2;

                return (
                    <group key={sensor.sensor_id} position={[xPos, 8.5, 0.5]}>
                        {/* Antenna Stick */}
                        <mesh position={[0, stickHeight / 2, 0]}>
                            <cylinderGeometry args={[0.02, 0.02, stickHeight]} />
                            <meshStandardMaterial color="#94a3b8" />
                        </mesh>

                        {/* Physical Sensor Marker (Clear Red/Green Sphere) */}
                        <mesh
                            renderOrder={10}
                            onClick={(e) => {
                                e.stopPropagation();
                                selectVirtualSensor(isSelected ? null : sensor.sensor_id);
                            }}
                        >
                            <sphereGeometry args={[isSelected ? 0.45 : 0.35, 16, 16]} />
                            <meshStandardMaterial
                                color={isDamaged ? '#ef4444' : '#22c55e'}
                                roughness={0.6}
                                depthTest={false}
                            />
                            {isSelected && (
                                <meshBasicMaterial color="#3b82f6" wireframe depthTest={false} />
                            )}
                        </mesh>
                        
                        {/* Offset Label (Visible when NOT selected) */}
                        {!isSelected && (
                            <Html position={[0, labelY, 0]} center zIndexRange={[50, 0]}>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectVirtualSensor(sensor.sensor_id);
                                    }}
                                    className="cursor-pointer select-none whitespace-nowrap bg-white border border-slate-300 text-slate-700 font-semibold text-[11px] rounded px-1.5 py-0.5 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-colors"
                                >
                                    {sensor.sensor_id}
                                </div>
                            </Html>
                        )}

                        {/* Detail Popover */}
                        {isSelected && (
                            <VirtualSensorPopover sensor={sensor} onClose={() => selectVirtualSensor(null)} />
                        )}
                    </group>
                );
            })}
        </group>
    );
};
