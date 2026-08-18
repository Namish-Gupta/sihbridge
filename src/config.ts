/**
 * Centralized application configuration.
 *
 * All environment-specific values are read from Vite env variables
 * (VITE_* prefix). Never hardcode IPs, ports, or URLs in components.
 */

/** FastAPI REST base URL */
export const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** FastAPI WebSocket endpoint for real-time bridge data */
export const WS_URL: string =
    import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/bridge';

/** When true, generate mock IoT data in the browser instead of connecting to WebSocket */
export const USE_MOCK_DATA: boolean =
    import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * If no IoT data is received for this duration (ms), the bridge
 * health state transitions to OFFLINE.
 */
export const OFFLINE_TIMEOUT_MS = 30_000;

/**
 * Maximum number of data points kept in rolling chart buffers.
 * Prevents unbounded browser memory growth.
 */
export const MAX_CHART_POINTS = 500;

/**
 * VISUALIZATION-ONLY multiplier for Three.js bridge deformation.
 *
 * Real physical displacement from accelerometer data is far too
 * small to see at bridge scale. This factor exaggerates the visual
 * effect. It does NOT represent actual physical displacement and
 * MUST NOT be applied to engineering data displayed in dashboards.
 */
export const VISUALIZATION_SCALE = 1000;

/**
 * Interval (ms) at which the mock IoT service emits simulated
 * sensor updates. Approximates a real ESP32 window update rate.
 */
export const MOCK_INTERVAL_MS = 2000;
