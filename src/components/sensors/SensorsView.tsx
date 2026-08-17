import React, { useState } from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { SensorSource } from '../../types/shm';
import { Activity, Cpu, Search, Filter, ArrowUpRight } from 'lucide-react';

export const SensorsView: React.FC = () => {
    const sensors = useSHMStore((state) => state.sensors);
    const selectComponent = useSHMStore((state) => state.selectComponent);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    const [search, setSearch] = useState('');
    const [sourceFilter, setSourceFilter] = useState<'all' | SensorSource>('all');

    const filteredSensors = sensors.filter((s) => {
        if (sourceFilter !== 'all' && s.source !== sourceFilter) return false;
        if (search && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.location.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        return true;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                        <Activity className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white uppercase tracking-wide">Sensor Telemetry & Virtual Sensing Matrix</h1>
                        <p className="text-xs text-slate-400">
                            Inventory of 24 physical telemetry nodes & 18 AI-inferred virtual sensors
                        </p>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Box */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search ID, name, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                    </div>

                    <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                        <button
                            onClick={() => setSourceFilter('all')}
                            className={`px-3 py-1 rounded transition ${sourceFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                        >
                            All ({sensors.length})
                        </button>
                        <button
                            onClick={() => setSourceFilter('physical')}
                            className={`px-3 py-1 rounded transition flex items-center gap-1 ${sourceFilter === 'physical' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400'}`}
                        >
                            <Activity className="w-3 h-3 text-cyan-400" />
                            Measured
                        </button>
                        <button
                            onClick={() => setSourceFilter('virtual')}
                            className={`px-3 py-1 rounded transition flex items-center gap-1 ${sourceFilter === 'virtual' ? 'bg-purple-950 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400'}`}
                        >
                            <Cpu className="w-3 h-3 text-purple-400" />
                            AI-Inferred
                        </button>
                    </div>
                </div>
            </div>

            {/* Sensor Inventory Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                                <th className="p-3 font-semibold">Sensor ID</th>
                                <th className="p-3 font-semibold">Source</th>
                                <th className="p-3 font-semibold">Name & Location</th>
                                <th className="p-3 font-semibold">Parameter</th>
                                <th className="p-3 font-semibold">Current Value</th>
                                <th className="p-3 font-semibold">Baseline</th>
                                <th className="p-3 font-semibold">Status / Conf</th>
                                <th className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-300">
                            {filteredSensors.map((sensor) => {
                                const isPhysical = sensor.source === 'physical';
                                const isCritical = sensor.status === 'critical';
                                const isWarning = sensor.status === 'warning';

                                return (
                                    <tr key={sensor.id} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3 font-bold text-white flex items-center gap-2">
                                            {isPhysical ? (
                                                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                                            ) : (
                                                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                            )}
                                            <span>{sensor.id}</span>
                                        </td>

                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPhysical
                                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                    }`}
                                            >
                                                {isPhysical ? 'MEASURED' : 'AI-INFERRED'}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            <div className="font-bold text-slate-200 font-sans">{sensor.name}</div>
                                            <div className="text-[10px] text-slate-400">{sensor.location}</div>
                                        </td>

                                        <td className="p-3 text-slate-400">{sensor.parameter}</td>

                                        <td className="p-3 font-bold text-white">
                                            {sensor.value} {sensor.unit}
                                        </td>

                                        <td className="p-3 text-slate-400">
                                            {sensor.baselineValue} {sensor.unit}
                                        </td>

                                        <td className="p-3">
                                            {isCritical ? (
                                                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 font-bold animate-pulse">
                                                    CRITICAL
                                                </span>
                                            ) : isWarning ? (
                                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-bold">
                                                    WARNING
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                                                    NORMAL
                                                </span>
                                            )}

                                            {!isPhysical && sensor.confidence && (
                                                <div className="text-[10px] text-purple-300 mt-0.5">
                                                    {sensor.confidence}% Conf
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => {
                                                    selectComponent(sensor.componentId);
                                                    setActiveTab('digital-twin');
                                                }}
                                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-sans font-semibold text-[11px] transition inline-flex items-center gap-1"
                                            >
                                                Locate 3D
                                                <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
