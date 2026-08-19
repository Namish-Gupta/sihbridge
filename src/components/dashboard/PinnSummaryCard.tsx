import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { Activity, AlertTriangle, ShieldCheck, Clock, Server } from 'lucide-react';

export const PinnSummaryCard: React.FC = () => {
    const pinnData = useSHMStore((state) => state.pinnData);

    const isReady = pinnData && pinnData.status === 'success';
    const isError = pinnData && pinnData.status === 'ERROR';

    // Derived statistics
    const totalSensors = isReady ? pinnData.virtual_sensors.length : 0;
    const damagedSensors = isReady ? pinnData.virtual_sensors.filter(s => s.predicted_state === 'DAMAGED').length : 0;
    const healthySensors = totalSensors - damagedSensors;

    const sourceNodes = pinnData?.source_nodes || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800">PINN Local Inference Bridge</h2>
                        <p className="text-[11px] text-slate-500">Physics-Informed Neural Network (ONNX)</p>
                    </div>
                </div>
                
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    isReady ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    isError ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                    {isReady ? <ShieldCheck className="w-3.5 h-3.5" /> : isError ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {isReady ? 'READY' : isError ? 'ERROR' : 'WAITING'}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <div className="text-2xl font-black text-slate-800">{totalSensors}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Virtual Sensors</div>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
                    <div className="text-2xl font-black text-emerald-600">{healthySensors}</div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-1">Healthy</div>
                </div>

                <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
                    <div className="text-2xl font-black text-red-600">{damagedSensors}</div>
                    <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mt-1">Damaged</div>
                </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-2">
                    <Server className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-600">Source Physical Nodes</h3>
                </div>
                {sourceNodes.length > 0 ? (
                    <div className="flex gap-2">
                        {sourceNodes.map(node => (
                            <span key={node} className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded text-[10px] font-bold font-mono border border-cyan-200">
                                {node}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 italic">Waiting for synchronized node pairs...</div>
                )}
                
                {pinnData && (
                    <div className="mt-2 text-[9px] text-slate-400 font-mono text-right">
                        Last Update: {new Date(pinnData.timestamp_ms).toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );
};
