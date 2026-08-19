import React from 'react';
import { Html } from '@react-three/drei';
import { PinnVirtualSensor } from '../../types/shm';
import { X } from 'lucide-react';

interface Props {
    sensor: PinnVirtualSensor;
    onClose: () => void;
}

export const VirtualSensorPopover: React.FC<Props> = ({ sensor, onClose }) => {
    return (
        <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
            <div className="w-[320px] bg-white border border-slate-300 shadow-md rounded flex flex-col font-sans text-slate-800 text-[11px] select-none">
                {/* Header */}
                <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200 bg-slate-50">
                    <span className="font-semibold tracking-wide text-slate-700">{sensor.sensor_id}</span>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-400 hover:text-slate-700">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Primary Data */}
                <div className="p-3 border-b border-slate-200 space-y-1.5">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-semibold ${sensor.predicted_state === 'HEALTHY' ? 'text-green-600' : 'text-red-600'}`}>
                            {sensor.predicted_state}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Damage probability</span>
                        <span className="font-mono">{sensor.damage_probability_pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Position</span>
                        <span className="font-mono">x = {(sensor.x_normalized * 120 - 60).toFixed(1)} m</span>
                    </div>
                </div>

                {/* Sensor Features */}
                <div className="px-3 py-2 bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                    Sensor features
                </div>
                
                <div className="p-3 max-h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                    <FeatureTable title="MPU6500" features={[
                        { label: 'X mean', value: sensor.mpu_x_mean },
                        { label: 'Y mean', value: sensor.mpu_y_mean },
                        { label: 'Z mean', value: sensor.mpu_z_mean },
                        { label: 'X std', value: sensor.mpu_x_std },
                        { label: 'Y std', value: sensor.mpu_y_std },
                        { label: 'Z std', value: sensor.mpu_z_std },
                        { label: 'X ptp', value: sensor.mpu_x_ptp },
                        { label: 'Y ptp', value: sensor.mpu_y_ptp },
                        { label: 'Z ptp', value: sensor.mpu_z_ptp },
                    ]} />

                    <FeatureTable title="ADXL345" features={[
                        { label: 'X mean', value: sensor.adxl_x_mean },
                        { label: 'Y mean', value: sensor.adxl_y_mean },
                        { label: 'Z mean', value: sensor.adxl_z_mean },
                        { label: 'X std', value: sensor.adxl_x_std },
                        { label: 'Y std', value: sensor.adxl_y_std },
                        { label: 'Z std', value: sensor.adxl_z_std },
                    ]} />

                    <FeatureTable title="Strain" features={[
                        { label: 'Mean', value: sensor.strain_mean },
                        { label: 'Std', value: sensor.strain_std },
                        { label: 'Ptp', value: sensor.strain_ptp },
                    ]} />

                    <FeatureTable title="Environment" features={[
                        { label: 'Temperature', value: sensor.temperature_mean },
                        { label: 'Humidity', value: sensor.humidity_mean },
                    ]} />
                </div>
            </div>
        </Html>
    );
};

const FeatureTable: React.FC<{ title: string, features: { label: string, value: number }[] }> = ({ title, features }) => (
    <div>
        <div className="text-slate-400 font-semibold mb-1">{title}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {features.map((f, i) => (
                <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">{f.label}</span>
                    <span className="text-slate-700 font-mono">{f.value.toFixed(4)}</span>
                </div>
            ))}
        </div>
    </div>
);
