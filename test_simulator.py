from backend.simulator import generate_simulated_node_02
from backend.schemas import IoTSensorData

def run_simulator_tests():
    ts = 1690000000000
    
    # 1. Test HEALTHY Mode
    payload_healthy = generate_simulated_node_02(timestamp_ms=ts, mode="HEALTHY")
    
    # 9. Passes validation implicitly because generate_simulated_node_02 returns IoTSensorData
    assert isinstance(payload_healthy, IoTSensorData)
    
    # 3. node_id == NODE_02
    assert payload_healthy.node_id == "NODE_02"
    
    # 4. timestamp_ms matches
    assert payload_healthy.timestamp_ms == ts
    
    # 1. Exactly 29 features
    assert len(payload_healthy.features) == 29
    
    # 2. Correct feature order (just check first one to see if it's there)
    assert payload_healthy.features[0] == 0.0 # MPU X mean
    
    # 5. validation.status == OK
    assert payload_healthy.validation.status == "OK"
    
    # 6 & 8. HEALTHY mode probabilities
    assert payload_healthy.tinyml.prediction == "HEALTHY"
    assert abs((payload_healthy.tinyml.healthy_probability + payload_healthy.tinyml.damage_probability) - 1.0) < 1e-5
    assert payload_healthy.tinyml.healthy_probability > 0.8
    
    # 7 & 8. Test DAMAGED Mode
    payload_damaged = generate_simulated_node_02(timestamp_ms=ts, mode="DAMAGED")
    assert payload_damaged.tinyml.prediction == "DAMAGED"
    assert abs((payload_damaged.tinyml.healthy_probability + payload_damaged.tinyml.damage_probability) - 1.0) < 1e-5
    assert payload_damaged.tinyml.damage_probability > 0.7
    
    print("All simulator unit tests passed!")

if __name__ == "__main__":
    run_simulator_tests()
