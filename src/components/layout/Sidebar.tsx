import React from 'react';
import { useSHMStore, TabType } from '../../store/useSHMStore';
import {
    LayoutDashboard,
    Box
} from 'lucide-react';

interface NavItem {
    id: TabType;
    label: string;
    icon: React.ElementType;
}

export const Sidebar: React.FC = () => {
    const activeTab = useSHMStore((state) => state.activeTab);
    const setActiveTab = useSHMStore((state) => state.setActiveTab);

    const navItems: NavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'digital-twin', label: '3D Digital Twin', icon: Box },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between select-none z-20">
            {/* Navigation Links */}
            <div className="p-4 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Navigation
                </div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                <span>{item.label}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};
