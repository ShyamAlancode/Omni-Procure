import sqlite3
import os

DB_PATH = "mock_erp.sqlite"

def seed_database():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed existing {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            sku TEXT PRIMARY KEY,
            product_name TEXT,
            category TEXT,
            current_stock INTEGER,
            unit_price REAL,
            min_order_qty INTEGER,
            compliance_code TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            rating REAL,
            lead_time_days INTEGER,
            is_approved BOOLEAN,
            api_access BOOLEAN
        )
    ''')

    # Seed Inventory Data
    inventory_data = [
        ('LITH-CAB-99', 'Lithium Carbonate (Battery Grade)', 'Raw Materials', 5000, 15.50, 500, 'ISO9001'),
        ('SRV-2U-DL380', 'Enterprise 2U Rack Server', 'Electronics', 45, 2500.00, 5, 'SOC2'),
        ('ADH-IND-50G', 'Industrial Adhesive Polymer', 'Chemicals', 12000, 8.75, 100, 'HAZMAT-B'),
        ('SW-LOG-R2', 'Logistics Routing SaaS License', 'Software', 9999, 150.00, 1, 'GDPR'),
        ('OFF-PF-A4', 'A4 Printer Paper (Bulk)', 'Office Supplies', 500, 42.00, 10, 'FSC'),
    ]
    cursor.executemany('INSERT INTO inventory VALUES (?,?,?,?,?,?,?)', inventory_data)

    # Seed Supplier Data
    supplier_data = [
        ('Minera Corp', 4.8, 14, True, False),
        ('TechLogix Inc', 4.5, 3, True, True),
        ('Global Logistics Partners', 4.2, 5, True, False),
        ('Acme Office Supply', 3.9, 2, True, True),
        ('Legacy Chemical Co.', 4.1, 21, True, False) # Legacy - No API
    ]
    cursor.executemany('INSERT INTO suppliers (name, rating, lead_time_days, is_approved, api_access) VALUES (?,?,?,?,?)', supplier_data)

    conn.commit()
    conn.close()
    print("Database seeded successfully with 5 SKUs and 5 Suppliers.")

if __name__ == "__main__":
    seed_database()
