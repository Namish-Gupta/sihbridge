from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class AccelerometerReading(BaseModel):
    x: float
    y: float
    z: float

class Sensors(BaseModel):
    mpu6500: AccelerometerReading
    adxl345: AccelerometerReading
    gy61: AccelerometerReading

class Environment(BaseModel):
    temperature: float
    humidity: float

class Strain(BaseModel):
    value: Optional[float]
    unit: str

class Validation(BaseModel):
    status: Literal["OK", "ERROR"]
    total_samples: int
    bad_samples: int
    allowed_bad_samples: int
    deviation_threshold: float
    maximum_deviation: float

class TinyML(BaseModel):
    prediction: Literal["HEALTHY", "DAMAGED"]
    damage_probability: float
    healthy_probability: float

class IoTSensorData(BaseModel):
    type: Literal["sensor_update"] = "sensor_update"
    node_id: str
    timestamp: Optional[int] = None
    timestamp_ms: int
    sensors: Sensors
    environment: Environment
    strain: Strain
    validation: Validation
    tinyml: Optional[TinyML]
    features: List[float] = Field(..., min_length=29, max_length=29)
