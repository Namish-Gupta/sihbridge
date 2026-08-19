import os
import sys
import time
import asyncio
import logging
from pathlib import Path

# Add pinn/ directory to sys.path
PINN_DIR = Path(__file__).resolve().parent.parent / "pinn"
if str(PINN_DIR) not in sys.path:
    sys.path.append(str(PINN_DIR))

# Now we can import the local inference module
import shm_local_inference

from backend.schemas import IoTSensorData
from backend.websocket_manager import manager

logger = logging.getLogger("pinn_service")

# Configuration
PINN_SYNC_THRESHOLD_MS = int(os.getenv("PINN_SYNC_THRESHOLD_MS", 5000))

# State
latest_nodes = {}
_is_pinn_running = False

async def maybe_run_pinn():
    global _is_pinn_running
    
    # Check if both required physical nodes exist
    if "NODE_01" not in latest_nodes or "NODE_02" not in latest_nodes:
        return
        
    node1 = latest_nodes["NODE_01"]
    node2 = latest_nodes["NODE_02"]
    
    # Check validation status
    if node1.validation.status != "OK" or node2.validation.status != "OK":
        return
        
    # Check TinyML existence
    if node1.tinyml is None or node2.tinyml is None:
        return
        
    # Check features length
    if len(node1.features) != 29 or len(node2.features) != 29:
        return
        
    # Synchronization check
    time_diff = abs(node1.timestamp_ms - node2.timestamp_ms)
    if time_diff > PINN_SYNC_THRESHOLD_MS:
        logger.info(f"WAITING_FOR_SYNCHRONIZED_NODES. Diff: {time_diff}ms")
        return
        
    # Concurrency check
    if _is_pinn_running:
        return
        
    _is_pinn_running = True
    try:
        # Extract features exactly as received (RAW)
        node1_features = node1.features
        node2_features = node2.features
        
        # Extract probabilities
        node1_damage_probability = node1.tinyml.damage_probability
        node2_damage_probability = node2.tinyml.damage_probability
        
        # Run PINN in a background thread
        result = await asyncio.to_thread(
            shm_local_inference.run_shm_inference,
            node1_features=node1_features,
            node1_damage_probability=node1_damage_probability,
            node2_features=node2_features,
            node2_damage_probability=node2_damage_probability,
            num_positions=21
        )
        
        if result and result.get("status") == "success":
            pinn_update = {
                "type": "pinn_update",
                "source_nodes": ["NODE_01", "NODE_02"],
                "timestamp_ms": max(node1.timestamp_ms, node2.timestamp_ms),
                **result
            }
            await manager.broadcast(pinn_update)
            
    except Exception as e:
        logger.error(f"PINN inference failed: {e}", exc_info=True)
        error_update = {
            "type": "pinn_update",
            "status": "ERROR",
            "message": "PINN inference failed"
        }
        await manager.broadcast(error_update)
    finally:
        _is_pinn_running = False

async def process_payload(payload: IoTSensorData):
    """
    Called by the FastAPI router when a new payload arrives.
    """
    latest_nodes[payload.node_id] = payload
    
    # We only care about checking PINN conditions if the payload was for one of our boundary nodes
    if payload.node_id in ["NODE_01", "NODE_02"]:
        await maybe_run_pinn()
