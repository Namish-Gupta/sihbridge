import React from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { BRIDGE_METADATA } from '../../data/mockBridgeData';
import {
    ShieldCheck,
    Wifi,
    WifiOff,
    AlertTriangle,
    RefreshCw,
    UserCheck,
    MapPin,
    Building2,
    Activity
} from 'lucide-react';

export const Header: React.FC = () => {
    const connectionState = useSHMStore((state) => state.connectionState);
    const lastSyncTimestamp = useSHMStore((state) => state.lastSyncTimestamp);
    const healthScore = useSHMStore((state) => state.healthScore);
    const isSimulating = useSHMStore((state) => state.isSimulating);
    const toggleSimulation = useSHMStore((state) => state.toggleSimulation);
    const activeTab = useSHMStore((state) => state.activeTab);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none shadow-md">
            {/* Left Branding & Bridge Selector */}
            <div className="flex items-center gap-4">
                {/* Logo */}
                <div
                    onClick={() => setActiveTab('dashboard')}
                    className="cursor-pointer flex items-center gap-2.5 group"
                >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:scale-105 transition">
                        <ShieldCheck className="w-5 h-5 text-slate-950 font-bold" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold tracking-tight text-lg text-white">SIH<span className="text-cyan-400">Bridge</span></span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                v2.4 AI-SHM
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Cognitive Structural Health Platform</p>
                    </div>
                </div>

                <div className="h-8 border-r border-slate-800"></div>

                {/* Bridge Selector Dropdown */}
                <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                            {BRIDGE_METADATA.name}
                            <span className="text-[10px] font-mono text-slate-400">({BRIDGE_METADATA.id})</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MapPin className="w-2.5 h-2.5 text-slate-500" />
                            <span>Ennore Port Corridor, TN</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right System Telemetry & Connection Status */}
            <div className="flex items-center gap-4">
                {/* Real-time Telemetry Toggle */}
                <button
                    onClick={toggleSimulation}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${isSimulating
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                    title="Toggle live simulated WebSocket telemetry feed"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>{isSimulating ? 'Telemetry Live' : 'Feed Paused'}</span>
                </button>

                {/* Connection Status Indicator */}
                <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    {connectionState === 'LIVE' ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <Wifi className="w-3.5 h-3.5" />
                            <span>LIVE</span>
                        </div>
                    ) : connectionState === 'DEGRADED' ? (
                        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                            <span>DEGRADED</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-mono font-semibold">
                            <WifiOff className="w-3.5 h-3.5" />
                            <span>OFFLINE</span>
                        </div>
                    )}

                    <div className="h-4 border-r border-slate-800"></div>

                    <div className="text-[10px] font-mono text-slate-400">
                        Sync: <span className="text-slate-200">{lastSyncTimestamp}</span>
                    </div>
                </div>

                {/* Structural Health Quick Badge */}
                <div
                    onClick={() => setActiveTab('dashboard')}
                    className="cursor-pointer flex items-center gap-2 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-lg hover:bg-amber-900/50 transition"
                >
                    <Activity className="w-4 h-4 text-amber-400" />
                    <div>
                        <div className="text-[10px] uppercase font-bold text-amber-400">Health Index</div>
                        <div className="text-xs font-mono font-bold text-amber-200">
                            {healthScore.overallScore} / 100 ({healthScore.status})
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="hidden lg:block">
                        <div className="text-xs font-semibold text-slate-200">Er. V. Subramanian</div>
                        <div className="text-[10px] text-slate-400">NHAI Chief Engineer</div>
                    </div>
                </div>
            </div>
        </header>
    );
};
