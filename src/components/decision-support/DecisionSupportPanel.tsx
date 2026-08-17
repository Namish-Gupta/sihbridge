import React, { useState } from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import {
    BrainCircuit,
    AlertOctagon,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ShieldCheck,
    FileCode2,
    ArrowRight,
    Activity,
    Cpu,
    HelpCircle,
    AlertTriangle,
    Info,
    Wrench
} from 'lucide-react';

export const DecisionSupportPanel: React.FC = () => {
    const anomalies = useSHMStore((state) => state.anomalies);
    const focusedAnomalyId = useSHMStore((state) => state.focusedAnomalyId);
    const rules = useSHMStore((state) => state.rules);
    const sensors = useSHMStore((state) => state.sensors);
    const focusAnomaly = useSHMStore((state) => state.focusAnomaly);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
        step1: true,
        step2: true,
        step3: true,
        step4: true,
        step5: true,
        step6: true,
    });

    const toggleStep = (stepKey: string) => {
        setExpandedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
    };

    const activeAnomaly = anomalies.find((a) => a.id === focusedAnomalyId) || anomalies[0];
    const matchedRule = rules.find((r) => r.codeReference === activeAnomaly.engineeringRuleRef) || rules[0];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            {/* Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
                        <BrainCircuit className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-white uppercase tracking-wide">Explainable AI Decision Support Engine</h1>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                AUDITABLE REASONING CHAIN
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Transforming raw telemetry & virtual sensors into actionable, code-compliant engineering decisions
                        </p>
                    </div>
                </div>

                {/* Anomaly Selector */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 font-medium px-2">Active Incident:</span>
                    {anomalies.map((anom) => (
                        <button
                            key={anom.id}
                            onClick={() => focusAnomaly(anom.id)}
                            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 ${activeAnomaly.id === anom.id
                                    ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <AlertTriangle className={`w-3.5 h-3.5 ${anom.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`} />
                            {anom.componentName} ({anom.severity})
                        </button>
                    ))}
                </div>
            </div>

            {/* Incident Summary Card */}
            <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900/50 pb-3">
                    <div className="flex items-center gap-2">
                        <AlertOctagon className="w-5 h-5 text-red-400 animate-bounce" />
                        <h2 className="text-base font-bold text-red-200">{activeAnomaly.componentName} — {activeAnomaly.parameter} Anomaly</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400">Severity: <strong className="text-red-400">{activeAnomaly.severity}</strong></span>
                        <span className="text-xs font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-1 rounded">
                            AI Confidence: <strong>{activeAnomaly.confidence}%</strong>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Observed Telemetry</span>
                        <span className="text-base font-bold text-white">{activeAnomaly.observedValue} με</span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">State 0 Baseline</span>
                        <span className="text-base font-bold text-slate-300">{activeAnomaly.baselineValue} με</span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Baseline Deviation</span>
                        <span className="text-base font-bold text-red-400">+{activeAnomaly.deviationPercentage}%</span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Engineering Code Basis</span>
                        <span className="text-xs font-bold text-cyan-300">{activeAnomaly.engineeringRuleRef}</span>
                    </div>
                </div>
            </div>

            {/* --- EXPLAINABLE REASONING CHAIN STACK --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Auditable Step-by-Step Reasoning Chain</span>
                    <span>Click step to expand / collapse</span>
                </div>

                {/* Step 1: Measured Sensor Evidence */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    <button
                        onClick={() => toggleStep('step1')}
                        className="w-full flex items-center justify-between p-4 bg-slate-950/80 hover:bg-slate-800/80 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
                                1
                            </div>
                            <div>
                                <span className="text-xs font-mono font-bold text-cyan-400 uppercase mr-2">Sensor Evidence</span>
                                <span className="text-sm font-semibold text-white">Physical Telemetry Trigger (SG-023)</span>
                            </div>
                        </div>
                        {expandedSteps.step1 ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedSteps.step1 && (
                        <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3 text-xs">
                            <p className="text-slate-300 leading-relaxed">
                                Physical strain gauge <strong>SG-023</strong> installed on the Pier P3 pier cap pedestal registered a sharp sustained increase from the State 0 baseline value of <strong>650 με</strong> to <strong>812 με</strong> (+24.9% deviation).
                            </p>

                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center gap-4">
                                <Activity className="w-5 h-5 text-cyan-400" />
                                <div className="font-mono text-slate-300 space-y-0.5">
                                    <div>Direct Measured Value: <span className="font-bold text-white">812 με</span></div>
                                    <div>Sensor Status: <span className="text-red-400 font-bold">CRITICAL DEVIATION</span></div>
                                    <div>Persistence: <span className="text-slate-400">Sustained for &gt; 6 hours</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2: AI Virtual Sensor Cross-Validation */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    <button
                        onClick={() => toggleStep('step2')}
                        className="w-full flex items-center justify-between p-4 bg-slate-950/80 hover:bg-slate-800/80 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 font-mono font-bold text-xs">
                                2
                            </div>
                            <div>
                                <span className="text-xs font-mono font-bold text-purple-400 uppercase mr-2">AI Inference</span>
                                <span className="text-sm font-semibold text-white">Physics-Informed Neural Network (PINN) Cross-Validation</span>
                            </div>
                        </div>
                        {expandedSteps.step2 ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedSteps.step2 && (
                        <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3 text-xs">
                            <p className="text-slate-300 leading-relaxed">
                                Adjacent virtual sensors <strong>VS-014</strong> (Pier P3 Shaft interior stress model) and <strong>VS-015</strong> (Girder G2 bottom flange strain profiler) independently estimated elevated strain values of <strong>812 με</strong> and <strong>798 με</strong> respectively.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
                                    <Cpu className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="font-bold text-purple-300">VS-014 Virtual Sensor</div>
                                        <div className="font-mono text-slate-300">Estimated Strain: 812 με</div>
                                        <div className="font-mono text-emerald-400 text-[10px]">Model Confidence: 94% (PINN-Strain-v3)</div>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
                                    <Cpu className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="font-bold text-purple-300">VS-015 Virtual Sensor</div>
                                        <div className="font-mono text-slate-300">Estimated Strain: 798 με</div>
                                        <div className="font-mono text-emerald-400 text-[10px]">Model Confidence: 91% (FE-Surrogate-v2)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 3: Confidence & Uncertainty Analysis */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    <button
                        onClick={() => toggleStep('step3')}
                        className="w-full flex items-center justify-between p-4 bg-slate-950/80 hover:bg-slate-800/80 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-mono font-bold text-xs">
                                3
                            </div>
                            <div>
                                <span className="text-xs font-mono font-bold text-emerald-400 uppercase mr-2">Uncertainty Bounds</span>
                                <span className="text-sm font-semibold text-white">AI Confidence Rating: 94% (High Confidence)</span>
                            </div>
                        </div>
                        {expandedSteps.step3 ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedSteps.step3 && (
                        <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3 text-xs">
                            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <div>
                                    <div className="text-xs font-bold text-white">Confidence Interval Range</div>
                                    <div className="font-mono text-slate-400 text-[11px]">95% Bayesian Credible Interval: <span className="text-cyan-300 font-bold">790 με – 835 με</span></div>
                                </div>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded font-mono font-bold">
                                    High Confidence (&gt;90%)
                                </span>
                            </div>
                            <p className="text-slate-400 text-[11px]">
                                Note: AI estimates are calculated incorporating surrogate Finite Element (FE) boundary conditions and ambient thermal expansion compensation.
                            </p>
                        </div>
                    )}
                </div>

                {/* Step 4: Indian Engineering Regulatory Reference Basis */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    <button
                        onClick={() => toggleStep('step4')}
                        className="w-full flex items-center justify-between p-4 bg-slate-950/80 hover:bg-slate-800/80 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
                                4
                            </div>
                            <div>
                                <span className="text-xs font-mono font-bold text-cyan-400 uppercase mr-2">Regulatory Reference</span>
                                <span className="text-sm font-semibold text-white">IRC Provision Compliance Check ({matchedRule.codeReference})</span>
                            </div>
                        </div>
                        {expandedSteps.step4 ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedSteps.step4 && (
                        <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3 text-xs">
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-cyan-300 text-sm">{matchedRule.codeReference}</span>
                                    <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                        Reference Data Configured by Engineering Authority
                                    </span>
                                </div>
                                <p className="text-slate-300 font-medium">{matchedRule.description}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono pt-2 border-t border-slate-800 text-[11px]">
                                    <div>
                                        <span className="text-slate-500 block">Threshold Limit</span>
                                        <span className="text-slate-200 font-bold">{matchedRule.thresholdValue} {matchedRule.unit}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">Observed Value</span>
                                        <span className="text-red-400 font-bold">{activeAnomaly.observedValue} {matchedRule.unit}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">Margin Deficit</span>
                                        <span className="text-red-400 font-bold">-62.0 {matchedRule.unit}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">Rule Status</span>
                                        <span className="text-red-400 font-bold uppercase">{matchedRule.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 5: Engineering Interpretation & Risk Assessment */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    <button
                        onClick={() => toggleStep('step5')}
                        className="w-full flex items-center justify-between p-4 bg-slate-950/80 hover:bg-slate-800/80 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-300 font-mono font-bold text-xs">
                                5
                            </div>
                            <div>
                                <span className="text-xs font-mono font-bold text-amber-400 uppercase mr-2">Risk Assessment</span>
                                <span className="text-sm font-semibold text-white">Structural Interpretation</span>
                            </div>
                        </div>
                        {expandedSteps.step5 ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedSteps.step5 && (
                        <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-2 text-xs text-slate-300 italic bg-amber-950/10 border-l-2 border-amber-500">
                            &quot;The observed strain increment on Pier P3 cap indicates abnormal stress concentration relative to the established State 0 baseline. Correlated data from adjacent virtual sensors confirms potential bearing pad shear distress or localized concrete micro-cracking.&quot;
                        </div>
                    )}
                </div>

                {/* Step 6: Recommended Action Plan */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    <button
                        onClick={() => toggleStep('step6')}
                        className="w-full flex items-center justify-between p-4 bg-slate-950/80 hover:bg-slate-800/80 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-red-950 border border-red-500/50 flex items-center justify-center text-red-300 font-mono font-bold text-xs">
                                6
                            </div>
                            <div>
                                <span className="text-xs font-mono font-bold text-red-400 uppercase mr-2">Recommended Action</span>
                                <span className="text-sm font-semibold text-white">Priority: {activeAnomaly.recommendedAction.priority}</span>
                            </div>
                        </div>
                        {expandedSteps.step6 ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedSteps.step6 && (
                        <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-4 text-xs">
                            <div className="bg-red-950/30 p-4 rounded-lg border border-red-500/40 space-y-3">
                                <div className="font-bold text-slate-100 flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-red-400" />
                                    Action Protocol:
                                </div>
                                <p className="text-slate-200 leading-relaxed font-medium">
                                    {activeAnomaly.recommendedAction.action}
                                </p>

                                <div className="space-y-1.5 pt-2 border-t border-red-900/50">
                                    <div className="text-[11px] font-bold text-red-300">Suggested Field Audits:</div>
                                    <ul className="space-y-1 text-slate-300 font-mono">
                                        {activeAnomaly.recommendedAction.inspectionsSuggested.map((audit, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                                                <span>{audit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition shadow"
                                >
                                    Generate Inspection Report
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
