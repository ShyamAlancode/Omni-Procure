import os
import json
import logging
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("OmniProcure-Backend")

app = FastAPI(
    title="OmniProcure AI Backend",
    description="Enterprise Orchestration Layer for S2P Automation using Amazon Nova and Strands",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for hackathon ease
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class ProcurementRequest(BaseModel):
    prompt: str
    user_id: str
    target_budget: Optional[float] = None

class ProcurementResponse(BaseModel):
    status: str
    message: str
    logs: List[Dict[str, Any]]
    final_result: Optional[Dict[str, Any]] = None

# --- Endpoints ---
@app.get("/health")
async def health_check():
    """Verify backend and MCP connections are hot."""
    db_exists = os.path.exists("mock_erp.sqlite")
    return {
        "status": "healthy", 
        "nova_ready": True, 
        "mcp_db_connected": db_exists,
        "message": "OmniProcure AI Backend is online."
    }

from strands_orchestrator import StrandsSwarmManager

swarm_manager = StrandsSwarmManager()

@app.post("/agent/procure", response_model=ProcurementResponse)
@app.post("/api/orchestrate", response_model=ProcurementResponse)
async def orchestrate_procurement(request: ProcurementRequest):
    """
    Main entrypoint for the Next.js frontend to trigger the AI Agent Swarm (REST fallback).
    """
    logger.info(f"Received REST request from {request.user_id}: {request.prompt}")
    result = await swarm_manager.invoke_swarm(request.prompt)

    return ProcurementResponse(
        status=result["status"],
        message="Orchestration request evaluated.",
        logs=result.get("trace", []),
        final_result={"action_taken": "Pending HITL Approval", "recommendation": result.get("final_recommendation", "")}
    )

@app.websocket("/ws/agent-stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    Real-time streaming endpoint for the Agent Traces as they happen.
    Days 6-7 of the Gemini Sprint.
    """
    await websocket.accept()
    logger.info("WebSocket connection accepted.")
    
    try:
        while True:
            # Wait for prompt from client
            data = await websocket.receive_text()
            logger.info(f"WebSocket received prompt: {data}")
            
            # Since invoke_swarm is currently monolithic, we simulate streaming by
            # executing it and then pushing the trace array incrementally. 
            # In a true streaming agent setup, invoke_swarm would yield traces via an async generator.
            await websocket.send_json({"agent": "System", "status": "Executing", "details": "Initiating AI Engine..."})
            
            result = await swarm_manager.invoke_swarm(data)
            
            traces = result.get("trace", [])
            for trace in traces:
                await websocket.send_json(trace)
                await asyncio.sleep(1.0) # Artificial pause to mimic real-time processing UX
                
            await websocket.send_json({
                "agent": "Final Result", 
                "status": "AWAITING_HUMAN_APPROVAL", 
                "details": result.get("final_recommendation", "Awaiting approval")
            })
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"agent": "System Error", "status": "Failed", "details": str(e)})
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
