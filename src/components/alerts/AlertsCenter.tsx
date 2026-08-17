import React, { useState } from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import {
    AlertTriangle,
    AlertOctagon,
    CheckCircle2,
    Eye,
    Sparkles,
    Filter,
    Activity,
    Cpu,
    ArrowUpRight
} from 'lucide-react';

export const AlertsCenter: React.FC = () => {
    const anomalies = useSHMStore((state) => state.anomalies);
    const focusAnomaly = useSHMStore((state) => state.focusAnomaly);
    const acknowledgeAnomaly = useSHMStore((state) => state.acknowledgeAnomaly);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');
    const [filterSource, setFilterSource] = useState<'ALL' | 'physical' | 'virtual'>('ALL');

    const filteredAnomalies = anomalies.filter((a) => {
        if (filterSeverity !== 'ALL' && a.severity !== filterSeverity && a.status !== filterSeverity) return false;
        return true;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300">
                        <AlertOctagon className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white uppercase tracking-wide">Active Alerts & Anomaly Command Center</h1>
                        <p className="text-xs text-slate-400">
                            Real-time structural anomaly queue linked with 3D digital twin spatial focus
                        </p>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 px-2 flex items-center gap-1 font-sans">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        Filters:
                    </span>

                    <button
                        onClick={() => setFilterSeverity('ALL')}
                        className={`px-2.5 py-1 rounded transition ${filterSeverity === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        All Alerts ({anomalies.length})
                    </button>

                    <button
                        onClick={() => setFilterSeverity('CRITICAL')}
                        className={`px-2.5 py-1 rounded transition ${filterSeverity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/50 font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Critical Only
                    </button>

                    <button
                        onClick={() => setFilterSeverity('WARNING')}
                        className={`px-2.5 py-1 rounded transition ${filterSeverity === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-500/50 font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Warnings
                    </button>
                </div>
            </div>

            {/* Alerts Table / Cards */}
            <div className="space-y-4">
                {filteredAnomalies.map((anomaly) => {
                    const isCritical = anomaly.severity === 'CRITICAL';

                    return (
                        <div
                            key={anomaly.id}
                            className={`bg-slate-900 border rounded-xl p-5 shadow-xl transition-all space-y-4 ${isCritical ? 'border-red-500/50 shadow-red-950/30' : 'border-amber-500/40 shadow-amber-950/20'
                                }`}
                        >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-2.5 py-1 rounded font-mono font-bold text-xs uppercase flex items-center gap-1.5 ${isCritical
                                                ? 'bg-red-950 text-red-300 border border-red-500/50 animate-pulse'
                                                : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                                            }`}
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {anomaly.severity}
                                    </span>

                                    <div>
                                        <h2 className="text-base font-bold text-white">{anomaly.componentName}</h2>
                                        <span className="text-xs text-slate-400 font-mono">Incident ID: {anomaly.id}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => focusAnomaly(anomaly.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition"
                                    >
                                        <Eye className="w-4 h-4 text-cyan-400" />
                                        Focus in 3D Twin
                                    </button>

                                    <button
                                        onClick={() => {
                                            focusAnomaly(anomaly.id);
                                            setActiveTab('decision-support');
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-xs font-bold transition"
                                    >
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        Explainable AI
                                    </button>
                                </div>
                            </div>

                            {/* Data Metric Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
                                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                                    <span className="text-slate-500 text-[10px] block">Parameter</span>
                                    <span className="font-bold text-slate-200">{anomaly.parameter}</span>
                                </div>

                                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                                    <span className="text-slate-500 text-[10px] block">Observed Reading</span>
                                    <span className="font-bold text-white text-sm">{anomaly.observedValue} με</span>
                                </div>

                                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                                    <span className="text-slate-500 text-[10px] block">Baseline Value</span>
                                    <span className="font-bold text-slate-400 text-sm">{anomaly.baselineValue} με</span>
                                </div>

                                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                                    <span className="text-slate-500 text-[10px] block">Deviation</span>
                                    <span className="font-bold text-red-400 text-sm">+{anomaly.deviationPercentage}%</span>
                                </div>

                                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                                    <span className="text-slate-500 text-[10px] block">AI Model Confidence</span>
                                    <span className="font-bold text-purple-300 text-sm">{anomaly.confidence}%</span>
                                </div>
                            </div>

                            {/* Action Suggestion Footer */}
                            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="text-slate-300">
                                    <strong className="text-cyan-400">Action Protocol:</strong> {anomaly.recommendedAction.action}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500">
                                    Triggered: {anomaly.createdAt}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
