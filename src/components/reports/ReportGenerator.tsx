import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { BRIDGE_METADATA } from '../../data/mockBridgeData';
import {
    Printer,
    Download,
    FileCheck2,
    Building2,
    CheckCircle2,
    ShieldAlert,
    Award,
    FileCode2,
    Activity,
    Cpu,
    Calendar
} from 'lucide-react';

export const ReportGenerator: React.FC = () => {
    const healthScore = useSHMStore((state) => state.healthScore);
    const anomalies = useSHMStore((state) => state.anomalies);
    const sensors = useSHMStore((state) => state.sensors);
    const rules = useSHMStore((state) => state.rules);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 overflow-y-auto h-full">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl print:hidden">
                <div className="flex items-center gap-3">
                    <FileCheck2 className="w-6 h-6 text-cyan-400" />
                    <div>
                        <h1 className="text-sm font-bold text-white uppercase">Official Compliance & Audit Report Generator</h1>
                        <p className="text-xs text-slate-400">Printable / PDF export formatted for NHAI & PWD authorities</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition shadow"
                    >
                        <Printer className="w-4 h-4" />
                        Print / Save as PDF
                    </button>
                </div>
            </div>

            {/* --- PRINTABLE REPORT DOCUMENT BODY --- */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl space-y-6 text-slate-100 print:bg-white print:text-black print:p-0 print:border-none">
                {/* Header Block */}
                <div className="border-b border-slate-700 pb-6 flex items-start justify-between">
                    <div>
                        <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider print:text-cyan-800">
                            National Highways Authority of India (NHAI)
                        </div>
                        <h1 className="text-2xl font-black text-white mt-1 print:text-black">
                            STRUCTURAL HEALTH AUDIT REPORT
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono print:text-slate-600">
                            Ref: SHM-REP-2026-CHE-091 | Automated AI-Assisted Assessment
                        </p>
                    </div>

                    <div className="text-right font-mono text-xs space-y-1">
                        <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 inline-block print:border-slate-300">
                            Generated: <strong className="text-white print:text-black">{new Date().toLocaleString()}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 print:text-slate-500">System Ver: SIHBridge Cognitive v2.4</div>
                    </div>
                </div>

                {/* Bridge Identification Section */}
                <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs print:border-slate-300 print:bg-slate-50">
                    <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] print:text-slate-700">1. Infrastructure Identification</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                        <div>
                            <span className="text-slate-500 block text-[10px]">Bridge Name</span>
                            <strong className="text-slate-200 print:text-black">{BRIDGE_METADATA.name}</strong>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px]">Structure ID</span>
                            <strong className="text-slate-200 print:text-black">{BRIDGE_METADATA.id}</strong>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px]">Location</span>
                            <strong className="text-slate-200 print:text-black">{BRIDGE_METADATA.location}</strong>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px]">Structure Type</span>
                            <strong className="text-slate-200 print:text-black">{BRIDGE_METADATA.type}</strong>
                        </div>
                    </div>
                </div>

                {/* Executive Summary & Health Index */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1 print:text-black print:border-slate-300">
                        2. Executive Health Assessment
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-amber-950/30 border border-amber-500/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Overall Health Score</span>
                            <div className="text-4xl font-black font-mono text-amber-400 my-1">{healthScore.overallScore} / 100</div>
                            <span className="text-xs font-bold text-amber-300 uppercase">STATUS: {healthScore.status}</span>
                        </div>

                        <div className="md:col-span-2 bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2 text-xs print:border-slate-300">
                            <div className="font-bold text-slate-300">Primary Findings & Risk Drivers:</div>
                            <ul className="space-y-1 text-slate-300 print:text-slate-800">
                                {healthScore.negativeFactors.map((factor, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-red-400 font-bold">•</span>
                                        <span>{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Active Anomalies & Evidence Chain */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1 print:text-black print:border-slate-300">
                        3. Detailed Sensor Telemetry & AI Evidence Chain
                    </h2>

                    {anomalies.map((anom) => (
                        <div key={anom.id} className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3 text-xs print:border-slate-300">
                            <div className="flex justify-between items-center font-mono font-bold">
                                <span className="text-red-400 text-sm">{anom.componentName} — {anom.parameter}</span>
                                <span className="bg-red-950 text-red-200 border border-red-500/50 px-2 py-0.5 rounded text-[10px] uppercase">
                                    {anom.severity} (Model Conf: {anom.confidence}%)
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] bg-slate-900 p-2.5 rounded border border-slate-800 print:bg-slate-100">
                                <div>Observed: <strong className="text-white print:text-black">{anom.observedValue} με</strong></div>
                                <div>Baseline: <strong className="text-slate-300 print:text-slate-800">{anom.baselineValue} με</strong></div>
                                <div>Deviation: <strong className="text-red-400">+{anom.deviationPercentage}%</strong></div>
                                <div>IRC Code: <strong className="text-cyan-300 print:text-cyan-900">{anom.engineeringRuleRef}</strong></div>
                            </div>

                            <div className="space-y-1">
                                <div className="font-bold text-slate-300">Auditable Reasoning Chain:</div>
                                {anom.explanation.map((step, idx) => (
                                    <div key={idx} className="pl-3 border-l-2 border-slate-700 space-y-0.5">
                                        <div className="font-semibold text-cyan-400 print:text-cyan-800">{step.title}</div>
                                        <div className="text-slate-400 print:text-slate-600">{step.description}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-red-950/20 border border-red-900/50 p-2.5 rounded text-slate-200">
                                <strong className="text-red-400">Recommended Action: </strong>
                                {anom.recommendedAction.action}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Regulatory Basis Section */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1 print:text-black print:border-slate-300">
                        4. Indian Engineering Code References (IRC)
                    </h2>

                    <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs print:border-slate-300">
                        <div className="inline-block bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                            Reference Data Configured by Engineering Authority
                        </div>
                        <div className="space-y-2 pt-1">
                            {rules.map((rule) => (
                                <div key={rule.id} className="flex justify-between items-center font-mono border-b border-slate-800/60 pb-1">
                                    <div>
                                        <strong className="text-cyan-400 print:text-cyan-800">{rule.codeReference}</strong>
                                        <span className="text-slate-400 font-sans block text-[11px]">{rule.description}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-300">Threshold: {rule.thresholdValue} {rule.unit}</span>
                                        <span className={`block font-bold text-[10px] ${rule.status === 'EXCEEDED' ? 'text-red-400' : 'text-emerald-400'}`}>
                                            STATUS: {rule.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Signatures & Certification Block */}
                <div className="pt-8 border-t border-slate-700 grid grid-cols-2 gap-8 text-xs font-mono print:pt-6">
                    <div className="border border-slate-800 p-4 rounded bg-slate-950/50 space-y-6 print:border-slate-400">
                        <div className="text-slate-400 uppercase font-bold text-[10px]">Prepared by AI Telemetry Engine</div>
                        <div className="text-slate-300 font-bold">SIHBridge Neural Engine v2.4</div>
                        <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                            Digital Hash: 8f9a2b1c-4d5e-6f7a-8b9c0d1e2f3a
                        </div>
                    </div>

                    <div className="border border-slate-800 p-4 rounded bg-slate-950/50 space-y-6 print:border-slate-400">
                        <div className="text-slate-400 uppercase font-bold text-[10px]">Engineering Authority Review & Digital Signature</div>
                        <div className="h-8 border-b border-dashed border-slate-600 flex items-end text-slate-500 italic text-[11px]">
                            [ Digital Signature Placeholder — Er. V. Subramanian, NHAI ]
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1">
                            Chief Bridge Inspector / Executive Engineer Approval
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
