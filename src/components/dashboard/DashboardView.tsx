import React from 'react';
import { StructuralHealthOverview } from './StructuralHealthOverview';
import { DigitalTwinView } from '../digital-twin/DigitalTwinView';
import { HistoricalTimeline } from '../analytics/HistoricalTimeline';
import { useSHMStore } from '../../store/useSHMStore';
import {
    AlertOctagon,
    Sparkles,
    ArrowRight,
    Sliders,
    Activity,
    Cpu,
    ShieldCheck
} from 'lucide-react';

export const DashboardView: React.FC = () => {
    const anomalies = useSHMStore((state) => state.anomalies);
    const focusAnomaly = useSHMStore((state) => state.focusAnomaly);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    const activeAnomalies = anomalies.filter((a) => a.status === 'ACTIVE');

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 overflow-y-auto h-full">
            {/* Top Structural Health Score Gauge */}
            <StructuralHealthOverview />

            {/* Main Split Layout: 3D Digital Twin (Left) vs Active Intelligence Panel (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* 3D Digital Twin View Container */}
                <div className="lg:col-span-7 h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
                    <DigitalTwinView />
                </div>

                {/* Right Active Intelligence & Alert Queue */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    {/* Active Alerts Panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <AlertOctagon className="w-4 h-4 text-red-400 animate-bounce" />
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-white">Active Structural Anomalies ({activeAnomalies.length})</h3>
                                </div>
                                <button
                                    onClick={() => setActiveTab('alerts')}
                                    className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                    Alert Center <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="space-y-3 mt-3">
                                {activeAnomalies.map((anomaly) => (
                                    <div
                                        key={anomaly.id}
                                        className="bg-red-950/30 border border-red-500/40 p-3 rounded-lg space-y-2 hover:bg-red-900/40 transition cursor-pointer"
                                        onClick={() => {
                                            focusAnomaly(anomaly.id);
                                            setActiveTab('decision-support');
                                        }}
                                    >
                                        <div className="flex items-center justify-between text-xs font-bold text-red-300">
                                            <span>{anomaly.componentName}</span>
                                            <span className="font-mono text-[10px] bg-red-900/80 px-1.5 py-0.5 rounded">{anomaly.severity}</span>
                                        </div>

                                        <div className="text-xs text-slate-300 font-mono">
                                            {anomaly.parameter}: <strong className="text-white">{anomaly.observedValue} με</strong> vs Base: <span className="text-slate-400">{anomaly.baselineValue} με</span> (<span className="text-red-400 font-bold">+{anomaly.deviationPercentage}%</span>)
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] pt-1 text-purple-300">
                                            <span className="flex items-center gap-1 font-semibold">
                                                <Sparkles className="w-3 h-3 text-purple-400" />
                                                AI Model Confidence: {anomaly.confidence}%
                                            </span>
                                            <span className="text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-0.5">
                                                Inspect Reasoning Chain <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick State 0 Baseline Shortcut */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-cyan-400" />
                                <div>
                                    <div className="font-bold text-slate-200">State 0 Baseline Comparison</div>
                                    <div className="text-[10px] text-slate-400">Pier P3 strain elevated +24.9% from State 0</div>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveTab('baseline')}
                                className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1"
                            >
                                Compare
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Historical Degradation Timeline */}
            <HistoricalTimeline />
        </div>
    );
};
