import { IoTSensorData } from '../types/shm';
import { MOCK_INTERVAL_MS } from '../config';

type MockMessageCallback = (data: IoTSensorData) => void;

/**
 * Mock IoT data provider.
 *
 * Generates simulated ESP32 sensor data following EXACTLY the same
 * IoTSensorData schema as the real WebSocket backend. Used when
 * VITE_USE_MOCK_DATA=true so the frontend can be developed and
 * tested without the physical ESP32 or FastAPI server.
 */
class MockIoTService {
    private timer: ReturnType<typeof setInterval> | null = null;
    private callbacks: Set<MockMessageCallback> = new Set();
    private elapsedMs: number = 0;

    /** Start emitting mock data at MOCK_INTERVAL_MS intervals. */
    start(): void {
        if (this.timer) return;

        this.elapsedMs = 0;
        this.timer = setInterval(() => {
            this.elapsedMs += MOCK_INTERVAL_MS;
            
            // Generate NODE_01 (Healthy)
            const data1 = this.generateMockData('NODE_01', 'HEALTHY');
            // Generate NODE_02 (Damaged)
            const data2 = this.generateMockData('NODE_02', 'DAMAGED');
            
            const payloads = [data1, data2];

            // Generate NODE_03 (Error) and drop it off after 15 seconds to simulate OFFLINE
            if (this.elapsedMs <= 15000) {
                payloads.push(this.generateMockData('NODE_03', 'ERROR'));
            }

            this.callbacks.forEach((cb) => {
                try {
                    payloads.forEach(p => cb(p));
                } catch (err) {
                    console.error('[MockIoTService] Error in callback:', err);
                }
            });
        }, MOCK_INTERVAL_MS);
    }

    /** Stop emitting mock data. */
    stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /** Register a callback for mock messages. Returns unsubscribe function. */
    onMessage(cb: MockMessageCallback): () => void {
        this.callbacks.add(cb);
        return () => this.callbacks.delete(cb);
    }

    // ------- Private -------

    /** Generate a single mock IoTSensorData message for a specific node and condition. */
    private generateMockData(nodeId: string, forceStatus: 'HEALTHY' | 'DAMAGED' | 'ERROR' | 'RANDOM'): IoTSensorData {
        const isError = forceStatus === 'ERROR' || (forceStatus === 'RANDOM' && Math.random() < 0.05);
        const isDamaged = forceStatus === 'DAMAGED' || (forceStatus === 'RANDOM' && !isError && Math.random() < 0.08);

        // Base accelerometer values: stationary bridge ≈ (0, 0, 1g)
        const accelNoise = () => (Math.random() - 0.5) * 0.04; 
        const vibeNoise = () => (Math.random() - 0.5) * 0.01;  

        const mpu6500 = {
            x: 0.0 + accelNoise() + vibeNoise(),
            y: 0.0 + accelNoise() + vibeNoise(),
            z: 1.0 + accelNoise(),
        };

        const adxl345 = {
            x: 0.0 + accelNoise() + vibeNoise(),
            y: 0.0 + accelNoise() + vibeNoise(),
            z: 1.0 + accelNoise(),
        };

        // GY-61: validation reference. If error, introduce large deviation
        const gy61 = isError
            ? {
                x: mpu6500.x + (Math.random() - 0.5) * 2.0,
                y: mpu6500.y + (Math.random() - 0.5) * 2.0,
                z: mpu6500.z + (Math.random() - 0.5) * 2.0,
            }
            : {
                x: 0.0 + accelNoise() + vibeNoise(),
                y: 0.0 + accelNoise() + vibeNoise(),
                z: 1.0 + accelNoise(),
            };

        // Round all values for cleanliness
        const round3 = (v: number) => Math.round(v * 1000) / 1000;
        mpu6500.x = round3(mpu6500.x); mpu6500.y = round3(mpu6500.y); mpu6500.z = round3(mpu6500.z);
        adxl345.x = round3(adxl345.x); adxl345.y = round3(adxl345.y); adxl345.z = round3(adxl345.z);
        gy61.x = round3(gy61.x);       gy61.y = round3(gy61.y);       gy61.z = round3(gy61.z);

        const badSamples = isError ? Math.floor(Math.random() * 40) + 15 : Math.floor(Math.random() * 4);
        const validationOk = !isError;

        const temperature = Math.round((28 + Math.random() * 7) * 10) / 10; 
        const humidity = Math.round((55 + Math.random() * 25) * 10) / 10;   

        const tinyml = validationOk
            ? {
                prediction: (isDamaged ? 'DAMAGED' : 'HEALTHY') as 'HEALTHY' | 'DAMAGED',
                damage_probability: isDamaged
                    ? Math.round((0.55 + Math.random() * 0.40) * 100) / 100
                    : Math.round((Math.random() * 0.15) * 100) / 100,
                healthy_probability: 0, 
            }
            : null;

        if (tinyml) {
            tinyml.healthy_probability = Math.round((1 - tinyml.damage_probability) * 100) / 100;
        }

        return {
            type: 'sensor_update',
            node_id: nodeId,
            timestamp_ms: this.elapsedMs,
            sensors: { mpu6500, adxl345, gy61 },
            environment: { temperature, humidity },
            strain: { value: null, unit: 'microstrain' },
            validation: {
                status: validationOk ? 'OK' : 'ERROR',
                total_samples: 100,
                bad_samples: badSamples,
                allowed_bad_samples: 10,
                deviation_threshold: 0.30,
                maximum_deviation: isError
                    ? Math.round((0.4 + Math.random() * 0.8) * 1000) / 1000
                    : Math.round((Math.random() * 0.15) * 1000) / 1000,
            },
            tinyml,
        };
    }
}

/** Singleton mock IoT service instance */
export const mockIoTService = new MockIoTService();
