export type SensorSource = 'physical' | 'virtual';

export type SensorType =
    | 'strain'
    | 'accelerometer'
    | 'vibration'
    | 'displacement'
    | 'temperature'
    | 'tilt'
    | 'crack';

export type SensorStatus = 'normal' | 'warning' | 'critical' | 'offline';

export type AnomalySeverity = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface SpatialPosition {
    x: number;
    y: number;
    z: number;
}

export interface Sensor {
    id: string;
    name: string;
    type: SensorType;
    source: SensorSource;
    location: string;
    componentId: string;
    parameter: string;
    value: number;
    unit: string;
    timestamp: string;
    status: SensorStatus;
    position: SpatialPosition;
    baselineValue: number;
    confidence?: number; // 0 to 100 percentage for virtual sensors
    modelType?: string; // e.g. "PINN-Vibration-v2.1", "FE-Surrogate-DeepML"
    uncertaintyUpper?: number;
    uncertaintyLower?: number;
    history: { timestamp: string; value: number; baseline: number; uncertaintyUpper?: number; uncertaintyLower?: number }[];
}

export interface StructuralComponent {
    id: string;
    name: string;
    type: 'deck' | 'pier' | 'girder' | 'expansion_joint' | 'column' | 'abutment';
    healthScore: number;
    status: 'normal' | 'warning' | 'critical';
    sensorIds: string[];
    lastInspectionDate: string;
    material: string;
    lengthMeters: number;
    designCapacity: string;
    position: SpatialPosition;
    dimensions: { width: number; height: number; depth: number };
}

export interface Anomaly {
    id: string;
    severity: AnomalySeverity;
    componentId: string;
    componentName: string;
    sensorIds: string[];
    parameter: string;
    observedValue: number;
    baselineValue: number;
    deviationPercentage: number;
    confidence: number;
    explanation: {
        title: string;
        description: string;
        evidence: string[];
    }[];
    recommendedAction: {
        priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'SCHEDULED';
        action: string;
        inspectionsSuggested: string[];
    };
    engineeringRuleRef: string;
    createdAt: string;
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface EngineeringRule {
    id: string;
    codeReference: string; // e.g. "IRC:SP:35-2019 Cl. 4.2", "IRC:112-2020 Table 12.1"
    description: string;
    parameter: string;
    thresholdValue: number;
    thresholdType: 'MAX_LIMIT' | 'MIN_LIMIT' | 'DEVIATION_PCT';
    unit: string;
    sourceAuthority: string;
    configuredBy: string;
    verified: boolean;
    status: 'SAFE' | 'EXCEEDED';
}

export interface BaselineRecord {
    timestamp: string;
    version: string;
    stateName: string; // "State 0 - Post Commissioning Baseline (Jan 2024)"
    healthScore: number;
    metrics: {
        componentId: string;
        parameter: string;
        baselineValue: number;
        currentValue: number;
        unit: string;
        deltaPercentage: number;
    }[];
}

export interface HealthScoreBreakdown {
    overallScore: number;
    status: 'HEALTHY' | 'MONITOR' | 'WARNING' | 'CRITICAL';
    positiveFactors: string[];
    negativeFactors: string[];
    categoryScores: {
        flexuralStrain: number;
        dynamicVibration: number;
        deckDisplacement: number;
        jointExpansion: number;
    };
}

export type ConnectionState = 'LIVE' | 'DEGRADED' | 'OFFLINE';

export type HistoricalTimeframe = '7D' | '30D' | '6M' | '1Y' | '5Y';

// ============================================================
// ESP32 IoT / Structural Health Monitoring Types
// ============================================================

/** Calibrated accelerometer reading in g (already calibrated by ESP32) */
export interface AccelerometerReading {
    x: number; // g
    y: number; // g
    z: number; // g
}

/**
 * Full ESP32 → FastAPI → frontend message schema.
 *
 * The ESP32 performs sensor acquisition, calibration, 3-accelerometer
 * validation, feature extraction, and TinyML inference locally.
 * The frontend receives the processed result — it does NOT perform
 * inference, calibration, or rescaling.
 */
export interface IoTSensorData {
    type: 'sensor_update';
    node_id: string;
    timestamp?: number;    // Unix epoch seconds (if ESP32 has NTP)
    timestamp_ms?: number; // millis() from ESP32 (always available)

    sensors: {
        /** Primary TinyML accelerometer stream */
        mpu6500: AccelerometerReading;
        /** Secondary TinyML accelerometer stream */
        adxl345: AccelerometerReading;
        /** Redundant / validation reference ONLY — never used by TinyML */
        gy61: AccelerometerReading;
    };

    environment: {
        temperature: number; // °C (from DHT11)
        humidity: number;    // %  (from DHT11)
    };

    strain: {
        value: number | null; // null = HX711 + strain gauge not yet integrated
        unit: string;
    };

    /**
     * ESP32 3-accelerometer cross-validation result.
     * Compares GY-61 ↔ MPU6500, GY-61 ↔ ADXL345, MPU6500 ↔ ADXL345
     * independently for X, Y, Z axes.
     */
    validation: {
        status: 'OK' | 'ERROR';
        total_samples: number;
        bad_samples: number;
        allowed_bad_samples: number;
        deviation_threshold: number;
        maximum_deviation: number;
    };

    /**
     * TinyML inference result from ESP32.
     * null when sensor validation has failed — TinyML is NOT run.
     *
     * The 29-feature vector uses MPU6500 (features 0-11) and ADXL345
     * (features 12-23) accelerometer data, plus strain (24-26),
     * temperature (27), and humidity (28). GY-61 is NEVER in the
     * feature vector.
     */
    tinyml: {
        prediction: 'HEALTHY' | 'DAMAGED';
        damage_probability: number;
        healthy_probability: number;
    } | null;
}

/**
 * Overall bridge health state derived from IoT data.
 *
 * Precedence (evaluated top-to-bottom):
 *
 *   1. No data for timeout       → OFFLINE
 *   2. validation.status != "OK" → SENSOR_ERROR
 *   3. tinyml is null            → HEALTHY (inference pending)
 *   4. tinyml.prediction         → DAMAGED or HEALTHY
 *
 * IMPORTANT: Never display DAMAGED when validation has failed.
 * Sensor malfunction and structural damage are fundamentally
 * different conditions.
 */
export type BridgeHealthState =
    | 'HEALTHY'
    | 'DAMAGED'
    | 'SENSOR_ERROR'
    | 'OFFLINE';

/** WebSocket connection lifecycle states */
export type WsConnectionState =
    | 'CONNECTED'
    | 'CONNECTING'
    | 'DISCONNECTED'
    | 'ERROR'
    | 'RECONNECTING';

/** Single data point in a rolling time-series chart buffer */
export interface IoTHistoryPoint {
    /** Browser Date.now() when the message was received */
    receivedAt: number;
    value: number;
}

export type IoTNodeMap = Record<string, IoTSensorData>;

export type NodeConnectionState = {
    nodeId: string;
    lastSeen: number;
    status: 'LIVE' | 'OFFLINE';
    health: BridgeHealthState;
};

// ============================================================
// PINN Virtual Sensor Types
// ============================================================

export interface PinnVirtualSensor {
    sensor_id: string; // e.g. "VS_00" -> backend sends sensor_id, wait, backend log says "sensor_id": "VS_00", "x_normalized": 0.0
    x_normalized: number;
    pinn_displacement: number;

    // MPU6500 Features
    mpu_x_mean: number;
    mpu_x_std: number;
    mpu_x_rms: number;
    mpu_x_ptp: number;
    mpu_y_mean: number;
    mpu_y_std: number;
    mpu_y_rms: number;
    mpu_y_ptp: number;
    mpu_z_mean: number;
    mpu_z_std: number;
    mpu_z_rms: number;
    mpu_z_ptp: number;

    // ADXL345 Features
    adxl_x_mean: number;
    adxl_x_std: number;
    adxl_x_rms: number;
    adxl_x_ptp: number;
    adxl_y_mean: number;
    adxl_y_std: number;
    adxl_y_rms: number;
    adxl_y_ptp: number;
    adxl_z_mean: number;
    adxl_z_std: number;
    adxl_z_rms: number;
    adxl_z_ptp: number;

    // Strain Features
    strain_mean: number;
    strain_std: number;
    strain_ptp: number;

    // Environment Features
    temperature_mean: number;
    humidity_mean: number;

    // ML Predictions
    damage_probability: number;
    damage_probability_pct: number;
    healthy_probability: number;
    healthy_probability_pct: number;
    predicted_state: 'HEALTHY' | 'DAMAGED';
}

export interface PinnUpdate {
    type: 'pinn_update';
    source_nodes: string[];
    timestamp_ms: number;
    status: 'success' | 'ERROR';
    message?: string;
    num_virtual_sensors: number;
    virtual_sensors: PinnVirtualSensor[];
}
