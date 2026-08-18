import httpx
import asyncio
import copy

BASE_URL = "http://localhost:8000/api/iot/data"

VALID_PAYLOAD = {
    "type": "sensor_update",
    "node_id": "NODE_TEST_01",
    "timestamp_ms": 123456789,
    "sensors": {
        "mpu6500": {"x": 0.01, "y": 0.02, "z": 0.99},
        "adxl345": {"x": 0.02, "y": 0.01, "z": 1.01},
        "gy61": {"x": 0.01, "y": 0.02, "z": 1.00}
    },
    "environment": {
        "temperature": 30.6,
        "humidity": 68.0
    },
    "strain": {
        "value": None,
        "unit": "microstrain"
    },
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
}

async def send_payload(client: httpx.AsyncClient, name: str, payload: dict):
    print(f"\n--- Sending {name} ---")
    response = await client.post(BASE_URL, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    await asyncio.sleep(3)  # Wait a bit between messages

async def run_tests():
    async with httpx.AsyncClient() as client:
        # 1. Normal Healthy Payload
        await send_payload(client, "Normal/Healthy Data", VALID_PAYLOAD)

        # 2. Sensor Error Payload (must have tinyml=null)
        error_payload = copy.deepcopy(VALID_PAYLOAD)
        error_payload["validation"]["status"] = "ERROR"
        error_payload["validation"]["bad_samples"] = 25
        error_payload["validation"]["maximum_deviation"] = 1.42
        error_payload["tinyml"] = None
        await send_payload(client, "Sensor Error Data", error_payload)

        # 3. Damaged Payload
        damaged_payload = copy.deepcopy(VALID_PAYLOAD)
        damaged_payload["tinyml"]["prediction"] = "DAMAGED"
        damaged_payload["tinyml"]["damage_probability"] = 0.85
        damaged_payload["tinyml"]["healthy_probability"] = 0.15
        await send_payload(client, "Damaged Data", damaged_payload)

        # 4. Malformed Payload (missing sensors)
        malformed = copy.deepcopy(VALID_PAYLOAD)
        del malformed["sensors"]
        await send_payload(client, "Malformed Data (Missing Sensors)", malformed)

if __name__ == "__main__":
    asyncio.run(run_tests())
