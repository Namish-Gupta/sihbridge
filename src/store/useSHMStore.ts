import { create } from 'zustand';
import {
    StructuralComponent,
    Sensor,
    Anomaly,
    EngineeringRule,
    HealthScoreBreakdown,
    ConnectionState,
    SensorSource,
    IoTSensorData,
    BridgeHealthState,
    WsConnectionState,
    IoTHistoryPoint,
    IoTNodeMap,
    NodeConnectionState,
    PinnUpdate,
} from '../types/shm';
import {
    INITIAL_COMPONENTS,
    INITIAL_SENSORS,
    INITIAL_ANOMALIES,
    INITIAL_RULES,
    INITIAL_HEALTH_SCORE
} from '../data/mockBridgeData';
import { MAX_CHART_POINTS } from '../config';

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

// ============================================================
// IoT rolling buffer history keys
// ============================================================
export const IOT_HISTORY_KEYS = [
    'mpu6500_x', 'mpu6500_y', 'mpu6500_z',
    'adxl345_x', 'adxl345_y', 'adxl345_z',
    'gy61_x', 'gy61_y', 'gy61_z',
    'temperature', 'humidity',
    'strain',
    'damage_probability',
] as const;

export type IoTHistoryKey = typeof IOT_HISTORY_KEYS[number];

function createEmptyHistory(): Record<IoTHistoryKey, IoTHistoryPoint[]> {
    const h = {} as Record<IoTHistoryKey, IoTHistoryPoint[]>;
    for (const key of IOT_HISTORY_KEYS) {
        h[key] = [];
    }
    return h;
}

/** Push a value to a bounded rolling buffer */
function pushToBuffer(
    buffer: IoTHistoryPoint[],
    value: number,
    receivedAt: number
): IoTHistoryPoint[] {
    const next = [...buffer, { receivedAt, value }];
    if (next.length > MAX_CHART_POINTS) {
        return next.slice(next.length - MAX_CHART_POINTS);
    }
    return next;
}

interface SHMState {
    // ---- Existing state (unchanged) ----
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

    // ---- IoT / ESP32 state (new multi-node) ----
    wsConnectionState: WsConnectionState;    // ---- IoT / ESP32 state (new multi-node) ----
    iotNodes: IoTNodeMap;
    iotHistoryByNode: Record<string, Record<IoTHistoryKey, IoTHistoryPoint[]>>;
    nodeStatuses: Record<string, NodeConnectionState>;
    selectedNodeId: string | null;

    // ---- PINN State ----
    pinnData: PinnUpdate | null;
    selectedVirtualSensorId: string | null;

    // ---- Existing actions (unchanged) ----
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

    // ---- IoT actions (updated) ----
    processIoTMessage: (data: IoTSensorData) => void;
    setWsConnectionState: (state: WsConnectionState) => void;

    // ---- IoT actions (new) ----
    setSelectedNode: (nodeId: string | null) => void;
    setNodeStatus: (nodeId: string, status: 'LIVE' | 'OFFLINE') => void;

    // ---- PINN actions ----
    setPinnData: (data: PinnUpdate | null) => void;
    selectVirtualSensor: (id: string | null) => void;
}

export const useSHMStore = create<SHMState>((set, get) => ({
    // ---- Existing state ----
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

    // ---- IoT state (new) ----
    wsConnectionState: 'DISCONNECTED',
    iotNodes: {},
    iotHistoryByNode: {},
    nodeStatuses: {},
    selectedNodeId: null,

    // ---- PINN state ----
    pinnData: null,
    selectedVirtualSensorId: null,

    // ---- Existing actions ----
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

    // ---- IoT actions ----

    processIoTMessage: (data: IoTSensorData) => {
        const now = Date.now();
        const nodeId = data.node_id;
        
        if (!nodeId) return; // Ignore missing node_id

        const state = get();
        
        // Derive health state
        let healthState: BridgeHealthState;
        if (data.validation.status !== 'OK') {
            healthState = 'SENSOR_ERROR';
        } else if (data.tinyml === null) {
            healthState = 'HEALTHY';
        } else if (data.tinyml.prediction === 'DAMAGED') {
            healthState = 'DAMAGED';
        } else {
            healthState = 'HEALTHY';
        }

        // 1. Update Multi-Node State
        const newNodes = { ...state.iotNodes, [nodeId]: data };
        const newNodeStatuses = {
            ...state.nodeStatuses,
            [nodeId]: {
                nodeId,
                lastSeen: now,
                status: 'LIVE' as const,
                health: healthState
            }
        };

        // Update history for this node specifically
        const nodeHistory = state.iotHistoryByNode[nodeId] || createEmptyHistory();
        const newHistory = { ...nodeHistory };
        newHistory.mpu6500_x = pushToBuffer(newHistory.mpu6500_x, data.sensors.mpu6500.x, now);
        newHistory.mpu6500_y = pushToBuffer(newHistory.mpu6500_y, data.sensors.mpu6500.y, now);
        newHistory.mpu6500_z = pushToBuffer(newHistory.mpu6500_z, data.sensors.mpu6500.z, now);
        newHistory.adxl345_x = pushToBuffer(newHistory.adxl345_x, data.sensors.adxl345.x, now);
        newHistory.adxl345_y = pushToBuffer(newHistory.adxl345_y, data.sensors.adxl345.y, now);
        newHistory.adxl345_z = pushToBuffer(newHistory.adxl345_z, data.sensors.adxl345.z, now);
        newHistory.gy61_x = pushToBuffer(newHistory.gy61_x, data.sensors.gy61.x, now);
        newHistory.gy61_y = pushToBuffer(newHistory.gy61_y, data.sensors.gy61.y, now);
        newHistory.gy61_z = pushToBuffer(newHistory.gy61_z, data.sensors.gy61.z, now);
        newHistory.temperature = pushToBuffer(newHistory.temperature, data.environment.temperature, now);
        newHistory.humidity = pushToBuffer(newHistory.humidity, data.environment.humidity, now);
        newHistory.strain = pushToBuffer(newHistory.strain, data.strain.value ?? 0, now);
        newHistory.damage_probability = pushToBuffer(newHistory.damage_probability, data.tinyml?.damage_probability ?? 0, now);

        const newHistoryByNode = { ...state.iotHistoryByNode, [nodeId]: newHistory };

        // Select the first node if none is selected
        const newSelectedNodeId = state.selectedNodeId === null ? nodeId : state.selectedNodeId;

        set({
            // New multi-node updates
            iotNodes: newNodes,
            nodeStatuses: newNodeStatuses,
            iotHistoryByNode: newHistoryByNode,
            selectedNodeId: newSelectedNodeId,
        });
    },

    setWsConnectionState: (state) => set({ wsConnectionState: state }),

    setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

    setNodeStatus: (nodeId, status) => {
        const currentStatus = get().nodeStatuses[nodeId];
        if (currentStatus && currentStatus.status !== status) {
            set((state) => ({
                nodeStatuses: {
                    ...state.nodeStatuses,
                    [nodeId]: {
                        ...currentStatus,
                        status
                    }
                }
            }));
        }
    },

    // ---- PINN actions ----
    setPinnData: (data) => set({ pinnData: data }),
    selectVirtualSensor: (id) => set({ selectedVirtualSensorId: id }),
}));
