import requests
import json
import time

url = "http://localhost:8001/api/iot/data"

def get_base_payload():
    return {
        "type": "sensor_update",
        "node_id": "NODE_TEST",
        "timestamp_ms": 12345678,
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
        "tinyml": None
    }

def run_test(name, features_array, expected_status):
    print(f"--- Running Test: {name} ---")
    payload = get_base_payload()
    payload["features"] = features_array
    
    try:
        response = requests.post(url, json=payload, timeout=2)
        print(f"Expected: {expected_status}, Got: {response.status_code}")
        if response.status_code != expected_status:
            print(f"FAIL! Response body: {response.text}")
            return False
        else:
            print("PASS")
            return True
    except Exception as e:
        print(f"Error: {e}")
        return False

# 1. Valid 29-feature POST
valid_29 = [0.0] * 29
run_test("Valid 29-feature POST", valid_29, 200)

# 2. 28-feature rejection
invalid_28 = [0.0] * 28
run_test("28-feature rejection test", invalid_28, 422)

# 3. 30-feature rejection
invalid_30 = [0.0] * 30
run_test("30-feature rejection test", invalid_30, 422)

# 4. Malformed-feature rejection
invalid_malformed = [0.0] * 28 + ["abc"]
run_test("Malformed-feature rejection test", invalid_malformed, 422)

