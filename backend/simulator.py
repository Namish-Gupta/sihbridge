from backend.schemas import IoTSensorData, Sensors, AccelerometerReading, Environment, Strain, Validation, TinyML

def generate_simulated_node_02(timestamp_ms: int, mode: str) -> IoTSensorData:
    """
    DEVELOPMENT-ONLY simulator to provide a valid boundary-node input 
    to the existing PINN service. It mimics the schema of a real ESP32-S3.
    """
    # 1. Environment Baseline
    temp = 30.0
    hum = 65.0

    # 2. Strain Baseline
    strain_val = 80.0

    # 3. Validation Status
    validation = Validation(
        status="OK",
        total_samples=100,
        bad_samples=0,
        allowed_bad_samples=10,
        deviation_threshold=0.3,
        maximum_deviation=0.05
    )

    # 4. TinyML / ML Probabilities
    if mode == "HEALTHY":
        tinyml = TinyML(
            prediction="HEALTHY",
            damage_probability=0.10,
            healthy_probability=0.90
        )
    elif mode == "DAMAGED":
        tinyml = TinyML(
            prediction="DAMAGED",
            damage_probability=0.80,
            healthy_probability=0.20
        )
    else:
        # Default fallback
        tinyml = TinyML(
            prediction="HEALTHY",
            damage_probability=0.10,
            healthy_probability=0.90
        )

    # 5. Raw Sensors (for frontend display)
    sensors = Sensors(
        mpu6500=AccelerometerReading(x=0.0, y=0.0, z=1.0),
        adxl345=AccelerometerReading(x=0.0, y=0.0, z=1.0),
        gy61=AccelerometerReading(x=0.0, y=0.0, z=1.0)
    )

    # 6. EXACT 29 Features (for PINN)
    # Order: 
    # 0-3: MPU X (mean, std, rms, ptp)
    # 4-7: MPU Y (mean, std, rms, ptp)
    # 8-11: MPU Z (mean, std, rms, ptp)
    # 12-15: ADXL X (mean, std, rms, ptp)
    # 16-19: ADXL Y (mean, std, rms, ptp)
    # 20-23: ADXL Z (mean, std, rms, ptp)
    # 24-26: Strain (mean, std, ptp)
    # 27: Temp mean
    # 28: Hum mean
    features = [
        # MPU X
        0.0, 0.01, 0.01, 0.05,
        # MPU Y
        0.0, 0.01, 0.01, 0.05,
        # MPU Z
        1.0, 0.02, 1.0, 0.1,
        
        # ADXL X
        0.0, 0.01, 0.01, 0.05,
        # ADXL Y
        0.0, 0.01, 0.01, 0.05,
        # ADXL Z
        1.0, 0.02, 1.0, 0.1,
        
        # Strain
        strain_val, 1.0, 5.0,
        
        # Environment
        temp,
        hum
    ]

    payload = IoTSensorData(
        type="sensor_update",
        node_id="NODE_02",
        timestamp=int(timestamp_ms / 1000),
        timestamp_ms=timestamp_ms,
        sensors=sensors,
        environment=Environment(temperature=temp, humidity=hum),
        strain=Strain(value=strain_val, unit="microstrain"),
        validation=validation,
        tinyml=tinyml,
        features=features
    )

    return payload
