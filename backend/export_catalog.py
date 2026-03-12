import sqlite3
import csv
import os

db_path = os.path.join('backend', 'omniprocure.db')
csv_path = os.path.join('backend', 'products_catalog.csv')

def export_to_csv():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    query = """
    SELECT id, name, category, sku, unit_price, supplier_id, compliance_code, stock_qty, portal_url, description 
    FROM products
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    colnames = [description[0] for description in cursor.description]

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(colnames)
        writer.writerows(rows)

    conn.close()
    print(f"Successfully exported {len(rows)} products to {csv_path}")

if __name__ == "__main__":
    export_to_csv()
