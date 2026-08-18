import { useEffect, useRef } from 'react';
import { useSHMStore } from '../store/useSHMStore';
import { websocketService } from '../services/websocketService';
import { mockIoTService } from '../services/mockIoTService';
import { USE_MOCK_DATA, WS_URL, OFFLINE_TIMEOUT_MS } from '../config';
import { IoTSensorData, WsConnectionState } from '../types/shm';

/**
 * React hook that manages the IoT data lifecycle.
 *
 * - Starts either WebSocket or mock provider based on USE_MOCK_DATA
 * - Subscribes to incoming messages → dispatches to store
 * - Detects offline state via useEffect timer
 * - Cleans up on unmount
 */
export function useBridgeData() {
    const processIoTMessage = useSHMStore((s) => s.processIoTMessage);
    const setWsConnectionState = useSHMStore((s) => s.setWsConnectionState);
    const setBridgeHealthState = useSHMStore((s) => s.setBridgeHealthState);

    // Refs to avoid stale closures in callbacks
    const processRef = useRef(processIoTMessage);
    const setWsRef = useRef(setWsConnectionState);
    const setHealthRef = useRef(setBridgeHealthState);
    processRef.current = processIoTMessage;
    setWsRef.current = setWsConnectionState;
    setHealthRef.current = setBridgeHealthState;

    // Start data source (WebSocket or mock)
    useEffect(() => {
        const unsubs: (() => void)[] = [];

        if (USE_MOCK_DATA) {
            // Mock mode: simulate ESP32 data in-browser
            setWsRef.current('CONNECTED'); // mock is always "connected"

            const unsub = mockIoTService.onMessage((data: IoTSensorData) => {
                processRef.current(data);
            });
            unsubs.push(unsub);
            mockIoTService.start();
        } else {
            // Real mode: connect to FastAPI WebSocket
            const unsubState = websocketService.onStateChange((state: WsConnectionState) => {
                setWsRef.current(state);
            });
            unsubs.push(unsubState);

            const unsubMsg = websocketService.onMessage((raw: unknown) => {
                const data = raw as any;
                
                // Lightweight runtime validator for expected ESP32 schema
                const isValid = (d: any): d is IoTSensorData => {
                    if (!d || typeof d !== 'object') return false;
                    if (d.type !== 'sensor_update') return false;
                    if (!d.node_id) return false;
                    if (!d.sensors || !d.sensors.mpu6500 || !d.sensors.adxl345 || !d.sensors.gy61) return false;
                    if (!d.environment) return false;
                    if (!d.validation) return false;
                    if (d.tinyml !== null) {
                        if (typeof d.tinyml !== 'object') return false;
                        if (!('prediction' in d.tinyml) || !('damage_probability' in d.tinyml) || !('healthy_probability' in d.tinyml)) return false;
                    }
                    return true;
                };

                if (isValid(data)) {
                    processRef.current(data);
                } else {
                    console.error('[useBridgeData] Malformed IoT JSON received. Rejecting message.', data);
                }
            });
            unsubs.push(unsubMsg);

            websocketService.connect(WS_URL);
        }

        return () => {
            unsubs.forEach((fn) => fn());
            if (USE_MOCK_DATA) {
                mockIoTService.stop();
            } else {
                websocketService.disconnect();
            }
        };
    }, []); // Run once on mount

    // Offline detection via periodic check
    useEffect(() => {
        const interval = setInterval(() => {
            const lastTs = useSHMStore.getState().lastIoTTimestamp;
            const currentHealth = useSHMStore.getState().bridgeHealthState;

            if (lastTs === null) {
                // Never received any data
                if (currentHealth !== 'OFFLINE') {
                    setHealthRef.current('OFFLINE');
                }
                return;
            }

            const elapsed = Date.now() - lastTs;
            if (elapsed > OFFLINE_TIMEOUT_MS && currentHealth !== 'OFFLINE') {
                setHealthRef.current('OFFLINE');
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);
}
