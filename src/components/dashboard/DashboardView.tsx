import React from 'react';
import { IoTLivePanel } from './IoTLivePanel';
import { NodeSelector } from './NodeSelector';
import { PinnSummaryCard } from './PinnSummaryCard';

export const DashboardView: React.FC = () => {
    return (
        <div className="p-6 max-w-[1600px] mx-auto h-full overflow-y-auto bg-[#f8f9fa]">
            <NodeSelector />
            <IoTLivePanel />
            <PinnSummaryCard />
        </div>
    );
};
