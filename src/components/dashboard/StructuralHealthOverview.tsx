import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    TrendingUp,
    ChevronRight,
    Sparkles
} from 'lucide-react';

export const StructuralHealthOverview: React.FC = () => {
    const healthScore = useSHMStore((state) => state.healthScore);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);
    const focusAnomaly = useSHMStore((state) => state.focusAnomaly);

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30';
        if (score >= 80) return 'text-amber-400 border-amber-500/50 bg-amber-950/30';
        return 'text-red-400 border-red-500/50 bg-red-950/30';
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
            {/* Top Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <Activity className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Structural Health Overview</h2>
                        <p className="text-xs text-slate-400">Integrated Real-time & AI Assessment</p>
                    </div>
                </div>

                <button
                    onClick={() => setActiveTab('decision-support')}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/40 px-3 py-1.5 rounded-lg hover:bg-purple-900/80 transition"
                >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    AI Decision Support
                </button>
            </div>

            {/* Main Metric & Category Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Metric Gauge Box */}
                <div className={`flex flex-col items-center justify-center p-5 rounded-xl border ${getScoreColor(healthScore.overallScore)} shadow-inner`}>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Global Index
                    </div>
                    <div className="text-5xl font-mono font-black tracking-tight my-1">
                        {healthScore.overallScore}
                        <span className="text-xl text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        STATUS: {healthScore.status}
                    </div>
                </div>

                {/* Category Breakdown Progress Bars */}
                <div className="md:col-span-2 space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-center">
                    <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>Sub-system Structural Indices</span>
                        <span className="text-[10px] text-slate-400 font-mono">Weighted Health Models</span>
                    </div>

                    {/* Flexural Strain */}
                    <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                            <span className="text-slate-300">Pier Cap Flexural Strain</span>
                            <span className="text-red-400 font-bold">{healthScore.categoryScores.flexuralStrain}% (CRITICAL)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 shadow-glow-red rounded-full transition-all duration-500"
                                style={{ width: `${healthScore.categoryScores.flexuralStrain}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Dynamic Vibration */}
                    <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                            <span className="text-slate-300">Dynamic Vibration Amplitude</span>
                            <span className="text-amber-400 font-bold">{healthScore.categoryScores.dynamicVibration}% (WARNING)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 shadow-glow-amber rounded-full transition-all duration-500"
                                style={{ width: `${healthScore.categoryScores.dynamicVibration}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Deck Displacement */}
                    <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                            <span className="text-slate-300">Deck Vertical Deflection</span>
                            <span className="text-emerald-400 font-bold">{healthScore.categoryScores.deckDisplacement}% (NORMAL)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${healthScore.categoryScores.deckDisplacement}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Joint Expansion */}
                    <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                            <span className="text-slate-300">Expansion Joint Movement</span>
                            <span className="text-emerald-400 font-bold">{healthScore.categoryScores.jointExpansion}% (NORMAL)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${healthScore.categoryScores.jointExpansion}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contributing Factors Breakdown (Why Health Score Changed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Negative Contributors */}
                <div className="bg-red-950/20 border border-red-900/50 p-3.5 rounded-lg space-y-2">
                    <div className="font-bold text-red-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        Risk Drivers (Score Penalties)
                    </div>
                    <ul className="space-y-1.5 text-slate-300">
                        {healthScore.negativeFactors.map((factor, idx) => (
                            <li
                                key={idx}
                                onClick={() => focusAnomaly('ANOM-2026-091')}
                                className="flex items-start gap-2 cursor-pointer hover:text-white transition group"
                            >
                                <span className="text-red-400 font-bold">•</span>
                                <span className="group-hover:underline">{factor}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Positive Contributors */}
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-3.5 rounded-lg space-y-2">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Stable Structural Controls
                    </div>
                    <ul className="space-y-1.5 text-slate-300">
                        {healthScore.positiveFactors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{factor}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
