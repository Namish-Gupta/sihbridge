import React, { useState, useEffect } from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { USE_MOCK_DATA, WS_URL } from '../../config';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import {
    Activity,
    Thermometer,
    Droplets,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Cpu,
    Wifi,
    WifiOff,
} from 'lucide-react';

// ============================================================
// Accelerometer Card
// ============================================================
interface AccelCardProps {
    label: string;
    sublabel: string;
    x: number;
    y: number;
    z: number;
    colorClass: string;
}

const AccelCard: React.FC<AccelCardProps> = ({
    label, sublabel, x, y, z, colorClass
}) => {
    return (
        <div className={`bg-white border rounded-lg p-4 shadow-sm`}>
            <div className="mb-3">
                <div className={`text-sm font-bold ${colorClass}`}>{label}</div>
                <div className="text-xs text-gray-500">{sublabel}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                <div className="bg-gray-50 border rounded px-2 py-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">X</div>
                    <div className="font-bold text-gray-800">{x.toFixed(3)}</div>
                </div>
                <div className="bg-gray-50 border rounded px-2 py-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">Y</div>
                    <div className="font-bold text-gray-800">{y.toFixed(3)}</div>
                </div>
                <div className="bg-gray-50 border rounded px-2 py-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">Z</div>
                    <div className="font-bold text-gray-800">{z.toFixed(3)}</div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// Main IoT Live Panel
// ============================================================
export const IoTLivePanel: React.FC = () => {
    const wsConnectionState = useSHMStore((s) => s.wsConnectionState);
    const selectedNodeId = useSHMStore((s) => s.selectedNodeId);
    
    const iotData = useSHMStore((s) => selectedNodeId ? s.iotNodes[selectedNodeId] : null);
    const nodeStatus = useSHMStore((s) => selectedNodeId ? s.nodeStatuses[selectedNodeId] : null);
    const iotHistory = useSHMStore((s) => selectedNodeId ? s.iotHistoryByNode[selectedNodeId] : null);

    const bridgeHealthState = nodeStatus?.health ?? 'OFFLINE';

    // Health state badge
    const healthBadge = () => {
        switch (bridgeHealthState) {
            case 'HEALTHY':
                return (
                    <div className="flex flex-col items-center justify-center bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 h-full">
                        <CheckCircle2 className="w-8 h-8 mb-2" />
                        <span className="font-bold text-lg">HEALTHY</span>
                    </div>
                );
            case 'DAMAGED':
                return (
                    <div className="flex flex-col items-center justify-center bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 h-full">
                        <ShieldAlert className="w-8 h-8 mb-2" />
                        <span className="font-bold text-lg">DAMAGED</span>
                    </div>
                );
            case 'SENSOR_ERROR':
                return (
                    <div className="flex flex-col items-center justify-center bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 h-full">
                        <AlertTriangle className="w-8 h-8 mb-2" />
                        <span className="font-bold text-lg text-center">SENSOR ERROR</span>
                    </div>
                );
            case 'OFFLINE':
                return (
                    <div className="flex flex-col items-center justify-center bg-gray-100 border border-gray-300 text-gray-500 rounded-lg p-4 h-full">
                        <WifiOff className="w-8 h-8 mb-2" />
                        <span className="font-bold text-lg">OFFLINE</span>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* No data state */}
            {!iotData && (
                <div className="bg-white border rounded-lg p-12 text-center text-gray-500 shadow-sm">
                    <WifiOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-xl font-semibold text-gray-700">Waiting for ESP32 data…</div>
                    <div className="text-sm mt-2">
                        {USE_MOCK_DATA
                            ? 'Mock data service starting…'
                            : `Connecting to ${WS_URL}…`}
                    </div>
                </div>
            )}

            {iotData && (
                <>
                    {/* ROW 1: STATUS, HEALTH, TINYML */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ESP32 STATUS */}
                        <div className="bg-white border rounded-lg p-5 shadow-sm flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">ESP32 Status</div>
                            <div className={`flex-1 flex flex-col items-center justify-center rounded-lg border p-4 ${
                                wsConnectionState === 'CONNECTED'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                                {wsConnectionState === 'CONNECTED' ? (
                                    <>
                                        <Wifi className="w-8 h-8 mb-2 animate-pulse" />
                                        <span className="font-bold text-lg">LIVE</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-8 h-8 mb-2" />
                                        <span className="font-bold text-lg">OFFLINE</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* BRIDGE HEALTH */}
                        <div className="bg-white border rounded-lg p-5 shadow-sm flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Bridge Health</div>
                            <div className="flex-1">
                                {healthBadge()}
                            </div>
                        </div>

                        {/* TINYML PREDICTION */}
                        <div className="bg-white border rounded-lg p-5 shadow-sm flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <Cpu className="w-4 h-4 text-indigo-500" />
                                TinyML Prediction
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center">
                                {iotData.validation.status !== 'OK' ? (
                                    <div className="text-center">
                                        <span className="inline-block px-3 py-1 rounded bg-gray-100 text-gray-600 border font-bold">N/A</span>
                                        <div className="text-xs text-red-500 mt-2 font-medium">Sensor validation failed</div>
                                    </div>
                                ) : iotData.tinyml === null ? (
                                    <div className="text-center">
                                        <span className="inline-block px-3 py-1 rounded bg-gray-100 text-gray-600 border font-bold">PENDING</span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex justify-center mb-4">
                                            {iotData.tinyml.prediction === 'HEALTHY' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-green-100 text-green-800 border border-green-300 font-bold">
                                                    <ShieldCheck className="w-4 h-4" /> HEALTHY
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-100 text-red-800 border border-red-300 font-bold">
                                                    <ShieldAlert className="w-4 h-4" /> DAMAGED
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium">
                                                    <span>Healthy Probability</span>
                                                    <span>{(iotData.tinyml.healthy_probability * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${iotData.tinyml.healthy_probability * 100}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium">
                                                    <span>Damage Probability</span>
                                                    <span>{(iotData.tinyml.damage_probability * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${iotData.tinyml.damage_probability * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ROW 2: SENSOR VALIDATION & ENVIRONMENT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* VALIDATION */}
                        <div className="bg-white border rounded-lg p-5 shadow-sm">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Sensor Validation
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    {iotData.validation.status === 'OK' ? (
                                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 font-bold text-lg">
                                            <CheckCircle2 className="w-5 h-5" /> OK
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-lg">
                                            <AlertTriangle className="w-5 h-5" /> ERROR
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 border-l pl-4">
                                    <div className="flex justify-between">
                                        <span>Samples:</span>
                                        <span className="font-mono font-bold text-gray-800">{iotData.validation.total_samples}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Bad Samples:</span>
                                        <span className={`font-mono font-bold ${iotData.validation.bad_samples > iotData.validation.allowed_bad_samples ? 'text-red-600' : 'text-gray-800'}`}>
                                            {iotData.validation.bad_samples} / {iotData.validation.allowed_bad_samples}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Max Deviation:</span>
                                        <span className="font-mono font-bold text-gray-800">{iotData.validation.maximum_deviation.toFixed(3)} g</span>
                                    </div>
                                </div>
                            </div>
                            {iotData.validation.status !== 'OK' && (
                                <div className="mt-3 text-sm text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100">
                                    Sensor disagreement detected. Validation failed.
                                </div>
                            )}
                        </div>

                        {/* ENVIRONMENT */}
                        <div className="bg-white border rounded-lg p-5 shadow-sm">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <Thermometer className="w-4 h-4 text-orange-500" /> Environment & Strain
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 border rounded-lg p-3 text-center">
                                    <div className="text-gray-500 text-xs mb-1 flex justify-center items-center gap-1">
                                        <Thermometer className="w-3 h-3 text-red-400" /> Temp
                                    </div>
                                    <div className="font-bold text-lg text-gray-800">{iotData.environment.temperature.toFixed(1)} °C</div>
                                </div>
                                <div className="bg-gray-50 border rounded-lg p-3 text-center">
                                    <div className="text-gray-500 text-xs mb-1 flex justify-center items-center gap-1">
                                        <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                                    </div>
                                    <div className="font-bold text-lg text-gray-800">{iotData.environment.humidity.toFixed(0)} %</div>
                                </div>
                                <div className="bg-gray-50 border rounded-lg p-3 text-center">
                                    <div className="text-gray-500 text-xs mb-1 flex justify-center items-center gap-1">
                                        <Activity className="w-3 h-3 text-gray-400" /> Strain
                                    </div>
                                    <div className="font-bold text-sm text-gray-500 mt-1">Not connected</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROW 3: ACCELEROMETERS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AccelCard
                            label="MPU6500"
                            sublabel="Primary TinyML Sensor"
                            x={iotData.sensors.mpu6500.x}
                            y={iotData.sensors.mpu6500.y}
                            z={iotData.sensors.mpu6500.z}
                            colorClass="text-blue-600"
                        />
                        <AccelCard
                            label="ADXL345"
                            sublabel="Secondary TinyML Sensor"
                            x={iotData.sensors.adxl345.x}
                            y={iotData.sensors.adxl345.y}
                            z={iotData.sensors.adxl345.z}
                            colorClass="text-purple-600"
                        />
                        <AccelCard
                            label="GY-61"
                            sublabel="Validation Sensor"
                            x={iotData.sensors.gy61.x}
                            y={iotData.sensors.gy61.y}
                            z={iotData.sensors.gy61.z}
                            colorClass="text-gray-600"
                        />
                    </div>

                    {/* ROW 4: CHARTS */}
                    {iotHistory && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartPanel title="Live Acceleration / Vibration" series={[
                                { data: iotHistory.mpu6500_x, label: 'MPU6500 X', color: '#3b82f6' },
                                { data: iotHistory.mpu6500_y, label: 'MPU6500 Y', color: '#8b5cf6' },
                                { data: iotHistory.mpu6500_z, label: 'MPU6500 Z', color: '#10b981' },
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

// ============================================================
// Detailed chart panel
// ============================================================
interface ChartSeries {
    data: { receivedAt: number; value: number }[];
    label: string;
    color: string;
}

interface ChartPanelProps {
    title: string;
    series: ChartSeries[];
}

const ChartPanel: React.FC<ChartPanelProps> = ({ title, series }) => {
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
        <div className="bg-white border rounded-lg p-5 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{title}</div>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="idx" hide />
                    <YAxis width={40} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    {series.map((s) => (
                        <Line
                            key={s.label}
                            type="monotone"
                            dataKey={s.label}
                            stroke={s.color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
