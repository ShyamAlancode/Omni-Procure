from strands import Agent, tool
from strands.models import BedrockModel
import os, asyncio, sys
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import search_products

model = BedrockModel(
    model_id="us.amazon.nova-lite-v1:0",
    region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1",
)

@tool
def search_erp_catalog(keyword: str, max_price: float = None) -> dict:
    """
    Search the internal ERP catalog for matching products.
    Returns best matches sorted by price with stock availability.
    """
    results = asyncio.run(search_products(keyword, max_price))
    if not results:
        # Try broader search without price filter
        results = asyncio.run(search_products(keyword, None))
    
    return {
        "matches": results[:5],  # Top 5 matches
        "count": len(results),
        "best_match": results[0] if results else None,
        "keyword_used": keyword
    }

@tool
def get_product_details(sku: str) -> dict:
    """Get full details for a specific product by SKU"""
    import asyncio
    from database import DB_PATH
    import aiosqlite
    async def fetch():
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM products WHERE sku = ?", (sku,))
            row = await cursor.fetchone()
            return dict(row) if row else None
    return asyncio.run(fetch()) or {"error": f"SKU {sku} not found"}

catalog_agent = Agent(
    model=model,
    tools=[search_erp_catalog, get_product_details],
    system_prompt="""You are the OmniProcure Catalog Agent.
Your ONLY job is to find the best matching product in the ERP catalog.
Always call search_erp_catalog first.
Return JSON: {product_name, sku, unit_price, stock_qty, supplier_id, best_match: bool}
If no exact match, return the closest alternative with a note."""
)
