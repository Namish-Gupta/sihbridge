from fastapi import APIRouter, HTTPException
from backend.schemas import IoTSensorData
from backend.websocket_manager import manager
import logging

logger = logging.getLogger("api.iot")

router = APIRouter()

import os
import asyncio
from backend import pinn_service
from backend.simulator import generate_simulated_node_02

async def process_iot_payload(payload: IoTSensorData):
    """
    Common processing logic for both real and simulated payloads.
    """
    prediction = payload.tinyml.prediction if payload.tinyml else "N/A (Pending)"
    logger.info(
        f"ESP32 DATA RECEIVED | Node: {payload.node_id} | "
        f"Temp: {payload.environment.temperature} | Humidity: {payload.environment.humidity} | "
        f"Validation: {payload.validation.status} | Prediction: {prediction} | "
        f"Connected WebSocket clients: {len(manager.active_connections)}"
    )
    
    # Broadcast the exact, validated dictionary matching the ESP32 JSON schema
    await manager.broadcast(payload.model_dump())
    
    # Process payload in the background for PINN inference
    asyncio.create_task(pinn_service.process_payload(payload))

@router.post("/data")
async def receive_iot_data(payload: IoTSensorData):
    """
    Receives JSON from the ESP32, validates the structure using Pydantic,
    and relays the exact validated payload to all connected React WebSockets.
    """
    await process_iot_payload(payload)
    
    # Simulator injection for NODE_02
    if payload.node_id == "NODE_01":
        is_simulated = os.getenv("SIMULATED_NODE_02", "false").lower() == "true"
        if is_simulated:
            mode = os.getenv("SIMULATED_NODE_02_MODE", "HEALTHY").upper()
            logger.info(f"SIMULATOR | NODE_02 generated | Mode: {mode} | Timestamp: {payload.timestamp_ms}")
            sim_payload = generate_simulated_node_02(payload.timestamp_ms, mode)
            await process_iot_payload(sim_payload)
            
    return {"status": "received"}
