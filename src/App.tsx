import React, { useEffect } from 'react';
import { useSHMStore } from './store/useSHMStore';
import { mockSimService } from './services/mockSimService';
import { useBridgeData } from './hooks/useBridgeData';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { DashboardView } from './components/dashboard/DashboardView';
import { DigitalTwinView } from './components/digital-twin/DigitalTwinView';
import { SensorsView } from './components/sensors/SensorsView';

export const App: React.FC = () => {
    const activeTab = useSHMStore((state) => state.activeTab);

    // Initialize IoT data pipeline (mock or real WebSocket)
    useBridgeData();

    // Legacy simulation feed for existing dashboard sensors
    // (will be removed once those components migrate to real ESP32 data)
    useEffect(() => {
        mockSimService.start();
        return () => {
            mockSimService.stop();
        };
    }, []);


    return (
        <div className="flex flex-col h-screen w-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden select-none">
            {/* Header Bar */}
            <Header />

            {/* Main Container */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Navigation Sidebar */}
                <Sidebar />

                {/* Dynamic View Content Area */}
                <main className="flex-1 overflow-hidden relative bg-[#f8f9fa]">
                    {activeTab === 'dashboard' && <DashboardView />}
                    {activeTab === 'digital-twin' && <DigitalTwinView />}
                    {activeTab === 'sensors' && <SensorsView />}
                </main>
            </div>
        </div>
    );
};

export default App;
