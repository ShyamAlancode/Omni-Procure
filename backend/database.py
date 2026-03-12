# NOTE: This is an edge-deployed ERP cache using SQLite for the hackathon demo.
# The data-access layer is fully ORM/function-based; swapping to PostgreSQL/RDS
# requires only changing the connection string and running the same migrations.
import aiosqlite
import asyncio
import uuid
import json
from datetime import datetime, timezone

DB_PATH = "omniprocure.db"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
        PRAGMA journal_mode=WAL;

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'BUYER',
            company TEXT,
            phone TEXT,
            location TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS suppliers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            portal_url TEXT NOT NULL,
            contact_email TEXT NOT NULL,
            rating REAL NOT NULL DEFAULT 0.0,
            verified BOOLEAN NOT NULL DEFAULT 0,
            location TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            unit_price REAL NOT NULL,
            supplier_id TEXT NOT NULL,
            compliance_code TEXT NOT NULL,
            stock_qty INTEGER NOT NULL,
            portal_url TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS compliance_rules (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            rule_name TEXT NOT NULL,
            max_price_threshold REAL,
            required_certifications TEXT,
            active BOOLEAN NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS procurement_jobs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            request_text TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            completed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS job_steps (
            id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL,
            step_name TEXT NOT NULL,
            status TEXT NOT NULL,
            detail TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            metadata TEXT
        );

        CREATE TABLE IF NOT EXISTS purchase_orders (
            id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            product_id TEXT,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            supplier_name TEXT NOT NULL,
            supplier_portal TEXT NOT NULL,
            compliance_status TEXT NOT NULL DEFAULT 'PASSED',
            status TEXT NOT NULL DEFAULT 'PENDING',
            screenshot_path TEXT,
            nova_act_trace TEXT,
            created_at TEXT NOT NULL,
            approved_at TEXT,
            approved_by TEXT,
            rejection_reason TEXT
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            job_id TEXT,
            user_id TEXT NOT NULL,
            action TEXT NOT NULL,
            detail TEXT NOT NULL,
            ip_address TEXT,
            timestamp TEXT NOT NULL
        );
        """)
        await db.commit()


async def seed_db():
    async with aiosqlite.connect(DB_PATH) as db:
        # Check if already seeded
        cursor = await db.execute("SELECT COUNT(*) FROM suppliers")
        row = await cursor.fetchone()
        if row[0] > 0:
            return

        ts = now_iso()
        portal = "demo_portal.html"

        suppliers = [
            (str(uuid.uuid4()), "SafetyPro Supplies Inc",  portal, "sales@safetypro.com",  4.8, 1, "Chicago, IL",    ts),
            (str(uuid.uuid4()), "TechCore Hardware Ltd",   portal, "orders@techcore.com",   4.6, 1, "Austin, TX",     ts),
            (str(uuid.uuid4()), "ChemBase Solutions",      portal, "supply@chembase.com",   4.5, 1, "Houston, TX",    ts),
            (str(uuid.uuid4()), "LogiSupply Co",           portal, "logistics@logisupply.com", 4.3, 1, "Memphis, TN", ts),
            (str(uuid.uuid4()), "OfficePlus Wholesale",    portal, "orders@officeplus.com", 4.7, 1, "New York, NY",   ts),
        ]
        await db.executemany(
            "INSERT OR IGNORE INTO suppliers (id,name,portal_url,contact_email,rating,verified,location,created_at) VALUES (?,?,?,?,?,?,?,?)",
            suppliers
        )

        # Fetch supplier IDs by name for FK reference
        cursor = await db.execute("SELECT id, name FROM suppliers")
        sup_rows = await cursor.fetchall()
        sup_map = {name: sid for sid, name in sup_rows}

        s1 = sup_map["SafetyPro Supplies Inc"]
        s2 = sup_map["TechCore Hardware Ltd"]
        s3 = sup_map["ChemBase Solutions"]
        s4 = sup_map["LogiSupply Co"]
        s5 = sup_map["OfficePlus Wholesale"]

        products = [
            (str(uuid.uuid4()), "Industrial Safety Gloves",     "Safety",      "SKU-001", 18.0,   s1, "ISO-9001",  5000, portal, "Heavy-duty nitrile safety gloves",       ts),
            (str(uuid.uuid4()), "Lithium Carbonate 99% Pure",   "Chemicals",   "SKU-002", 45.0,   s3, "REACH-001", 2000, portal, "Battery-grade lithium carbonate",        ts),
            (str(uuid.uuid4()), "Industrial Sensors IoT",       "Electronics", "SKU-003", 120.0,  s2, "CE-001",    800,  portal, "Multi-protocol industrial IoT sensors",  ts),
            (str(uuid.uuid4()), "Server Rack Unit 2U",          "IT Hardware", "SKU-004", 890.0,  s2, "FCC-001",   150,  portal, "2U rack-mount server chassis",           ts),
            (str(uuid.uuid4()), "Network Switch 48-Port",       "IT Hardware", "SKU-005", 340.0,  s2, "FCC-002",   200,  portal, "Managed 48-port gigabit switch",         ts),
            (str(uuid.uuid4()), "Hard Hat Class E",             "Safety",      "SKU-006", 24.0,   s1, "ANSI-001",  3000, portal, "ANSI Class E electrical hard hat",      ts),
            (str(uuid.uuid4()), "Adhesive Industrial Grade",    "Chemicals",   "SKU-007", 8.0,    s3, "REACH-002", 10000,portal, "High-strength industrial adhesive",      ts),
            (str(uuid.uuid4()), "Safety Goggles Anti-Fog",      "Safety",      "SKU-008", 12.0,   s1, "ANSI-002",  4000, portal, "Anti-fog coated safety goggles",         ts),
            (str(uuid.uuid4()), "Office Chair Ergonomic",       "Office",      "SKU-009", 280.0,  s5, "BIFMA-001", 500,  portal, "Lumbar-support ergonomic office chair",  ts),
            (str(uuid.uuid4()), "Forklift Battery 48V",         "Electronics", "SKU-010", 1200.0, s2, "UL-001",    50,   portal, "48V deep-cycle forklift battery",        ts),
            (str(uuid.uuid4()), "Fire Extinguisher CO2",        "Safety",      "SKU-011", 85.0,   s1, "UL-002",    1000, portal, "5lb CO2 fire extinguisher",              ts),
            (str(uuid.uuid4()), "Ethernet Cable Cat6 1000ft",   "IT Hardware", "SKU-012", 65.0,   s2, "UL-003",    2000, portal, "1000ft Cat6 plenum-rated ethernet",      ts),
            (str(uuid.uuid4()), "Lubricating Oil Industrial",   "Chemicals",   "SKU-013", 32.0,   s3, "REACH-003", 5000, portal, "Multi-viscosity industrial lubricant",   ts),
            (str(uuid.uuid4()), "Steel Toe Boots Size Range",   "Safety",      "SKU-014", 95.0,   s1, "ASTM-001",  1500, portal, "ASTM F2413 steel toe work boots",        ts),
            (str(uuid.uuid4()), "UPS Battery Backup 1500VA",    "Electronics", "SKU-015", 220.0,  s2, "UL-004",    300,  portal, "1500VA tower UPS with LCD display",      ts),
            (str(uuid.uuid4()), "Shipping Pallets Wooden",      "Logistics",   "SKU-016", 15.0,   s4, "ISPM-001",  8000, portal, "ISPM 15 heat-treated wooden pallets",    ts),
            (str(uuid.uuid4()), "Barcode Scanner Wireless",     "Electronics", "SKU-017", 145.0,  s2, "FCC-003",   400,  portal, "2D wireless barcode scanner",            ts),
            (str(uuid.uuid4()), "First Aid Kit Industrial",     "Safety",      "SKU-018", 55.0,   s1, "OSHA-001",  2000, portal, "OSHA-compliant 200-person first aid kit",ts),
            (str(uuid.uuid4()), "Printer Paper A4 Case",        "Office",      "SKU-019", 28.0,   s5, "FSC-001",   5000, portal, "FSC certified 5-ream case A4 paper",    ts),
            (str(uuid.uuid4()), "High Vis Vest ANSI Class 2",   "Safety",      "SKU-020", 14.0,   s1, "ANSI-003",  6000, portal, "ANSI/ISEA 107 Class 2 safety vest",     ts),
        ]
        await db.executemany(
            "INSERT OR IGNORE INTO products (id,name,category,sku,unit_price,supplier_id,compliance_code,stock_qty,portal_url,description,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            products
        )

        rules = [
            (str(uuid.uuid4()), "Safety",      "Safety Equipment Procurement Policy",  500.0,  json.dumps(["ISO-9001", "ANSI"]),  1),
            (str(uuid.uuid4()), "Chemicals",   "Chemical Purchase Compliance",         200.0,  json.dumps(["REACH", "SDS"]),      1),
            (str(uuid.uuid4()), "Electronics", "Electronics Procurement Standard",     2000.0, json.dumps(["CE", "FCC", "UL"]),   1),
            (str(uuid.uuid4()), "IT Hardware", "IT Hardware Acquisition Policy",       5000.0, json.dumps(["FCC", "UL"]),         1),
            (str(uuid.uuid4()), "Logistics",   "Logistics Supplies Policy",            1000.0, json.dumps(["ISPM"]),              1),
            (str(uuid.uuid4()), "Office",      "Office Supplies Policy",               300.0,  json.dumps(["FSC"]),               1),
        ]
        await db.executemany(
            "INSERT OR IGNORE INTO compliance_rules (id,category,rule_name,max_price_threshold,required_certifications,active) VALUES (?,?,?,?,?,?)",
            rules
        )

        await db.commit()


async def search_products(name: str, max_price: float = None, category: str = None) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = """
            SELECT p.*, s.name AS supplier_name, s.portal_url AS supplier_portal
            FROM products p
            JOIN suppliers s ON p.supplier_id = s.id
            WHERE (LOWER(p.name) LIKE ? OR LOWER(p.sku) LIKE ?)
        """
        params = [f"%{name.lower()}%", f"%{name.lower()}%"]
        if max_price:
            query += " AND p.unit_price <= ?"
            params.append(max_price)
        if category:
            query += " AND LOWER(p.category) LIKE ?"
            params.append(f"%{category.lower()}%")
        query += " ORDER BY p.unit_price ASC LIMIT 10"
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_compliance_rules(category: str) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM compliance_rules WHERE LOWER(category) LIKE ? AND active=1",
            (f"%{category.lower()}%",)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def create_job(job_id: str, user_id: str, request_text: str):
    ts = now_iso()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO procurement_jobs (id,user_id,request_text,status,created_at,updated_at) VALUES (?,?,?,?,?,?)",
            (job_id, user_id, request_text, "PENDING", ts, ts)
        )
        await db.commit()


async def update_job_status(job_id: str, status: str, completed: bool = False):
    ts = now_iso()
    async with aiosqlite.connect(DB_PATH) as db:
        if completed:
            await db.execute(
                "UPDATE procurement_jobs SET status=?, updated_at=?, completed_at=? WHERE id=?",
                (status, ts, ts, job_id)
            )
        else:
            await db.execute(
                "UPDATE procurement_jobs SET status=?, updated_at=? WHERE id=?",
                (status, ts, job_id)
            )
        await db.commit()


async def add_job_step(job_id: str, step_name: str, status: str, detail: str, metadata: dict = None):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO job_steps (id,job_id,step_name,status,detail,timestamp,metadata) VALUES (?,?,?,?,?,?,?)",
            (
                str(uuid.uuid4()), job_id, step_name, status, detail,
                now_iso(),
                json.dumps(metadata) if metadata else None
            )
        )
        await db.commit()


async def get_job(job_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM procurement_jobs WHERE id=?", (job_id,))
        row = await cursor.fetchone()
        if not row:
            return None
        job = dict(row)
        cursor2 = await db.execute(
            "SELECT * FROM job_steps WHERE job_id=? ORDER BY timestamp ASC", (job_id,)
        )
        steps = await cursor2.fetchall()
        job["steps"] = [dict(s) for s in steps]
        return job


async def create_purchase_order(
    job_id: str, user_id: str, product_name: str, quantity: int,
    unit_price: float, total_price: float, supplier_name: str,
    supplier_portal: str, screenshot_path: str, nova_act_trace: list,
    approved_by: str, product_id: str = None
) -> str:
    order_id = str(uuid.uuid4())
    ts = now_iso()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO purchase_orders
               (id,job_id,user_id,product_id,product_name,quantity,unit_price,total_price,
                supplier_name,supplier_portal,compliance_status,status,screenshot_path,
                nova_act_trace,created_at,approved_at,approved_by)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                order_id, job_id, user_id, product_id, product_name, quantity,
                unit_price, total_price, supplier_name, supplier_portal,
                "PASSED", "APPROVED", screenshot_path,
                json.dumps(nova_act_trace), ts, ts, approved_by
            )
        )
        await db.commit()
    return order_id


async def get_orders_for_user(user_id: str) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM purchase_orders WHERE user_id=? ORDER BY created_at DESC",
            (user_id,)
        )
        rows = await cursor.fetchall()
        orders = []
        for r in rows:
            o = dict(r)
            if o.get("nova_act_trace"):
                try:
                    o["nova_act_trace"] = json.loads(o["nova_act_trace"])
                except Exception:
                    pass
            orders.append(o)
        return orders


async def get_order(order_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM purchase_orders WHERE id=?", (order_id,))
        row = await cursor.fetchone()
        if not row:
            return None
        o = dict(row)
        if o.get("nova_act_trace"):
            try:
                o["nova_act_trace"] = json.loads(o["nova_act_trace"])
            except Exception:
                pass
        return o


async def write_audit_log(user_id: str, action: str, detail: str, job_id: str = None, ip: str = None):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO audit_log (id,job_id,user_id,action,detail,ip_address,timestamp) VALUES (?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), job_id, user_id, action, detail, ip, now_iso())
        )
        await db.commit()


async def get_supplier_by_name(name: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM suppliers WHERE name LIKE ?", (f"%{name}%",))
        row = await cursor.fetchone()
        return dict(row) if row else None
