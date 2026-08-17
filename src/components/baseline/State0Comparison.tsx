import React from 'react';
import { useSHMStore, State0Mode } from '../../store/useSHMStore';
import {
    Sliders,
    Layers,
    Columns,
    GitCompare,
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Activity
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';

export const State0Comparison: React.FC = () => {
    const state0Mode = useSHMStore((state) => state.state0Mode);
    const setState0Mode = useSHMStore((state) => state.setState0Mode);
    const state0SliderPos = useSHMStore((state) => state.state0SliderPos);
    const setState0SliderPos = useSHMStore((state) => state.setState0SliderPos);
    const sensors = useSHMStore((state) => state.sensors);
    const components = useSHMStore((state) => state.components);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    // Comparison data for bar chart
    const comparisonData = sensors.map((sensor) => ({
        name: sensor.id,
        location: sensor.location,
        state0: sensor.baselineValue,
        current: sensor.value,
        unit: sensor.unit,
        deltaPct: Number((((sensor.value - sensor.baselineValue) / sensor.baselineValue) * 100).toFixed(1)),
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            {/* Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                        <Sliders className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-white uppercase tracking-wide">State 0 Baseline Comparison Engine</h1>
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                COMMISSIONING BASELINE (JAN 2024)
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Comparative analysis of current structural response against virgin healthy baseline state
                        </p>
                    </div>
                </div>

                {/* Interaction Mode Selector */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setState0Mode('slider')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${state0Mode === 'slider'
                                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <GitCompare className="w-3.5 h-3.5" />
                        Timeline Slider
                    </button>

                    <button
                        onClick={() => setState0Mode('overlay')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${state0Mode === 'overlay'
                                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        Overlay View
                    </button>

                    <button
                        onClick={() => setState0Mode('split')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${state0Mode === 'split'
                                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Columns className="w-3.5 h-3.5" />
                        Split View
                    </button>

                    <button
                        onClick={() => setState0Mode('difference')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${state0Mode === 'difference'
                                ? 'bg-red-950 text-red-200 border border-red-500/50 font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                        Difference View
                    </button>
                </div>
            </div>

            {/* --- TIMELINE SLIDER CONTROL --- */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-slate-200">STATE 0 (Jan 2024 Baseline)</span>
                        <span className="text-slate-500">| Health Index: 98/100</span>
                    </div>

                    <div className="text-center font-bold text-cyan-300 bg-slate-950 px-4 py-1 rounded border border-slate-800">
                        {state0SliderPos === 0
                            ? 'Viewing State 0 Virgin Baseline'
                            : state0SliderPos === 100
                                ? 'Viewing Current Operational State (Aug 2026)'
                                : `Interpolated Blend State (${state0SliderPos}%)`}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">CURRENT STATE (Aug 2026)</span>
                        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                        <span className="text-slate-500">| Health Index: 82/100</span>
                    </div>
                </div>

                {/* Interactive Range Input Slider */}
                <div className="relative flex items-center">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={state0SliderPos}
                        onChange={(e) => setState0SliderPos(Number(e.target.value))}
                        className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
                    />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0% (State 0 Commissioned)</span>
                    <span>25% (2024 Q4)</span>
                    <span>50% (2025 Mid)</span>
                    <span>75% (2026 Q1)</span>
                    <span>100% (Present Telemetry)</span>
                </div>
            </div>

            {/* --- COMPARISON METRICS SUMMARY --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Pier P3 High Delta Card */}
                <div className="bg-red-950/30 border border-red-500/50 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-400 uppercase">Pier P3 Flexural Strain</span>
                        <span className="bg-red-900/60 text-red-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">+24.9% DELTA</span>
                    </div>
                    <div className="flex items-baseline justify-between font-mono pt-2">
                        <div>
                            <span className="text-[10px] text-slate-500 block">State 0</span>
                            <span className="text-lg font-bold text-slate-300">650 με</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-red-400" />
                        <div>
                            <span className="text-[10px] text-slate-500 block">Current</span>
                            <span className="text-xl font-black text-red-400">812 με</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-red-900/50">
                        Exceeds IRC:SP:35 design serviceability limit (750 με).
                    </p>
                </div>

                {/* Girder G2 Vibration Delta Card */}
                <div className="bg-amber-950/30 border border-amber-500/50 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase">Girder G2 Peak Vibration</span>
                        <span className="bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">+61.9% DELTA</span>
                    </div>
                    <div className="flex items-baseline justify-between font-mono pt-2">
                        <div>
                            <span className="text-[10px] text-slate-500 block">State 0</span>
                            <span className="text-lg font-bold text-slate-300">2.1 m/s²</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                        <div>
                            <span className="text-[10px] text-slate-500 block">Current</span>
                            <span className="text-xl font-black text-amber-300">3.4 m/s²</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-amber-900/50">
                        Exceeds IRC:112 dynamic comfort comfort threshold (3.0 m/s²).
                    </p>
                </div>

                {/* Deck D1 Displacement Card */}
                <div className="bg-emerald-950/30 border border-emerald-500/50 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase">Deck D1 Deflection</span>
                        <span className="bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">+18.3% DELTA</span>
                    </div>
                    <div className="flex items-baseline justify-between font-mono pt-2">
                        <div>
                            <span className="text-[10px] text-slate-500 block">State 0</span>
                            <span className="text-lg font-bold text-slate-300">12.0 mm</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                        <div>
                            <span className="text-[10px] text-slate-500 block">Current</span>
                            <span className="text-xl font-black text-emerald-300">14.2 mm</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-emerald-900/50">
                        Well within IRC:24 deflection limit (25.0 mm).
                    </p>
                </div>
            </div>

            {/* --- SENSOR COMPARISON CHART --- */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Sensor Telemetry State 0 vs Current Response</h3>
                        <p className="text-xs text-slate-400">Side-by-side comparison across all installed physical and AI virtual sensors</p>
                    </div>
                </div>

                <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                formatter={(value: any, name: any) => [value, name === 'state0' ? 'State 0 Baseline' : 'Current Value']}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="state0" name="State 0 Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="current" name="Current State" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
