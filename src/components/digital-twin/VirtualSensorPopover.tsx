import React from 'react';
import { Html } from '@react-three/drei';
import { PinnVirtualSensor } from '../../types/shm';
import { X, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
    sensor: PinnVirtualSensor;
    onClose: () => void;
}

export const VirtualSensorPopover: React.FC<Props> = ({ sensor, onClose }) => {
    const isDamaged = sensor.predicted_state === 'DAMAGED';

    return (
        <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
            <div className="w-80 bg-slate-900/95 border border-slate-700 shadow-2xl rounded-lg backdrop-blur-xl overflow-hidden text-slate-200 select-none">
                {/* Header */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDamaged ? 'bg-red-950/50 border-red-900/50' : 'bg-purple-950/50 border-purple-900/50'}`}>
                    <div className="flex items-center gap-2">
                        {isDamaged ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-purple-400" />}
                        <div>
                            <h3 className="font-bold text-sm tracking-tight text-white">{sensor.sensor_id}</h3>
                            <p className="text-[10px] text-slate-400 font-mono">Position: {sensor.x_normalized.toFixed(2)}</p>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {/* Prediction State */}
                    <div className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded border border-slate-700/50">
                        <span className="text-xs font-semibold text-slate-400">STATE</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDamaged ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                            {sensor.predicted_state}
                        </span>
                    </div>

                    {/* Probabilities */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 mb-1">Damaged Prob</div>
                            <div className="font-mono text-sm font-bold text-red-400">
                                {sensor.damage_probability_pct.toFixed(1)}%
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 mb-1">Healthy Prob</div>
                            <div className="font-mono text-sm font-bold text-emerald-400">
                                {sensor.healthy_probability_pct.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Features Sections */}
                    <div className="space-y-3">
                        <FeatureSection title="MPU6500 (Virtual)" features={[
                            { label: 'X Mean', value: sensor.mpu_x_mean },
                            { label: 'Y Mean', value: sensor.mpu_y_mean },
                            { label: 'Z Mean', value: sensor.mpu_z_mean },
                            { label: 'X RMS', value: sensor.mpu_x_rms },
                            { label: 'Y RMS', value: sensor.mpu_y_rms },
                            { label: 'Z RMS', value: sensor.mpu_z_rms },
                        ]} />
                        <FeatureSection title="ADXL345 (Virtual)" features={[
                            { label: 'X Mean', value: sensor.adxl_x_mean },
                            { label: 'Y Mean', value: sensor.adxl_y_mean },
                            { label: 'Z Mean', value: sensor.adxl_z_mean },
                            { label: 'X RMS', value: sensor.adxl_x_rms },
                            { label: 'Y RMS', value: sensor.adxl_y_rms },
                            { label: 'Z RMS', value: sensor.adxl_z_rms },
                        ]} />
                        <FeatureSection title="Strain & Environment" features={[
                            { label: 'Strain Mean', value: sensor.strain_mean },
                            { label: 'Strain PTP', value: sensor.strain_ptp },
                            { label: 'Temperature', value: sensor.temperature_mean },
                            { label: 'Humidity', value: sensor.humidity_mean },
                        ]} />
                    </div>
                </div>
            </div>
        </Html>
    );
};

const FeatureSection: React.FC<{ title: string, features: { label: string, value: number }[] }> = ({ title, features }) => (
    <div>
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {title}
        </h4>
        <div className="grid grid-cols-2 gap-1">
            {features.map((f, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-800/30 px-2 py-1 rounded text-[10px] font-mono border border-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <span className="text-slate-400">{f.label}</span>
                    <span className="text-slate-200">{f.value.toFixed(3)}</span>
                </div>
            ))}
        </div>
    </div>
);
