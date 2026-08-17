import React from 'react';
import { useSHMStore, TabType } from '../../store/useSHMStore';
import {
    LayoutDashboard,
    Box,
    Activity,
    LineChart,
    AlertTriangle,
    Sliders,
    BrainCircuit,
    FileCheck2
} from 'lucide-react';

interface NavItem {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
}

export const Sidebar: React.FC = () => {
    const activeTab = useSHMStore((state) => state.activeTab);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);
    const anomalies = useSHMStore((state) => state.anomalies);

    const activeAlertsCount = anomalies.filter((a) => a.status === 'ACTIVE').length;

    const navItems: NavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'digital-twin', label: '3D Digital Twin', icon: Box },
        { id: 'sensors', label: 'Sensors Telemetry', icon: Activity },
        { id: 'analytics', label: 'Sensor Analytics', icon: LineChart },
        {
            id: 'alerts',
            label: 'Active Alerts',
            icon: AlertTriangle,
            badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
            badgeColor: 'bg-red-500 text-white animate-pulse'
        },
        { id: 'baseline', label: 'State 0 Baseline', icon: Sliders },
        {
            id: 'decision-support',
            label: 'Decision Support',
            icon: BrainCircuit,
            badge: 'AI',
            badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
        },
        { id: 'reports', label: 'Inspection Reports', icon: FileCheck2 },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none z-20">
            {/* Navigation Links */}
            <div className="p-3 space-y-1">
                <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                    Navigation Control
                </div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${isActive
                                    ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/40 shadow-glow-cyan'
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                            </div>

                            {item.badge !== undefined && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${item.badgeColor}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* System Information Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/50">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span>IRC Compliance</span>
                        <span className="text-emerald-400 font-mono font-bold">CONFIGURED</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                        <span>ML Engine</span>
                        <span className="text-purple-400 font-mono font-bold">PINN + FE</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                        Authority: NHAI / PWD Infrastructure
                    </div>
                </div>
            </div>
        </aside>
    );
};
