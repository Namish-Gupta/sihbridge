import requests
import json
import time

def send_node(node_id):
    print(f"Sending {node_id}...")
    url = "http://localhost:8000/api/iot/data"
    payload = get_base_payload(node_id)
    try:
        requests.post(url, json=payload, timeout=2)
    except Exception as e:
        print(f"Error POSTing to {node_id}: {e}")

def get_base_payload(node_id):
    return {
        "type": "sensor_update",
        "node_id": node_id,
        "timestamp_ms": int(time.time() * 1000),
        "sensors": {
            "mpu6500": {"x": 0.0, "y": 0.0, "z": 0.0},
            "adxl345": {"x": 0.0, "y": 0.0, "z": 0.0},
            "gy61": {"x": 0.0, "y": 0.0, "z": 0.0}
        },
        "environment": {"temperature": 25.0, "humidity": 50.0},
        "strain": {"value": 0.0, "unit": "microstrain"},
        "validation": {
            "status": "OK",
            "total_samples": 100,
            "bad_samples": 0,
            "allowed_bad_samples": 10,
            "deviation_threshold": 0.3,
            "maximum_deviation": 0.1
        },
        "tinyml": {
            "prediction": "HEALTHY",
            "damage_probability": 0.15,
            "healthy_probability": 0.85
        },
        "features": [0.1] * 29
    }

def post(payload):
    try:
        requests.post("http://localhost:8000/api/iot/data", json=payload, timeout=2)
    except Exception as e:
        print(f"Error POSTing to {payload['node_id']}: {e}")

print("Sending NODE_01...")
post(get_base_payload("NODE_01"))

print("Sent! Check backend logs for simulated NODE_02 generation and PINN execution output.")
