import React, { useEffect } from 'react';
import { useSHMStore } from './store/useSHMStore';
import { mockSimService } from './services/mockSimService';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ComponentDrawer } from './components/dashboard/ComponentDrawer';

import { DashboardView } from './components/dashboard/DashboardView';
import { DigitalTwinView } from './components/digital-twin/DigitalTwinView';
import { SensorsView } from './components/sensors/SensorsView';
import { SensorAnalytics } from './components/analytics/SensorAnalytics';
import { AlertsCenter } from './components/alerts/AlertsCenter';
import { State0Comparison } from './components/baseline/State0Comparison';
import { DecisionSupportPanel } from './components/decision-support/DecisionSupportPanel';
import { ReportGenerator } from './components/reports/ReportGenerator';

export const App: React.FC = () => {
    const activeTab = useSHMStore((state) => state.activeTab);
    const selectedComponentId = useSHMStore((state) => state.selectedComponentId);

    // Initialize real-time WebSocket simulator feed
    useEffect(() => {
        mockSimService.start();
        return () => {
            mockSimService.stop();
        };
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen bg-shm-bg text-slate-100 font-sans overflow-hidden select-none">
            {/* Header Bar */}
            <Header />

            {/* Main Container */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Navigation Sidebar */}
                <Sidebar />

                {/* Dynamic View Content Area */}
                <main className="flex-1 overflow-hidden bg-[#090d16] relative">
                    {activeTab === 'dashboard' && <DashboardView />}
                    {activeTab === 'digital-twin' && <DigitalTwinView />}
                    {activeTab === 'sensors' && <SensorsView />}
                    {activeTab === 'analytics' && <SensorAnalytics />}
                    {activeTab === 'alerts' && <AlertsCenter />}
                    {activeTab === 'baseline' && <State0Comparison />}
                    {activeTab === 'decision-support' && <DecisionSupportPanel />}
                    {activeTab === 'reports' && <ReportGenerator />}
                </main>

                {/* Right Contextual Component Drawer */}
                {selectedComponentId && <ComponentDrawer />}
            </div>
        </div>
    );
};

export default App;
