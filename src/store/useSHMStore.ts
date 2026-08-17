import { create } from 'zustand';
import {
    StructuralComponent,
    Sensor,
    Anomaly,
    EngineeringRule,
    HealthScoreBreakdown,
    ConnectionState,
    SensorSource
} from '../types/shm';
import {
    INITIAL_COMPONENTS,
    INITIAL_SENSORS,
    INITIAL_ANOMALIES,
    INITIAL_RULES,
    INITIAL_HEALTH_SCORE
} from '../data/mockBridgeData';

export type TabType =
    | 'dashboard'
    | 'digital-twin'
    | 'sensors'
    | 'analytics'
    | 'alerts'
    | 'baseline'
    | 'decision-support'
    | 'reports';

export type State0Mode = 'slider' | 'overlay' | 'split' | 'difference';

interface SHMState {
    activeTab: TabType;
    selectedComponentId: string | null;
    focusedAnomalyId: string | null;
    components: StructuralComponent[];
    sensors: Sensor[];
    anomalies: Anomaly[];
    rules: EngineeringRule[];
    healthScore: HealthScoreBreakdown;
    connectionState: ConnectionState;
    lastSyncTimestamp: string;
    isSimulating: boolean;
    sensorFilter: 'all' | SensorSource;
    state0Mode: State0Mode;
    state0SliderPos: number; // 0 (State 0) to 100 (Current)
    cameraTarget: [number, number, number] | null;

    // Actions
    setActiveTab: (tab: TabType) => void;
    selectComponent: (id: string | null) => void;
    focusAnomaly: (id: string | null) => void;
    setConnectionState: (state: ConnectionState) => void;
    toggleSimulation: () => void;
    setSensorFilter: (filter: 'all' | SensorSource) => void;
    setState0Mode: (mode: State0Mode) => void;
    setState0SliderPos: (pos: number) => void;
    setCameraTarget: (target: [number, number, number] | null) => void;
    updateSensors: (updater: (sensors: Sensor[]) => Sensor[]) => void;
    acknowledgeAnomaly: (anomalyId: string) => void;
    resetView: () => void;
}

export const useSHMStore = create<SHMState>((set, get) => ({
    activeTab: 'dashboard',
    selectedComponentId: 'pier-p3', // Default selected to the critical component
    focusedAnomalyId: 'ANOM-2026-091',
    components: INITIAL_COMPONENTS,
    sensors: INITIAL_SENSORS,
    anomalies: INITIAL_ANOMALIES,
    rules: INITIAL_RULES,
    healthScore: INITIAL_HEALTH_SCORE,
    connectionState: 'LIVE',
    lastSyncTimestamp: new Date().toLocaleTimeString(),
    isSimulating: true,
    sensorFilter: 'all',
    state0Mode: 'difference',
    state0SliderPos: 100, // Default to Current State
    cameraTarget: [15, -2, 0], // Focused on Pier P3 initially

    setActiveTab: (tab) => set({ activeTab: tab }),

    selectComponent: (id) => {
        const component = get().components.find((c) => c.id === id);
        set({
            selectedComponentId: id,
            cameraTarget: component ? [component.position.x, component.position.y, component.position.z] : null,
        });
    },

    focusAnomaly: (id) => {
        const anomaly = get().anomalies.find((a) => a.id === id);
        if (anomaly) {
            const component = get().components.find((c) => c.id === anomaly.componentId);
            set({
                focusedAnomalyId: id,
                selectedComponentId: anomaly.componentId,
                activeTab: 'digital-twin',
                cameraTarget: component ? [component.position.x, component.position.y, component.position.z] : null,
            });
        }
    },

    setConnectionState: (state) => set({ connectionState: state }),

    toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

    setSensorFilter: (filter) => set({ sensorFilter: filter }),

    setState0Mode: (mode) => set({ state0Mode: mode }),

    setState0SliderPos: (pos) => set({ state0SliderPos: pos }),

    setCameraTarget: (target) => set({ cameraTarget: target }),

    updateSensors: (updater) => {
        const newSensors = updater(get().sensors);
        set({
            sensors: newSensors,
            lastSyncTimestamp: new Date().toLocaleTimeString(),
        });
    },

    acknowledgeAnomaly: (anomalyId) => {
        set((state) => ({
            anomalies: state.anomalies.map((a) =>
                a.id === anomalyId ? { ...a, status: 'ACKNOWLEDGED' as const } : a
            ),
        }));
    },

    resetView: () => {
        set({
            selectedComponentId: null,
            focusedAnomalyId: null,
            cameraTarget: [0, 0, 0],
        });
    },
}));
