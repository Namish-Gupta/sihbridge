import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { Activity, Clock } from 'lucide-react';

export const PinnSummaryCard: React.FC = () => {
    const pinnData = useSHMStore((state) => state.pinnData);

    const isReady = pinnData && pinnData.status === 'success';
    const isError = pinnData && pinnData.status === 'ERROR';

    const totalSensors = isReady ? pinnData.virtual_sensors.length : 0;
    const damagedSensors = isReady ? pinnData.virtual_sensors.filter(s => s.predicted_state === 'DAMAGED').length : 0;
    const healthySensors = totalSensors - damagedSensors;

    const sourceNodes = pinnData?.source_nodes || [];

    return (
        <div className="bg-white rounded border border-slate-300 p-4 mt-6 font-sans text-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-600" />
                    <div>
                        <h2 className="text-[13px] font-semibold text-slate-700">PINN Local Inference Bridge</h2>
                        <p className="text-[10px] text-slate-500">Physics-Informed Neural Network (ONNX)</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    {isReady ? (
                        <span className="text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded">ONLINE</span>
                    ) : isError ? (
                        <span className="text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded">ERROR</span>
                    ) : (
                        <span className="text-amber-600 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> WAITING
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
                    <div className="text-xl font-bold text-slate-700">{totalSensors}</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Virtual Sensors</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <div className="text-xl font-bold text-green-700">{healthySensors}</div>
                    <div className="text-[10px] font-semibold text-green-600 uppercase">Healthy</div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                    <div className="text-xl font-bold text-red-700">{damagedSensors}</div>
                    <div className="text-[10px] font-semibold text-red-600 uppercase">Damaged</div>
                </div>
            </div>

            <div className="border border-slate-200 rounded p-2 text-[11px]">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-600">Source Physical Nodes</span>
                    {pinnData && (
                        <span className="text-slate-400 font-mono text-[9px]">
                            {new Date(pinnData.timestamp_ms).toLocaleTimeString()}
                        </span>
                    )}
                </div>
                
                {sourceNodes.length > 0 ? (
                    <div className="flex gap-2">
                        {sourceNodes.map(node => (
                            <span key={node} className="font-mono text-slate-700">
                                {node}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-400 italic">Waiting for node pairs...</div>
                )}
            </div>
        </div>
    );
};
