import sqlite3
from mcp.server.fastmcp import FastMCP
import os

# Initialize FastMCP Server
mcp = FastMCP("OmniProcure-ERP")

DB_PATH = "mock_erp.sqlite"

def get_db_connection():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database {DB_PATH} not found. Please run seed_db.py first.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return dict-like objects
    return conn

@mcp.tool()
def search_inventory(query: str) -> list[dict]:
    """Search the enterprise inventory database by SKU, product name, or category."""
    conn = get_db_connection()
    cursor = conn.cursor()
    search_term = f"%{query}%"
    
    cursor.execute(
        "SELECT * FROM inventory WHERE sku LIKE ? OR product_name LIKE ? OR category LIKE ?",
        (search_term, search_term, search_term)
    )
    
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

@mcp.tool()
def get_inventory_item(sku: str) -> dict:
    """Get exact details for a specific inventory SKU, including compliance and stock."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM inventory WHERE sku = ?", (sku,))
    row = cursor.fetchone()
    
    conn.close()
    if row:
        return dict(row)
    return {"error": f"SKU {sku} not found in inventory."}

@mcp.tool()
def check_supplier_status(supplier_name: str) -> dict:
    """Check if a supplier is approved for purchasing and what their lead time is."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM suppliers WHERE name LIKE ?", (f"%{supplier_name}%",))
    row = cursor.fetchone()
    
    conn.close()
    if row:
        return dict(row)
    return {"error": f"Supplier {supplier_name} not found."}

@mcp.tool()
def list_approved_suppliers() -> list[dict]:
    """Retrieve a list of all currently approved suppliers in the S2P system."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT name, rating, lead_time_days, api_access FROM suppliers WHERE is_approved = 1")
    
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

if __name__ == "__main__":
    # Start the MCP server using standard input/output (stdio)
    print("Starting OmniProcure ERP MCP Server via stdin/stdout...")
    mcp.run()
