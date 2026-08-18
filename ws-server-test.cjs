const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

console.log('Test WebSocket Server running on ws://localhost:8000/ws/bridge');

wss.on('connection', function connection(ws, req) {
    if (req.url !== '/ws/bridge') {
        ws.close();
        return;
    }
    
    console.log('Client connected to /ws/bridge');

    const testNormalMessage = {
        "type": "sensor_update",
        "node_id": "NODE_01",
        "timestamp_ms": 123456,
        "sensors": {
            "mpu6500": { "x": 0.01, "y": 0.02, "z": 0.99 },
            "adxl345": { "x": 0.02, "y": 0.01, "z": 1.01 },
            "gy61": { "x": 0.01, "y": 0.02, "z": 1.00 }
        },
        "environment": { "temperature": 30.6, "humidity": 68 },
        "strain": { "value": null, "unit": "microstrain" },
        "validation": {
            "status": "OK",
            "total_samples": 100,
            "bad_samples": 0,
            "allowed_bad_samples": 10,
            "deviation_threshold": 0.30,
            "maximum_deviation": 0.083
        },
        "tinyml": {
            "prediction": "HEALTHY",
            "damage_probability": 0.08,
            "healthy_probability": 0.92
        }
    };

    const testSensorErrorMessage = {
        "type": "sensor_update",
        "node_id": "NODE_01",
        "timestamp_ms": 123456,
        "sensors": {
            "mpu6500": { "x": 0.01, "y": 0.02, "z": 0.99 },
            "adxl345": { "x": 0.02, "y": 0.01, "z": 1.01 },
            "gy61": { "x": 0.01, "y": 0.02, "z": 1.00 }
        },
        "environment": { "temperature": 30.6, "humidity": 68 },
        "strain": { "value": null, "unit": "microstrain" },
        "validation": {
            "status": "ERROR",
            "total_samples": 100,
            "bad_samples": 25,
            "allowed_bad_samples": 10,
            "deviation_threshold": 0.30,
            "maximum_deviation": 1.42
        },
        "tinyml": null
    };

    const testDamagedMessage = {
        "type": "sensor_update",
        "node_id": "NODE_01",
        "timestamp_ms": 123456,
        "sensors": {
            "mpu6500": { "x": 0.01, "y": 0.02, "z": 0.99 },
            "adxl345": { "x": 0.02, "y": 0.01, "z": 1.01 },
            "gy61": { "x": 0.01, "y": 0.02, "z": 1.00 }
        },
        "environment": { "temperature": 30.6, "humidity": 68 },
        "strain": { "value": null, "unit": "microstrain" },
        "validation": {
            "status": "OK",
            "total_samples": 100,
            "bad_samples": 0,
            "allowed_bad_samples": 10,
            "deviation_threshold": 0.30,
            "maximum_deviation": 0.083
        },
        "tinyml": {
            "prediction": "DAMAGED",
            "damage_probability": 0.85,
            "healthy_probability": 0.15
        }
    };

    let step = 0;
    const interval = setInterval(() => {
        let msg;
        if (step < 5) {
            msg = testNormalMessage;
        } else if (step < 10) {
            msg = testSensorErrorMessage;
        } else if (step < 15) {
            msg = testDamagedMessage;
        } else if (step < 20) {
            // Test offline: stop sending messages
            return;
        } else {
            step = 0; // restart cycle
            return;
        }
        
        // update timestamp
        if(msg) {
            msg.timestamp_ms = Date.now();
            ws.send(JSON.stringify(msg));
        }
        step++;
    }, 2000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});
