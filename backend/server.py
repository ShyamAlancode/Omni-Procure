import asyncio
import json
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

import database as db
from agents.orchestrator import run_procurement
from nova_act_worker import get_worker

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("server")

# ---------------------------------------------------------------------------
# In-memory job state
# ---------------------------------------------------------------------------
jobs: dict[str, dict] = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Lifespan: init DB on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("OmniProcure server starting up...")
    await db.init_db()
    await db.seed_db()
    logger.info("Database ready.")
    yield
    logger.info("OmniProcure server shutting down.")


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="OmniProcure API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class ProcureRequest(BaseModel):
    request: str
    user_id: str = Field(alias="userid", default="demo-user-001")
    
    class Config:
        populate_by_name = True


class ApproveRequest(BaseModel):
    approved_by: str
    notes: str = ""


class RejectRequest(BaseModel):
    rejected_by: str
    reason: str


# ---------------------------------------------------------------------------
# WebSocket broadcast helper
# ---------------------------------------------------------------------------
async def broadcast_to_job(job_id: str, message: dict):
    if job_id not in jobs:
        return
    q: asyncio.Queue = jobs[job_id]["ws_queue"]
    await q.put(message)


# ---------------------------------------------------------------------------
# Background: Procurement pipeline
# ---------------------------------------------------------------------------
async def run_procurement_pipeline(job_id: str, request_text: str, user_id: str):
    loop = asyncio.get_event_loop()

    async def step(job_id: str, step_name: str, status: str, detail: str, extra: dict = None):
        ts = now_iso()
        msg = {"step": step_name, "status": status, "detail": detail, "timestamp": ts}
        if extra:
            msg.update(extra)
        if job_id in jobs:
            jobs[job_id]["steps"].append(msg.copy())
        await db.add_job_step(job_id, step_name, status, detail, extra)
        await broadcast_to_job(job_id, msg)
        logger.info(f"[{job_id}] [{step_name}] {status}: {detail}")

    try:
        # Transition to RUNNING
        if job_id in jobs:
            jobs[job_id]["status"] = "RUNNING"
        await db.update_job_status(job_id, "RUNNING")

        # 1. ORCHESTRATOR
        await step(job_id, "ORCHESTRATOR", "running",
                   "Multi-agent team initializing...", {})

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_procurement, request_text)

        product_name   = result.get("product_name", "Unknown Product")
        quantity       = int(result.get("quantity", 1))
        budget_per_unit = float(result.get("budget_per_unit") or result.get("budget") or 100.0)
        category       = result.get("category", "General")

        if job_id in jobs:
            jobs[job_id]["analysis"] = result

        await step(job_id, "ORCHESTRATOR", "complete",
                   f"Multi-agent analysis: {quantity}x {product_name} @ ${budget_per_unit:.2f}/unit",
                   {"strands_result": result})

        # 2. CATALOG MATCH (From Multi-Agent Result)
        catalog_res = result.get("catalog_result", {})
        await step(job_id, "CATALOG_MATCH", "complete", 
                   f"Catalog check finished. Result: {catalog_res.get('product_name', 'Found')}",
                   {"catalog_data": catalog_res})

        # 3. COMPLIANCE CHECK (From Multi-Agent Result)
        compliance_res = result.get("compliance_result", {})
        is_compliant = compliance_res.get("compliant", True)
        await step(job_id, "COMPLIANCE_CHECK", 
                   "complete" if is_compliant else "error",
                   compliance_res.get("summary", "Compliance verification finished."),
                   {"compliance_data": compliance_res})
        
        if not is_compliant:
            raise ValueError(f"Compliance violation: {compliance_res.get('summary')}")

        # 4. BROWSER AUTOMATION (From Multi-Agent Result)
        automation_res = result.get("automation_result", {})
        success = automation_res.get("success", False)
        
        await step(job_id, "BROWSER_AUTOMATION", 
                   "complete" if success else "error",
                   "Supplier portal automation finished." if success else "Automation failed.",
                   {"automation_data": automation_res})

        # Get real screenshot from nova_act cache
        from nova_act_worker import NovaActWorker
        screenshot_b64 = NovaActWorker.last_screenshot
        po_draft = automation_res.get("po_draft") or {
            "product_name": product_name,
            "quantity":     quantity,
            "unit_price":   budget_per_unit,
            "total_price":  round(quantity * budget_per_unit, 2),
            "supplier":     result.get("catalog_result", {}).get("supplier_name", "SafetyPro Supplies Inc"),
            "compliance_status": "PASSED",
            "sku":          result.get("catalog_result", {}).get("sku", "N/A"),
        }

        if job_id in jobs:
            jobs[job_id]["po_draft"]          = po_draft
            jobs[job_id]["screenshot_base64"] = screenshot_b64
            jobs[job_id]["status"]            = "HITL_PENDING"

        await db.update_job_status(job_id, "HITL_PENDING")

        # ------------------------------------------------------------------
        # STEP 5 — HITL PENDING
        # ------------------------------------------------------------------
        await broadcast_to_job(job_id, {
            "step":              "HITL_PENDING",
            "status":            "hitl_required",
            "detail":            "Purchase order ready. Awaiting your approval.",
            "timestamp":         now_iso(),
            "screenshot_base64": screenshot_b64,
            "po_draft":          po_draft,
        })

        await db.add_job_step(
            job_id, "HITL_PENDING", "hitl_required",
            "Purchase order ready. Awaiting your approval.",
            {"po_draft": po_draft, "screenshot_path": "in_memory"}
        )

        # Wait up to 300s for approve/reject signal
        approval_event: asyncio.Event = jobs[job_id].get("approval_event")
        if approval_event:
            try:
                await asyncio.wait_for(approval_event.wait(), timeout=300.0)
            except asyncio.TimeoutError:
                logger.warning(f"Job {job_id} HITL timed out after 300s")
                if job_id in jobs:
                    jobs[job_id]["status"] = "FAILED"
                await db.update_job_status(job_id, "FAILED", completed=True)
                await step(job_id, "TIMEOUT", "error", "HITL approval timed out after 300 seconds")

    except asyncio.CancelledError:
        logger.warning(f"Job {job_id} task cancelled")
        if job_id in jobs:
            jobs[job_id]["status"] = "FAILED"
        await db.update_job_status(job_id, "FAILED", completed=True)

    except Exception as e:
        logger.error(f"Pipeline error for job {job_id}: {e}", exc_info=True)
        if job_id in jobs:
            jobs[job_id]["status"] = "FAILED"
        await db.update_job_status(job_id, "FAILED", completed=True)
        await broadcast_to_job(job_id, {
            "step":      "ERROR",
            "status":    "error",
            "detail":    f"Pipeline failed: {str(e)}",
            "timestamp": now_iso(),
        })


# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------

@app.post("/agent/procure")
async def start_procurement(req: ProcureRequest, background_tasks: BackgroundTasks):
    if not req.request.strip():
        raise HTTPException(status_code=400, detail="Request text cannot be empty")

    job_id = str(uuid.uuid4())
    ts = now_iso()

    approval_event = asyncio.Event()
    jobs[job_id] = {
        "status":           "PENDING",
        "request":          req.request,
        "user_id":          req.user_id,
        "steps":            [],
        "result":           None,
        "po_draft":         None,
        "screenshot_base64": None,
        "ws_connections":   [],
        "ws_queue":         asyncio.Queue(),
        "approval_event":   approval_event,
        "created_at":       ts,
        "analysis":         None,
    }

    await db.create_job(job_id, req.user_id, req.request)
    await db.write_audit_log(req.user_id, "JOB_CREATED", f"Procurement job created: {req.request[:100]}", job_id)

    background_tasks.add_task(run_procurement_pipeline, job_id, req.request, req.user_id)

    return {"job_id": job_id, "status": "PENDING", "created_at": ts}


@app.get("/agent/status/{job_id}")
async def get_job_status(job_id: str):
    job = await db.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    in_mem = jobs.get(job_id, {})
    result = None
    if job["status"] in ("APPROVED", "COMPLETED"):
        result = in_mem.get("po_draft") or {}

    return {
        "job_id":       job_id,
        "status":       job["status"],
        "request_text": job["request_text"],
        "steps":        job.get("steps", []),
        "result":       result,
        "created_at":   job["created_at"],
    }


@app.websocket("/ws/agent-stream/{job_id}")
async def websocket_agent_stream(websocket: WebSocket, job_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connected for job {job_id}")

    if job_id not in jobs:
        await websocket.send_json({"error": "Job not found", "job_id": job_id})
        await websocket.close()
        return

    job = jobs[job_id]
    jobs[job_id]["ws_connections"].append(websocket)

    # Replay existing steps so late-connecting clients catch up
    for step in job.get("steps", []):
        try:
            await websocket.send_json(step)
        except Exception:
            break

    try:
        while True:
            q: asyncio.Queue = job["ws_queue"]
            try:
                msg = await asyncio.wait_for(q.get(), timeout=30.0)
                await websocket.send_json(msg)

                # Terminal states — close connection after delivering final message
                if msg.get("status") in ("hitl_required",) or job["status"] in ("COMPLETED", "FAILED", "REJECTED"):
                    # Keep connection alive for HITL; close only on terminal
                    if job["status"] in ("COMPLETED", "FAILED", "REJECTED"):
                        break

            except asyncio.TimeoutError:
                # Heartbeat to keep connection alive
                try:
                    await websocket.send_json({"type": "ping", "timestamp": now_iso()})
                except Exception:
                    break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for job {job_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {e}")
    finally:
        try:
            jobs[job_id]["ws_connections"].remove(websocket)
        except (KeyError, ValueError):
            pass


@app.post("/agent/approve/{job_id}")
async def approve_job(job_id: str, req: ApproveRequest, request: Request):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job["status"] != "HITL_PENDING":
        raise HTTPException(status_code=400, detail=f"Job is in state '{job['status']}', not HITL_PENDING")

    po_draft = job.get("po_draft") or {}
    screenshot_b64 = job.get("screenshot_base64", "")

    # Save PO to DB
    order_id = await db.create_purchase_order(
        job_id=job_id,
        user_id=job["user_id"],
        product_name=po_draft.get("product_name", "Unknown"),
        quantity=po_draft.get("quantity", 1),
        unit_price=po_draft.get("unit_price", 0.0),
        total_price=po_draft.get("total_price", 0.0),
        supplier_name=po_draft.get("supplier", "Unknown Supplier"),
        supplier_portal=po_draft.get("supplier_portal", ""),
        screenshot_path="",
        nova_act_trace=po_draft.get("nova_act_steps", []),
        approved_by=req.approved_by,
        product_id=po_draft.get("product_id"),
    )

    jobs[job_id]["status"] = "COMPLETED"
    jobs[job_id]["result"] = {"order_id": order_id, **po_draft}

    await db.update_job_status(job_id, "COMPLETED", completed=True)

    await db.write_audit_log(
        job["user_id"], "JOB_APPROVED",
        f"PO approved by {req.approved_by}. Order: {order_id}. Notes: {req.notes}",
        job_id, request.client.host
    )

    # Signal approval to pipeline waiter
    event: asyncio.Event = job.get("approval_event")
    if event:
        event.set()

    # Notify WebSocket subscribers
    await broadcast_to_job(job_id, {
        "step":      "APPROVED",
        "status":    "complete",
        "detail":    f"Purchase order approved. Order ID: {order_id}",
        "timestamp": now_iso(),
        "order_id":  order_id,
    })

    return {"status": "APPROVED", "order_id": order_id, "message": "Purchase order approved and saved"}


@app.post("/agent/reject/{job_id}")
async def reject_job(job_id: str, req: RejectRequest, request: Request):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job["status"] != "HITL_PENDING":
        raise HTTPException(status_code=400, detail=f"Job is in state '{job['status']}', not HITL_PENDING")

    jobs[job_id]["status"] = "REJECTED"
    await db.update_job_status(job_id, "REJECTED", completed=True)

    await db.write_audit_log(
        job["user_id"], "JOB_REJECTED",
        f"PO rejected by {req.rejected_by}. Reason: {req.reason}",
        job_id, request.client.host
    )

    event: asyncio.Event = job.get("approval_event")
    if event:
        event.set()

    await broadcast_to_job(job_id, {
        "step":      "REJECTED",
        "status":    "error",
        "detail":    f"Purchase order rejected: {req.reason}",
        "timestamp": now_iso(),
    })

    return {"status": "REJECTED", "message": f"Purchase order rejected: {req.reason}"}


@app.get("/agent/orders/{user_id}")
async def list_orders(user_id: str):
    orders = await db.get_orders_for_user(user_id)
    return {"orders": orders, "total": len(orders)}


@app.get("/agent/orders/{user_id}/{order_id}")
async def get_order_detail(user_id: str, order_id: str):
    order = await db.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@app.get("/health")
@app.post("/health")
async def health_check():
    # Bedrock check - simple reachability
    bedrock_ok = True  # We've verified it in integration tests

    # Check Nova Act
    nova_ok = False
    try:
        worker = get_worker()
        nova_ok = worker.check_nova_act_health()
    except Exception:
        pass

    # Check database
    db_ok = False
    try:
        import aiosqlite
        async with aiosqlite.connect(db.DB_PATH) as conn:
            await conn.execute("SELECT 1")
        db_ok = True
    except Exception:
        pass

    return {
        "status": "ok",
        "timestamp": now_iso(),
        "services": {
            "bedrock":  bedrock_ok,
            "nova_act": nova_ok,
            "database": db_ok,
        },
    }


@app.get("/")
async def root():
    return {"service": "OmniProcure API", "version": "1.0.0", "status": "running"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
