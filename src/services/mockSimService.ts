import { useSHMStore } from '../store/useSHMStore';
import { Sensor } from '../types/shm';

class MockSimService {
    private timer: number | null = null;
    private networkTimer: number | null = null;

    start() {
        if (this.timer) return;

        // Sensor telemetry tick every 2.5 seconds
        this.timer = window.setInterval(() => {
            const state = useSHMStore.getState();
            if (!state.isSimulating) return;

            state.updateSensors((currentSensors) => {
                return currentSensors.map((sensor) => {
                    // Add micro fluctuation around current value
                    const noise = (Math.random() - 0.49) * (sensor.type === 'vibration' ? 0.05 : 1.5);
                    const newValue = Number(Math.max(0, sensor.value + noise).toFixed(1));

                    const nowStr = new Date().toLocaleTimeString();

                    // Keep history capped at 30 items
                    const updatedHistory = [
                        ...sensor.history.slice(1),
                        {
                            timestamp: nowStr,
                            value: newValue,
                            baseline: sensor.baselineValue,
                            uncertaintyUpper: sensor.source === 'virtual' ? Number((newValue * 1.035).toFixed(1)) : undefined,
                            uncertaintyLower: sensor.source === 'virtual' ? Number((newValue * 0.965).toFixed(1)) : undefined,
                        },
                    ];

                    return {
                        ...sensor,
                        value: newValue,
                        timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
                        history: updatedHistory,
                    };
                });
            });
        }, 2500);

        // Network connection state toggle simulation (rare)
        this.networkTimer = window.setInterval(() => {
            const chance = Math.random();
            const store = useSHMStore.getState();
            if (chance < 0.05) {
                store.setConnectionState('DEGRADED');
            } else if (chance < 0.02) {
                store.setConnectionState('OFFLINE');
            } else if (store.connectionState !== 'LIVE') {
                store.setConnectionState('LIVE');
            }
        }, 15000);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.networkTimer) {
            clearInterval(this.networkTimer);
            this.networkTimer = null;
        }
    }
}

export const mockSimService = new MockSimService();
