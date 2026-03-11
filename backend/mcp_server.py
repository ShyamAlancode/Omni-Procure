from mcp.server.fastmcp import FastMCP
import database

mcp = FastMCP("OmniProcure-ERP")

@mcp.tool()
async def search_catalog(query: str, max_price: float = None) -> list:
    """Returns matching SKUs based on search query and optional max price."""
    prods = await database.get_products(query, max_price)
    return [{"id": p.id, "sku": p.sku, "name": p.name, "price": p.unit_price, "category": p.category} for p in prods]

@mcp.tool()
async def check_compliance(sku: str) -> dict:
    """Returns compliance status + codes for a given SKU."""
    prod = await database.get_product_by_sku(sku)
    if not prod:
        return {"error": "SKU not found"}
    rules = await database.get_compliance_rules(prod.category)
    global_rules = await database.get_compliance_rules("All")
    all_rules = rules + global_rules
    
    passed = True
    reasons = []
    
    for r in all_rules:
        if r.max_price_threshold and prod.unit_price > r.max_price_threshold:
            passed = False
            reasons.append(f"Price {prod.unit_price} exceeds max {r.max_price_threshold} for rule {r.rule_name}")
        if r.required_certifications != "NONE":
            certs = [c.strip() for c in r.required_certifications.split(',')]
            if prod.compliance_code not in certs:
                passed = False
                reasons.append(f"Missing certification. Requires one of {certs}, has {prod.compliance_code}")
                
    return {
        "sku": sku,
        "compliance_code": prod.compliance_code,
        "status": "PASS" if passed else "FAIL",
        "reasons": reasons
    }

@mcp.tool()
async def get_supplier_info(sku: str) -> dict:
    """Returns supplier name, portal URL for a given SKU."""
    prod = await database.get_product_by_sku(sku)
    if not prod:
        return {"error": "SKU not found"}
    sup = await database.get_supplier(prod.supplier_id)
    if not sup:
        return {"error": "Supplier not found"}
    return {
        "supplier_name": sup.name,
        "portal_url": sup.portal_url,
        "product_portal_url": prod.portal_url,
        "contact_email": sup.contact_email,
        "rating": sup.rating
    }

@mcp.tool()
async def create_purchase_order(sku: str, quantity: int, user_id: str, job_id: str = None) -> dict:
    """Saves PO to DB."""
    prod = await database.get_product_by_sku(sku)
    if not prod:
        return {"error": "SKU not found"}
    total_price = prod.unit_price * quantity
    po_data = {
        "user_id": user_id,
        "job_id": job_id,
        "product_id": prod.id,
        "quantity": quantity,
        "total_price": total_price,
        "status": "HITL_PENDING"
    }
    po = await database.create_purchase_order(po_data)
    return {"status": "success", "po_id": po.id, "total": total_price}

@mcp.tool()
async def get_purchase_orders(user_id: str) -> list:
    """Returns all POs for a user."""
    orders = await database.get_orders_by_user(user_id)
    return [{"id": o.id, "job_id": o.job_id, "amount": o.total_price, "status": o.status, "date": o.created_at.isoformat()} for o in orders]

if __name__ == "__main__":
    mcp.run(transport="stdio")
