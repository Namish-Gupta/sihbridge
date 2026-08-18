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
    ChevronDown,
    ChevronUp,
    Wifi,
    WifiOff,
    Radio,
} from 'lucide-react';

// ============================================================
// Helper: format time-ago string from a timestamp
// ============================================================
function timeAgo(ts: number | null): string {
    if (ts === null) return 'No data';
    const elapsed = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (elapsed < 5) return 'Just now';
    if (elapsed < 60) return `${elapsed}s ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    return `${Math.floor(elapsed / 3600)}h ago`;
}

// ============================================================
// Mini Sparkline chart component
// ============================================================
interface SparklineProps {
    data: { receivedAt: number; value: number }[];
    color: string;
    height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 40 }) => {
    if (data.length < 2) return <div className="h-10 flex items-center justify-center text-[10px] text-slate-500">Collecting data…</div>;

    const chartData = data.slice(-60).map((p, i) => ({
        idx: i,
        value: Math.round(p.value * 1000) / 1000,
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

// ============================================================
// Accelerometer Card
// ============================================================
interface AccelCardProps {
    label: string;
    sublabel: string;
    x: number;
    y: number;
    z: number;
    borderColor: string;
    bgColor: string;
    textColor: string;
    histX: { receivedAt: number; value: number }[];
    histY: { receivedAt: number; value: number }[];
    histZ: { receivedAt: number; value: number }[];
}

const AccelCard: React.FC<AccelCardProps> = ({
    label, sublabel, x, y, z,
    borderColor, bgColor, textColor,
    histX, histY, histZ
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-3 space-y-2`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className={`text-xs font-bold ${textColor}`}>{label}</div>
                    <div className="text-[10px] text-slate-400">{sublabel}</div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                >
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-slate-950/50 rounded px-2 py-1.5 text-center">
                    <div className="text-[10px] text-slate-500">X</div>
                    <div className="font-bold text-slate-100">{x.toFixed(3)} g</div>
                </div>
                <div className="bg-slate-950/50 rounded px-2 py-1.5 text-center">
                    <div className="text-[10px] text-slate-500">Y</div>
                    <div className="font-bold text-slate-100">{y.toFixed(3)} g</div>
                </div>
                <div className="bg-slate-950/50 rounded px-2 py-1.5 text-center">
                    <div className="text-[10px] text-slate-500">Z</div>
                    <div className="font-bold text-slate-100">{z.toFixed(3)} g</div>
                </div>
            </div>
            {expanded && (
                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                    <div className="text-[10px] text-slate-400">X axis</div>
                    <Sparkline data={histX} color="#06b6d4" />
                    <div className="text-[10px] text-slate-400">Y axis</div>
                    <Sparkline data={histY} color="#8b5cf6" />
                    <div className="text-[10px] text-slate-400">Z axis</div>
                    <Sparkline data={histZ} color="#10b981" />
                </div>
            )}
        </div>
    );
};

// ============================================================
// Main IoT Live Panel
// ============================================================
export const IoTLivePanel: React.FC = () => {
    const iotData = useSHMStore((s) => s.iotData);
    const bridgeHealthState = useSHMStore((s) => s.bridgeHealthState);
    const wsConnectionState = useSHMStore((s) => s.wsConnectionState);
    const lastIoTTimestamp = useSHMStore((s) => s.lastIoTTimestamp);
    const iotHistory = useSHMStore((s) => s.iotHistory);

    // Force re-render every second for time-ago display
    const [, setTick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTick((v) => v + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const [chartsExpanded, setChartsExpanded] = useState(false);

    // Health state badge
    const healthBadge = () => {
        switch (bridgeHealthState) {
            case 'HEALTHY':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-bold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        HEALTHY
                    </span>
                );
            case 'DAMAGED':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-500/50 text-xs font-bold font-mono animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        DAMAGED
                    </span>
                );
            case 'SENSOR_ERROR':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/50 text-xs font-bold font-mono animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        SENSOR ERROR
                    </span>
                );
            case 'OFFLINE':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-600 text-xs font-bold font-mono">
                        <WifiOff className="w-3.5 h-3.5" />
                        OFFLINE
                    </span>
                );
        }
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
                        <Radio className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-wide">ESP32-S3 IoT Live Feed</h2>
                        <p className="text-[10px] text-slate-400">
                            Node: {iotData?.node_id || '—'} · {USE_MOCK_DATA ? 'Mock Data' : 'Live WebSocket'} · {timeAgo(lastIoTTimestamp)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {healthBadge()}
                    {/* WebSocket indicator */}
                    <div className={`flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2 py-1 rounded border ${
                        wsConnectionState === 'CONNECTED'
                            ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400'
                            : wsConnectionState === 'RECONNECTING' || wsConnectionState === 'CONNECTING'
                                ? 'bg-amber-950/50 border-amber-500/30 text-amber-400'
                                : 'bg-red-950/50 border-red-500/30 text-red-400'
                    }`}>
                        {wsConnectionState === 'CONNECTED' ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> <Wifi className="w-3 h-3" /></>
                        ) : (
                            <WifiOff className="w-3 h-3" />
                        )}
                        <span>{wsConnectionState}</span>
                    </div>
                </div>
            </div>

            {/* No data state */}
            {!iotData && (
                <div className="p-8 text-center text-sm text-slate-500">
                    <WifiOff className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <div className="font-semibold">Waiting for ESP32 data…</div>
                    <div className="text-xs mt-1">
                        {USE_MOCK_DATA
                            ? 'Mock data service starting…'
                            : `Connecting to ${WS_URL}…`}
                    </div>
                </div>
            )}

            {iotData && (
                <div className="p-4 space-y-4">
                    {/* ---- Accelerometers ---- */}
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            Accelerometers (calibrated, in g)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <AccelCard
                                label="MPU6500"
                                sublabel="Primary TinyML Stream"
                                x={iotData.sensors.mpu6500.x}
                                y={iotData.sensors.mpu6500.y}
                                z={iotData.sensors.mpu6500.z}
                                borderColor="border-cyan-500/30"
                                bgColor="bg-cyan-950/20"
                                textColor="text-cyan-300"
                                histX={iotHistory.mpu6500_x}
                                histY={iotHistory.mpu6500_y}
                                histZ={iotHistory.mpu6500_z}
                            />
                            <AccelCard
                                label="ADXL345"
                                sublabel="Secondary TinyML Stream"
                                x={iotData.sensors.adxl345.x}
                                y={iotData.sensors.adxl345.y}
                                z={iotData.sensors.adxl345.z}
                                borderColor="border-purple-500/30"
                                bgColor="bg-purple-950/20"
                                textColor="text-purple-300"
                                histX={iotHistory.adxl345_x}
                                histY={iotHistory.adxl345_y}
                                histZ={iotHistory.adxl345_z}
                            />
                            <AccelCard
                                label="GY-61"
                                sublabel="Reference / Validation Only"
                                x={iotData.sensors.gy61.x}
                                y={iotData.sensors.gy61.y}
                                z={iotData.sensors.gy61.z}
                                borderColor="border-slate-700"
                                bgColor="bg-slate-800/30"
                                textColor="text-slate-300"
                                histX={iotHistory.gy61_x}
                                histY={iotHistory.gy61_y}
                                histZ={iotHistory.gy61_z}
                            />
                        </div>
                    </div>

                    {/* ---- Environment + Strain + Validation + TinyML Grid ---- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Environment */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Thermometer className="w-3 h-3 text-amber-400" />
                                Environment (DHT11)
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <Thermometer className="w-3 h-3 text-red-400" /> Temperature
                                </span>
                                <span className="font-bold text-white">{iotData.environment.temperature.toFixed(1)} °C</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                                </span>
                                <span className="font-bold text-white">{iotData.environment.humidity.toFixed(1)} %</span>
                            </div>
                            <Sparkline data={iotHistory.temperature} color="#f59e0b" height={30} />
                        </div>

                        {/* Strain */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Strain Gauge (HX711)
                            </div>
                            {iotData.strain.value === null ? (
                                <div className="flex items-center justify-center py-3">
                                    <span className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono font-semibold">
                                        Pending Integration
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <span className="text-slate-400">Value</span>
                                        <span className="font-bold text-white">{iotData.strain.value} {iotData.strain.unit}</span>
                                    </div>
                                    <Sparkline data={iotHistory.strain} color="#64748b" height={30} />
                                </>
                            )}
                        </div>

                        {/* Sensor Validation */}
                        <div className={`border rounded-lg p-3 space-y-2 ${
                            iotData.validation.status === 'OK'
                                ? 'bg-emerald-950/20 border-emerald-500/30'
                                : 'bg-red-950/30 border-red-500/40'
                        }`}>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                {iotData.validation.status === 'OK' ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />
                                )}
                                Sensor Validation
                            </div>
                            <div className="flex items-center justify-center py-1">
                                {iotData.validation.status === 'OK' ? (
                                    <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-bold font-mono">
                                        SENSORS NORMAL
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded bg-red-950 text-red-300 border border-red-500/50 text-xs font-bold font-mono animate-pulse">
                                        SENSOR MALFUNCTION
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Bad samples</span>
                                    <span className={iotData.validation.bad_samples > iotData.validation.allowed_bad_samples ? 'text-red-400 font-bold' : ''}>
                                        {iotData.validation.bad_samples} / {iotData.validation.allowed_bad_samples} allowed
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Max deviation</span>
                                    <span>{iotData.validation.maximum_deviation.toFixed(3)}</span>
                                </div>
                            </div>
                        </div>

                        {/* TinyML Prediction */}
                        <div className={`border rounded-lg p-3 space-y-2 ${
                            iotData.validation.status !== 'OK'
                                ? 'bg-slate-800/30 border-slate-700 opacity-70'
                                : iotData.tinyml?.prediction === 'DAMAGED'
                                    ? 'bg-red-950/30 border-red-500/40'
                                    : 'bg-emerald-950/20 border-emerald-500/30'
                        }`}>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Cpu className="w-3 h-3 text-purple-400" />
                                TinyML Inference (ESP32)
                            </div>

                            {iotData.validation.status !== 'OK' ? (
                                /* Validation failed → TinyML blocked */
                                <div className="text-center py-2 space-y-1.5">
                                    <span className="px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono font-semibold">
                                        UNAVAILABLE
                                    </span>
                                    <div className="text-[10px] text-amber-400 font-medium">
                                        Blocked by sensor validation failure
                                    </div>
                                </div>
                            ) : iotData.tinyml === null ? (
                                /* Validation OK but no TinyML result yet */
                                <div className="text-center py-2">
                                    <span className="px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono font-semibold">
                                        INFERENCE PENDING
                                    </span>
                                </div>
                            ) : (
                                /* TinyML result available */
                                <>
                                    <div className="flex items-center justify-center py-1">
                                        {iotData.tinyml.prediction === 'HEALTHY' ? (
                                            <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-bold font-mono flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                HEALTHY
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded bg-red-950 text-red-300 border border-red-500/50 text-xs font-bold font-mono flex items-center gap-1.5 animate-pulse">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                DAMAGED
                                            </span>
                                        )}
                                    </div>
                                    {/* Probability bars */}
                                    <div className="text-[11px] font-mono space-y-1.5">
                                        <div>
                                            <div className="flex justify-between text-slate-400 mb-0.5">
                                                <span>Healthy</span>
                                                <span className="text-emerald-300">{(iotData.tinyml.healthy_probability * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${iotData.tinyml.healthy_probability * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-slate-400 mb-0.5">
                                                <span>Damage</span>
                                                <span className="text-red-300">{(iotData.tinyml.damage_probability * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${iotData.tinyml.damage_probability * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ---- Expandable Detailed Charts ---- */}
                    <div className="border-t border-slate-800 pt-3">
                        <button
                            onClick={() => setChartsExpanded(!chartsExpanded)}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                        >
                            {chartsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {chartsExpanded ? 'Hide' : 'Show'} Real-Time Charts
                        </button>

                        {chartsExpanded && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ChartPanel title="MPU6500 Acceleration" series={[
                                    { data: iotHistory.mpu6500_x, label: 'X', color: '#06b6d4' },
                                    { data: iotHistory.mpu6500_y, label: 'Y', color: '#8b5cf6' },
                                    { data: iotHistory.mpu6500_z, label: 'Z', color: '#10b981' },
                                ]} unit="g" />
                                <ChartPanel title="ADXL345 Acceleration" series={[
                                    { data: iotHistory.adxl345_x, label: 'X', color: '#06b6d4' },
                                    { data: iotHistory.adxl345_y, label: 'Y', color: '#8b5cf6' },
                                    { data: iotHistory.adxl345_z, label: 'Z', color: '#10b981' },
                                ]} unit="g" />
                                <ChartPanel title="GY-61 Reference" series={[
                                    { data: iotHistory.gy61_x, label: 'X', color: '#06b6d4' },
                                    { data: iotHistory.gy61_y, label: 'Y', color: '#8b5cf6' },
                                    { data: iotHistory.gy61_z, label: 'Z', color: '#10b981' },
                                ]} unit="g" />
                                <ChartPanel title="Environment" series={[
                                    { data: iotHistory.temperature, label: 'Temp °C', color: '#f59e0b' },
                                    { data: iotHistory.humidity, label: 'Humidity %', color: '#3b82f6' },
                                ]} unit="" />
                                <ChartPanel title="Damage Probability" series={[
                                    { data: iotHistory.damage_probability, label: 'P(damage)', color: '#ef4444' },
                                ]} unit="" />
                            </div>
                        )}
                    </div>
                </div>
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
    unit: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ title, series, unit }) => {
    // Merge all series into a single dataset indexed by time
    const maxPoints = 120;
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
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</div>
            <ResponsiveContainer width="100%" height={100}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="idx" hide />
                    <YAxis width={35} tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(v: number) => v.toFixed(2)} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            fontSize: '11px',
                        }}
                    />
                    {series.map((s) => (
                        <Line
                            key={s.label}
                            type="monotone"
                            dataKey={s.label}
                            stroke={s.color}
                            strokeWidth={1.5}
                            dot={false}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
