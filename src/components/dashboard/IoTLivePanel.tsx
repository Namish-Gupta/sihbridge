import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { USE_MOCK_DATA, WS_URL } from '../../config';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Thermometer, Droplets, Wifi, WifiOff, Server, AlertTriangle } from 'lucide-react';

export const IoTLivePanel: React.FC = () => {
    const wsConnectionState = useSHMStore((s) => s.wsConnectionState);
    const selectedNodeId = useSHMStore((s) => s.selectedNodeId);
    
    const iotData = useSHMStore((s) => selectedNodeId ? s.iotNodes[selectedNodeId] : null);
    const nodeStatus = useSHMStore((s) => selectedNodeId ? s.nodeStatuses[selectedNodeId] : null);
    const iotHistory = useSHMStore((s) => selectedNodeId ? s.iotHistoryByNode[selectedNodeId] : null);

    const bridgeHealthState = nodeStatus?.health ?? 'OFFLINE';

    return (
        <div className="space-y-6 pb-12 font-sans text-slate-800 mt-6">
            {!iotData && (
                <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-500 shadow-sm">
                    <WifiOff className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <div className="text-sm font-semibold">Waiting for telemetry...</div>
                    <div className="text-xs mt-1 text-slate-400">
                        {USE_MOCK_DATA ? 'Mock data service starting' : `Connecting to ${WS_URL}`}
                    </div>
                </div>
            )}

            {iotData && (
                <>
                    {/* TOP STATUS BAR */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Connection</div>
                            <div className="flex items-center gap-2">
                                {wsConnectionState === 'CONNECTED' ? (
                                    <><Wifi className="w-4 h-4 text-blue-500" /><span className="text-sm font-bold text-slate-700">LIVE</span></>
                                ) : (
                                    <><WifiOff className="w-4 h-4 text-slate-400" /><span className="text-sm font-bold text-slate-500">OFFLINE</span></>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">State</div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                                    bridgeHealthState === 'HEALTHY' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    bridgeHealthState === 'DAMAGED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    bridgeHealthState === 'SENSOR_ERROR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-slate-50 text-slate-500 border border-slate-200'
                                }`}>
                                    {bridgeHealthState}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Environment</div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-sm font-mono font-medium text-slate-700">
                                    <Thermometer className="w-3.5 h-3.5 text-slate-400" /> {iotData.environment.temperature.toFixed(1)}°C
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-mono font-medium text-slate-700">
                                    <Droplets className="w-3.5 h-3.5 text-slate-400" /> {iotData.environment.humidity.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm flex flex-col justify-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strain</div>
                            <div className="flex items-center gap-1.5 text-sm font-mono font-medium text-slate-400">
                                <Activity className="w-3.5 h-3.5" /> N/A
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* VALIDATION PANEL */}
                        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Server className="w-3.5 h-3.5" /> Validation layer
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    {iotData.validation.status === 'OK' ? (
                                        <span className="inline-flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">OK</span>
                                    ) : (
                                        <span className="inline-flex items-center text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 gap-1"><AlertTriangle className="w-3 h-3" /> FAILED</span>
                                    )}
                                </div>
                                <div className="text-[11px] text-slate-600 space-y-1">
                                    <div className="flex justify-between border-b border-slate-50 pb-1">
                                        <span>Samples processed</span><span className="font-mono font-semibold">{iotData.validation.total_samples}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-1">
                                        <span>Bad samples</span>
                                        <span className={`font-mono font-semibold ${iotData.validation.bad_samples > iotData.validation.allowed_bad_samples ? 'text-red-500' : ''}`}>
                                            {iotData.validation.bad_samples} / {iotData.validation.allowed_bad_samples}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Max deviation</span><span className="font-mono font-semibold">{iotData.validation.maximum_deviation.toFixed(3)}g</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TINYML PANEL */}
                        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" /> TinyML Edge Inference
                            </h3>
                            {iotData.tinyml ? (
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <span className={`inline-flex items-center text-sm font-bold px-2 py-0.5 rounded border w-fit ${
                                        iotData.tinyml.prediction === 'HEALTHY' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                        {iotData.tinyml.prediction}
                                    </span>
                                    <div className="text-[11px] text-slate-600 space-y-1 border-l border-slate-100 pl-4">
                                        <div className="flex justify-between border-b border-slate-50 pb-1">
                                            <span>Healthy prob</span><span className="font-mono font-semibold text-green-600">{(iotData.tinyml.healthy_probability * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Damage prob</span><span className="font-mono font-semibold text-red-600">{(iotData.tinyml.damage_probability * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic">Awaiting inference...</div>
                            )}
                        </div>
                    </div>

                    {/* ACCELEROMETER METRICS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AccelCard label="MPU6500" sublabel="Primary" x={iotData.sensors.mpu6500.x} y={iotData.sensors.mpu6500.y} z={iotData.sensors.mpu6500.z} />
                        <AccelCard label="ADXL345" sublabel="Secondary" x={iotData.sensors.adxl345.x} y={iotData.sensors.adxl345.y} z={iotData.sensors.adxl345.z} />
                        <AccelCard label="GY-61" sublabel="Validation" x={iotData.sensors.gy61.x} y={iotData.sensors.gy61.y} z={iotData.sensors.gy61.z} />
                    </div>

                    {/* CHARTS */}
                    {iotHistory && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <ChartPanel title="Acceleration (MPU6500)" series={[
                                { data: iotHistory.mpu6500_x, label: 'X', color: '#64748b' },
                                { data: iotHistory.mpu6500_y, label: 'Y', color: '#94a3b8' },
                                { data: iotHistory.mpu6500_z, label: 'Z', color: '#cbd5e1' },
                            ]} />
                            <ChartPanel title="Damage Probability" series={[
                                { data: iotHistory.damage_probability, label: 'Damage %', color: '#ef4444' },
                            ]} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const AccelCard: React.FC<{ label: string; sublabel: string; x: number; y: number; z: number }> = ({ label, sublabel, x, y, z }) => (
    <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
        <div className="flex justify-between items-baseline mb-3 border-b border-slate-100 pb-2">
            <span className="text-[12px] font-bold text-slate-700">{label}</span>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">{sublabel}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-slate-50 border border-slate-100 rounded p-1">
                <div className="text-slate-400 mb-0.5">X</div>
                <div className="font-mono font-medium text-slate-700">{x.toFixed(3)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded p-1">
                <div className="text-slate-400 mb-0.5">Y</div>
                <div className="font-mono font-medium text-slate-700">{y.toFixed(3)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded p-1">
                <div className="text-slate-400 mb-0.5">Z</div>
                <div className="font-mono font-medium text-slate-700">{z.toFixed(3)}</div>
            </div>
        </div>
    </div>
);

const ChartPanel: React.FC<{ title: string; series: { data: { value: number }[]; label: string; color: string }[] }> = ({ title, series }) => {
    const maxPoints = 60;
    const longestSeries = series.reduce((a, b) => (a.data.length > b.data.length ? a : b), series[0]);
    const recent = longestSeries.data.slice(-maxPoints);

    const chartData = recent.map((_, i) => {
        const point: Record<string, number | string> = { idx: i };
        series.forEach((s) => {
            const offset = s.data.length - recent.length;
            const dataIdx = i + (offset > 0 ? offset : 0);
            point[s.label] = s.data[dataIdx]?.value ?? 0;
        });
        return point;
    });

    return (
        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{title}</div>
            <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="idx" hide />
                    <YAxis width={40} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }} />
                    {series.map((s) => (
                        <Line key={s.label} type="monotone" dataKey={s.label} stroke={s.color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
