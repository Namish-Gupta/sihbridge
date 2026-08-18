from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import iot, websocket
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(title="SIHBridge IoT Backend")

# CORS configuration allowing all origins for development
# This allows the React dev server (http://localhost:5173 or LAN IP) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(iot.router, prefix="/api/iot", tags=["IoT"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {"status": "running", "service": "SIHBridge IoT Backend"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # When run directly, start the server accessible from the LAN
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
