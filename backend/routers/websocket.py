from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.websocket_manager import manager
import logging

logger = logging.getLogger("api.websocket")

router = APIRouter()

@router.websocket("/bridge")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect the React client to send messages in this architecture.
            # But we must await something to keep the connection open and detect disconnects.
            data = await websocket.receive_text()
            logger.debug(f"Received unexpected message from client: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
