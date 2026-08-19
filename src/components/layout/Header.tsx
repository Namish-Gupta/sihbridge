import React, { useState, useEffect } from 'react';
import { useSHMStore } from '../../store/useSHMStore';
import { BRIDGE_METADATA } from '../../data/mockBridgeData';
import { USE_MOCK_DATA } from '../../config';
import {
    Activity,
    Wifi,
    WifiOff,
    Building2,
    MapPin
} from 'lucide-react';

export const Header: React.FC = () => {
    const wsConnectionState = useSHMStore((state) => state.wsConnectionState);
    const selectedNodeId = useSHMStore((state) => state.selectedNodeId);
    const nodeStatus = useSHMStore((state) => selectedNodeId ? state.nodeStatuses[selectedNodeId] : null);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    // Force re-render every second for data age display
    const [, setTick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTick((v) => v + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const iotDataAge = (): string => {
        if (!nodeStatus) return 'No data';
        const elapsed = Math.max(0, Math.floor((Date.now() - nodeStatus.lastSeen) / 1000));
        if (elapsed < 5) return 'Just now';
        if (elapsed < 60) return `${elapsed}s ago`;
        return `${Math.floor(elapsed / 60)}m ago`;
    };

    const isConnected = nodeStatus?.status === 'LIVE' && wsConnectionState === 'CONNECTED';

    return (
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-30 select-none shadow-sm text-slate-800">
            {/* Left Branding & Bridge Selector */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div
                    onClick={() => setActiveTab('dashboard')}
                    className="cursor-pointer flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition group-hover:bg-blue-700">
                        <Activity className="w-6 h-6 font-bold" />
                    </div>
                    <div>
                        <div className="font-bold text-lg tracking-tight text-slate-800">
                            SIHBridge
                        </div>
                    </div>
                </div>

                <div className="h-8 border-r border-gray-300"></div>

                {/* Bridge Info */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                        <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-slate-800">
                            {BRIDGE_METADATA.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3 h-3" />
                            <span>Node: {selectedNodeId || 'Select a node'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right System Telemetry & Connection Status */}
            <div className="flex items-center gap-4">
                {/* ESP32 Status Badge */}
                <div className={`flex flex-col items-end`}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${
                        isConnected
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {isConnected ? (
                            <><span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> <Wifi className="w-4 h-4" /> ESP32 LIVE</>
                        ) : (
                            <><WifiOff className="w-4 h-4" /> ESP32 OFFLINE</>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-1 pr-1">
                        Updated: {iotDataAge()}
                    </div>
                </div>
            </div>
        </header>
    );
};
