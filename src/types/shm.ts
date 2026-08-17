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
