from mcp.server.fastmcp import FastMCP
import aiosqlite
import database as db
import os

mcp = FastMCP("OmniProcure-ERP")


# ── 1. Search Catalog ─────────────────────────────────────────
@mcp.tool()
async def search_catalog(query: str, max_price: float = None) -> list:
    """Returns matching products based on search query and optional max price."""
    async with aiosqlite.connect(db.DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        sql = "SELECT * FROM products WHERE name LIKE ? OR category LIKE ?"
        params = [f"%{query}%", f"%{query}%"]
        if max_price:
            sql += " AND unit_price <= ?"
            params.append(max_price)
        async with conn.execute(sql, params) as cur:
            rows = await cur.fetchall()
    return [
        {
            "id": r["id"], "sku": r["sku"], "name": r["name"],
            "price": r["unit_price"], "category": r["category"],
            "stock_qty": r["stock_qty"]
        }
        for r in rows
    ]


# ── 2. Check Compliance ───────────────────────────────────────
@mcp.tool()
async def check_compliance(sku: str) -> dict:
    """Returns compliance status for a given SKU."""
    async with aiosqlite.connect(db.DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute("SELECT * FROM products WHERE sku=?", [sku]) as cur:
            prod = await cur.fetchone()
    if not prod:
        return {"error": "SKU not found"}

    async with aiosqlite.connect(db.DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM compliance_rules WHERE category=? OR category='All'",
            [prod["category"]]
        ) as cur:
            rules = await cur.fetchall()

    passed = True
    reasons = []
    for r in rules:
        if r["max_price_threshold"] and prod["unit_price"] > r["max_price_threshold"]:
            passed = False
            reasons.append(f"Price ${prod['unit_price']} exceeds max ${r['max_price_threshold']}")
        if r["required_certifications"] != "NONE":
            certs = [c.strip() for c in r["required_certifications"].split(",")]
            if prod["compliance_code"] not in certs:
                passed = False
                reasons.append(f"Missing cert. Needs {certs}, has {prod['compliance_code']}")

    return {
        "sku": sku,
        "compliance_code": prod["compliance_code"],
        "status": "PASS" if passed else "FAIL",
        "reasons": reasons
    }


# ── 3. Get Supplier Info ──────────────────────────────────────
@mcp.tool()
async def get_supplier_info(sku: str) -> dict:
    """Returns supplier name and portal URL for a given SKU."""
    async with aiosqlite.connect(db.DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT p.*, s.name as supplier_name, s.portal_url as supplier_portal, "
            "s.contact_email, s.rating FROM products p "
            "JOIN suppliers s ON p.supplier_id = s.id WHERE p.sku=?", [sku]
        ) as cur:
            row = await cur.fetchone()
    if not row:
        return {"error": "SKU or supplier not found"}
    return {
        "supplier_name": row["supplier_name"],
        "portal_url":    row["supplier_portal"],
        "contact_email": row["contact_email"],
        "rating":        row["rating"]
    }


# ── 4. Trigger Full Procurement Pipeline ──────────────────────
@mcp.tool()
async def trigger_procurement(request: str, user_id: str = "demo-user-001") -> dict:
    """Triggers the full multi-agent procurement pipeline. Returns job_id to track progress."""
    import httpx
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "http://localhost:8000/agent/procure",
            json={"request": request, "userid": user_id},
            timeout=30.0
        )
    return res.json()


# ── 5. Get Job Status ─────────────────────────────────────────
@mcp.tool()
async def get_job_status(job_id: str) -> dict:
    """Returns current status and steps of a procurement job."""
    import httpx
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"http://localhost:8000/agent/status/{job_id}",
            timeout=10.0
        )
    return res.json()


# ── 6. Approve Purchase Order ─────────────────────────────────
@mcp.tool()
async def approve_purchase_order(job_id: str, approved_by: str = "mcp-agent", notes: str = "") -> dict:
    """Approves a pending purchase order."""
    import httpx
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"http://localhost:8000/agent/approve/{job_id}",
            json={"approved_by": approved_by, "notes": notes},
            timeout=10.0
        )
    return res.json()


# ── 7. Get Orders ─────────────────────────────────────────────
@mcp.tool()
async def get_purchase_orders(user_id: str) -> list:
    """Returns all purchase orders for a user."""
    orders = await db.get_orders_for_user(user_id)
    return orders


if __name__ == "__main__":
    mcp.run(transport="stdio")
