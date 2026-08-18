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
const IOT_HISTORY_KEYS = [
    'mpu6500_x', 'mpu6500_y', 'mpu6500_z',
    'adxl345_x', 'adxl345_y', 'adxl345_z',
    'gy61_x', 'gy61_y', 'gy61_z',
    'temperature', 'humidity',
    'strain',
    'damage_probability',
] as const;

type IoTHistoryKey = typeof IOT_HISTORY_KEYS[number];

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

    // ---- IoT / ESP32 state (new) ----
    iotData: IoTSensorData | null;
    bridgeHealthState: BridgeHealthState;
    wsConnectionState: WsConnectionState;
    iotHistory: Record<IoTHistoryKey, IoTHistoryPoint[]>;
    lastIoTTimestamp: number | null; // Browser Date.now() at last receipt

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

    // ---- IoT actions (new) ----
    processIoTMessage: (data: IoTSensorData) => void;
    setWsConnectionState: (state: WsConnectionState) => void;
    setBridgeHealthState: (state: BridgeHealthState) => void;
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

    // ---- IoT state ----
    iotData: null,
    bridgeHealthState: 'OFFLINE',
    wsConnectionState: 'DISCONNECTED',
    iotHistory: createEmptyHistory(),
    lastIoTTimestamp: null,

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

    /**
     * Process an incoming IoT message from ESP32 (via WebSocket or mock).
     *
     * Updates iotData, pushes to rolling history buffers, derives
     * the bridge health state using explicit precedence:
     *
     *   1. validation.status != "OK" → SENSOR_ERROR
     *   2. tinyml is null            → HEALTHY (inference pending)
     *   3. tinyml.prediction         → DAMAGED or HEALTHY
     *
     * OFFLINE is set externally by the useBridgeData hook timeout.
     */
    processIoTMessage: (data: IoTSensorData) => {
        const now = Date.now();
        const history = { ...get().iotHistory };

        // Push accelerometer values to rolling buffers
        history.mpu6500_x = pushToBuffer(history.mpu6500_x, data.sensors.mpu6500.x, now);
        history.mpu6500_y = pushToBuffer(history.mpu6500_y, data.sensors.mpu6500.y, now);
        history.mpu6500_z = pushToBuffer(history.mpu6500_z, data.sensors.mpu6500.z, now);
        history.adxl345_x = pushToBuffer(history.adxl345_x, data.sensors.adxl345.x, now);
        history.adxl345_y = pushToBuffer(history.adxl345_y, data.sensors.adxl345.y, now);
        history.adxl345_z = pushToBuffer(history.adxl345_z, data.sensors.adxl345.z, now);
        history.gy61_x = pushToBuffer(history.gy61_x, data.sensors.gy61.x, now);
        history.gy61_y = pushToBuffer(history.gy61_y, data.sensors.gy61.y, now);
        history.gy61_z = pushToBuffer(history.gy61_z, data.sensors.gy61.z, now);

        // Push environment values
        history.temperature = pushToBuffer(history.temperature, data.environment.temperature, now);
        history.humidity = pushToBuffer(history.humidity, data.environment.humidity, now);

        // Push strain (0 if null / pending integration)
        history.strain = pushToBuffer(history.strain, data.strain.value ?? 0, now);

        // Push damage probability (0 if TinyML not available)
        history.damage_probability = pushToBuffer(
            history.damage_probability,
            data.tinyml?.damage_probability ?? 0,
            now
        );

        // Derive health state (precedence: SENSOR_ERROR > DAMAGED > HEALTHY)
        // OFFLINE is handled externally by useBridgeData timeout
        let healthState: BridgeHealthState;
        if (data.validation.status !== 'OK') {
            healthState = 'SENSOR_ERROR';
        } else if (data.tinyml === null) {
            healthState = 'HEALTHY'; // Validation OK but inference pending
        } else if (data.tinyml.prediction === 'DAMAGED') {
            healthState = 'DAMAGED';
        } else {
            healthState = 'HEALTHY';
        }

        set({
            iotData: data,
            iotHistory: history,
            lastIoTTimestamp: now,
            bridgeHealthState: healthState,
        });
    },

    setWsConnectionState: (state) => set({ wsConnectionState: state }),

    setBridgeHealthState: (state) => set({ bridgeHealthState: state }),
}));
