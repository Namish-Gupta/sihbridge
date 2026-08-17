import React, { useState } from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { HISTORICAL_DEGRADATION } from '../../data/mockBridgeData';
import { HistoricalTimeframe } from '../../types/shm';
import { History, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';

export const HistoricalTimeline: React.FC = () => {
    const [timeframe, setTimeframe] = useState<HistoricalTimeframe>('5Y');

    return (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-400" />
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Historical Structural Deterioration Timeline</h3>
                        <p className="text-xs text-slate-400">Longitudinal monitoring tracking health index decay & strain accumulation</p>
                    </div>
                </div>

                {/* Timeframe Selectors */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                    {(['7D', '30D', '6M', '1Y', '5Y'] as HistoricalTimeframe[]).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-2.5 py-1 rounded transition ${timeframe === tf
                                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 font-bold'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Degradation Chart */}
            <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={HISTORICAL_DEGRADATION} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[60, 100]} />
                        <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="score" name="Health Score Index (/100)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                        <Bar yAxisId="right" dataKey="maxStrain" name="Peak Flexural Strain (με)" fill="#06b6d4" opacity={0.6} radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
