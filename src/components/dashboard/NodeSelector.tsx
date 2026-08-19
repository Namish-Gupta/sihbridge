import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';

export const NodeSelector: React.FC = () => {
    const nodeStatuses = useSHMStore((s) => s.nodeStatuses);
    const selectedNodeId = useSHMStore((s) => s.selectedNodeId);
    const setSelectedNode = useSHMStore((s) => s.setSelectedNode);

    const nodes = Object.values(nodeStatuses).sort((a, b) => a.nodeId.localeCompare(b.nodeId));

    if (nodes.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm flex items-center justify-center">
                <span className="text-slate-500 font-medium">Waiting for ESP32 nodes to connect...</span>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Monitoring Nodes</h2>
            <div className="flex flex-wrap gap-4">
                {nodes.map((node) => {
                    const isSelected = selectedNodeId === node.nodeId;
                    
                    let healthColor = 'text-slate-500';
                    if (node.health === 'HEALTHY') healthColor = 'text-green-600';
                    if (node.health === 'DAMAGED') healthColor = 'text-red-600';
                    if (node.health === 'SENSOR_ERROR') healthColor = 'text-amber-500';

                    const isOffline = node.status === 'OFFLINE';
                    const statusColor = isOffline ? 'text-slate-400' : 'text-cyan-500';
                    const statusDot = isOffline ? '○' : '●';

                    return (
                        <button
                            key={node.nodeId}
                            onClick={() => setSelectedNode(node.nodeId)}
                            className={`flex flex-col text-left px-5 py-3 rounded-lg border transition-all duration-200 ${
                                isSelected 
                                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500' 
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-4 mb-1">
                                <span className="font-bold text-slate-800">{node.nodeId}</span>
                                <span className={`text-xs font-bold flex items-center gap-1 ${statusColor}`}>
                                    {statusDot} {node.status}
                                </span>
                            </div>
                            <div className={`text-xs font-semibold ${isOffline ? 'text-slate-400' : healthColor}`}>
                                {isOffline ? 'NO DATA' : node.health}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
