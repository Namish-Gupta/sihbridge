from fastapi import APIRouter, HTTPException
from backend.schemas import IoTSensorData
from backend.websocket_manager import manager
import logging

logger = logging.getLogger("api.iot")

router = APIRouter()

@router.post("/data")
async def receive_iot_data(payload: IoTSensorData):
    """
    Receives JSON from the ESP32, validates the structure using Pydantic,
    and relays the exact validated payload to all connected React WebSockets.
    """
    # Log a brief summary without continuously dumping the entire payload
    prediction = payload.tinyml.prediction if payload.tinyml else "N/A (Pending)"
    logger.info(
        f"ESP32 DATA RECEIVED | Node: {payload.node_id} | "
        f"Temp: {payload.environment.temperature} | Humidity: {payload.environment.humidity} | "
        f"Validation: {payload.validation.status} | Prediction: {prediction} | "
        f"Connected WebSocket clients: {len(manager.active_connections)}"
    )
    
    # Broadcast the exact, validated dictionary matching the ESP32 JSON schema
    await manager.broadcast(payload.model_dump())
    
    return {"status": "received"}
