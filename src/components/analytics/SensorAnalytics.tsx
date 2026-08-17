import React, { useState } from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import {
    LineChart as LineChartIcon,
    Activity,
    Cpu,
    Layers,
    CheckCircle2,
    AlertTriangle,
    Info
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';

export const SensorAnalytics: React.FC = () => {
    const sensors = useSHMStore((state) => state.sensors);
    const [selectedSensorId, setSelectedSensorId] = useState<string>('VS-014');

    const selectedSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];
    const isVirtual = selectedSensor.source === 'virtual';

    // Stats calculation
    const values = selectedSensor.history.map((h) => h.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const avgVal = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    const deviation = Number((((selectedSensor.value - selectedSensor.baselineValue) / selectedSensor.baselineValue) * 100).toFixed(1));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                        <LineChartIcon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white uppercase tracking-wide">Sensor Analytics & Uncertainty Engine</h1>
                        <p className="text-xs text-slate-400">
                            Deep telemetry analysis distinguishing physical measurements from AI-inferred uncertainty bounds
                        </p>
                    </div>
                </div>

                {/* Sensor Select Dropdown */}
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">Select Sensor Node:</span>
                    <select
                        value={selectedSensorId}
                        onChange={(e) => setSelectedSensorId(e.target.value)}
                        className="bg-slate-900 text-cyan-300 font-mono text-xs font-bold border border-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-cyan-500"
                    >
                        {sensors.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.id} — {s.name} ({s.source === 'physical' ? 'MEASURED' : 'AI-INFERRED'})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sensor Metadata & Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-sans font-semibold uppercase">Sensor Node Type</div>
                    <div className="flex items-center gap-2 pt-1">
                        {selectedSensor.source === 'physical' ? (
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                                PHYSICAL (MEASURED)
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                                AI-VIRTUAL (INFERRED)
                            </span>
                        )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans pt-1">{selectedSensor.location}</div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-sans font-semibold uppercase">Current Value / Baseline</div>
                    <div className="text-xl font-bold text-white">
                        {selectedSensor.value} {selectedSensor.unit}
                        <span className="text-xs text-slate-400 font-normal ml-2">(Base: {selectedSensor.baselineValue})</span>
                    </div>
                    <div className={`text-xs font-bold ${deviation > 15 ? 'text-red-400' : 'text-emerald-400'}`}>
                        Delta: {deviation > 0 ? `+${deviation}` : deviation}%
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-sans font-semibold uppercase">History Summary</div>
                    <div className="text-xs text-slate-300 space-y-0.5 pt-0.5">
                        <div>Min: <strong className="text-slate-100">{minVal} {selectedSensor.unit}</strong></div>
                        <div>Max: <strong className="text-slate-100">{maxVal} {selectedSensor.unit}</strong></div>
                        <div>Avg: <strong className="text-slate-100">{avgVal} {selectedSensor.unit}</strong></div>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-sans font-semibold uppercase">AI Confidence Rating</div>
                    {isVirtual && selectedSensor.confidence ? (
                        <div className="space-y-1 pt-0.5">
                            <div className="text-lg font-bold text-purple-300">{selectedSensor.confidence}% Confidence</div>
                            <div className="text-[10px] text-slate-400 font-sans">{selectedSensor.modelType || 'Neural Network'}</div>
                        </div>
                    ) : (
                        <div className="text-xs font-sans text-cyan-300 pt-1 font-semibold">
                            Direct Physical Telemetry (Zero Model Variance)
                        </div>
                    )}
                </div>
            </div>

            {/* --- TIME SERIES CHART WITH SHADED UNCERTAINTY BAND --- */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                            {selectedSensor.name} — Time Series Response Curve
                        </h3>
                        <p className="text-xs text-slate-400">
                            {isVirtual
                                ? 'Shaded region indicates 95% Bayesian confidence uncertainty interval around estimated prediction'
                                : 'Direct physical sensor telemetry timeline'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-cyan-400"></span>
                            <span className="text-slate-300">{isVirtual ? 'Estimated Reading' : 'Measured Telemetry'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-slate-500 border-dashed border-t"></span>
                            <span className="text-slate-400">State 0 Baseline</span>
                        </div>
                        {isVirtual && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 bg-purple-500/30 rounded border border-purple-500/50"></span>
                                <span className="text-purple-300">Uncertainty Bounds</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-80 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedSensor.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            />

                            {/* Shaded Uncertainty Upper & Lower Band for Virtual Sensors */}
                            {isVirtual && (
                                <>
                                    <Area
                                        type="monotone"
                                        dataKey="uncertaintyUpper"
                                        stroke="transparent"
                                        fill="#8b5cf6"
                                        fillOpacity={0.25}
                                        name="Upper Bound (95%)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="uncertaintyLower"
                                        stroke="transparent"
                                        fill="#090d16"
                                        fillOpacity={1.0}
                                        name="Lower Bound (95%)"
                                    />
                                </>
                            )}

                            {/* Baseline Line */}
                            <Line
                                type="monotone"
                                dataKey="baseline"
                                stroke="#64748b"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                dot={false}
                                name="Baseline"
                            />

                            {/* Measured / Inferred Main Line */}
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={isVirtual ? '#8b5cf6' : '#06b6d4'}
                                strokeWidth={3}
                                dot={{ r: 3, fill: isVirtual ? '#8b5cf6' : '#06b6d4' }}
                                name={isVirtual ? 'Inferred Value' : 'Measured Value'}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
