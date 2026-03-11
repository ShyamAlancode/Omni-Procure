"""
Run once to initialize and seed the OmniProcure database.
Usage: python seed_db.py
"""
import asyncio
from database import init_db, seed_db, DB_PATH


async def main():
    print(f"[seed_db] Initializing database at: {DB_PATH}")
    await init_db()
    print("[seed_db] Schema created.")
    await seed_db()
    print("[seed_db] Seed data inserted (20 products, 5 suppliers, 6 compliance rules).")
    print("[seed_db] Done.")


if __name__ == "__main__":
    asyncio.run(main())
