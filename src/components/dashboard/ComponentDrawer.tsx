import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import {
    X,
    Activity,
    Cpu,
    AlertTriangle,
    Sparkles,
    Sliders,
    Building2,
    Calendar,
    Layers,
    ArrowRight
} from 'lucide-react';

export const ComponentDrawer: React.FC = () => {
    const selectedComponentId = useSHMStore((state) => state.selectedComponentId);
    const selectComponent = useSHMStore((state) => state.selectComponent);
    const components = useSHMStore((state) => state.components);
    const sensors = useSHMStore((state) => state.sensors);
    const anomalies = useSHMStore((state) => state.anomalies);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);
    const focusAnomaly = useSHMStore((state) => state.focusAnomaly);

    if (!selectedComponentId) return null;

    const component = components.find((c) => c.id === selectedComponentId);
    if (!component) return null;

    const componentSensors = sensors.filter((s) => s.componentId === component.id);
    const componentAnomalies = anomalies.filter((a) => a.componentId === component.id && a.status === 'ACTIVE');

    return (
        <div className="w-96 bg-slate-900/95 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl z-30 overflow-y-auto">
            <div className="p-4 space-y-4">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-cyan-400" />
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase">{component.name}</h3>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {component.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => selectComponent(null)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Health Index Card */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Component Structural Health</div>
                        <div className="text-2xl font-mono font-black text-white mt-0.5">
                            {component.healthScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </div>
                    </div>
                    <span
                        className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase ${component.status === 'critical'
                                ? 'bg-red-950 text-red-300 border border-red-500/50 animate-pulse'
                                : component.status === 'warning'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            }`}
                    >
                        {component.status}
                    </span>
                </div>

                {/* Structural Spec Metadata */}
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engineering Specifications</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div>
                            <span className="text-[10px] text-slate-500 block">Material</span>
                            <span className="font-medium text-slate-200">{component.material}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 block">Design Capacity</span>
                            <span className="font-medium text-slate-200">{component.designCapacity}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 block">Span Length</span>
                            <span className="font-mono text-slate-200">{component.lengthMeters} m</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 block">Last Physical Audit</span>
                            <span className="font-mono text-slate-200">{component.lastInspectionDate}</span>
                        </div>
                    </div>
                </div>

                {/* Active Anomalies Section */}
                {componentAnomalies.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-red-400 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                Active Alerts ({componentAnomalies.length})
                            </span>
                        </div>
                        {componentAnomalies.map((anomaly) => (
                            <div
                                key={anomaly.id}
                                className="bg-red-950/40 border border-red-500/50 p-3 rounded-lg space-y-2"
                            >
                                <div className="flex items-center justify-between text-xs font-bold text-red-300">
                                    <span>{anomaly.parameter}</span>
                                    <span className="font-mono bg-red-900/60 px-1.5 py-0.5 rounded text-[10px]">{anomaly.severity}</span>
                                </div>
                                <div className="text-xs text-slate-300">
                                    Observed: <span className="font-mono font-bold text-white">{anomaly.observedValue} με</span> vs Baseline: <span className="font-mono text-slate-400">{anomaly.baselineValue} με</span> (<span className="text-red-400 font-bold">+{anomaly.deviationPercentage}%</span>)
                                </div>
                                <button
                                    onClick={() => {
                                        focusAnomaly(anomaly.id);
                                        setActiveTab('decision-support');
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-red-900/80 hover:bg-red-800 text-white text-xs font-bold transition shadow"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-red-300" />
                                    View AI Decision Support Chain
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Associated Sensors List */}
                <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Spatial Sensors ({componentSensors.length})</span>
                        <span className="text-[10px] text-slate-500 font-normal">Physical & AI Telemetry</span>
                    </div>

                    <div className="space-y-2">
                        {componentSensors.length === 0 ? (
                            <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-950 rounded border border-slate-800">
                                No direct sensor nodes attached to this section. Structural status calculated via adjacent virtual mesh.
                            </div>
                        ) : (
                            componentSensors.map((sensor) => (
                                <div
                                    key={sensor.id}
                                    className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${sensor.source === 'physical'
                                            ? 'bg-cyan-950/20 border-cyan-500/30'
                                            : 'bg-purple-950/20 border-purple-500/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            {sensor.source === 'physical' ? (
                                                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                                            ) : (
                                                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                            )}
                                            <span className="font-mono font-bold text-white">{sensor.id}</span>
                                        </div>

                                        <span
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${sensor.source === 'physical'
                                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                                }`}
                                        >
                                            {sensor.source === 'physical' ? 'MEASURED' : 'AI-INFERRED'}
                                        </span>
                                    </div>

                                    <div className="text-[11px] text-slate-300">{sensor.name}</div>

                                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs font-mono">
                                        <span className="text-slate-400">Current Reading:</span>
                                        <span className="font-bold text-white">{sensor.value} {sensor.unit}</span>
                                    </div>

                                    {sensor.source === 'virtual' && sensor.confidence && (
                                        <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono pt-0.5">
                                            <span>Model Confidence:</span>
                                            <span className="bg-purple-900/60 px-1 rounded font-bold">{sensor.confidence}% ({sensor.modelType || 'AI'})</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Action Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-2">
                <button
                    onClick={() => setActiveTab('baseline')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Compare State 0 Baseline
                </button>
            </div>
        </div>
    );
};
