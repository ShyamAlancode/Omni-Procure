import boto3
import json
import base64
import numpy as np
import aiosqlite
import os
from typing import Optional
from dotenv import load_dotenv

# Load .env file
load_dotenv()

import database as db

MODEL_ID = "amazon.nova-2-multimodal-embeddings-v1:0"
EMBEDDING_DIM = 1024  # balanced speed/accuracy (options: 256, 512, 1024, 3072)

bedrock = boto3.client("bedrock-runtime", 
                       region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1")


# ── Core Embedding Functions ──────────────────────────────────

def embed_text(text: str, purpose: str = "GENERIC_INDEX") -> list[float]:
    """Generate embedding for a text string."""
    body = {
        "taskType": "SINGLE_EMBEDDING",
        "singleEmbeddingParams": {
            "embeddingPurpose": purpose,
            "embeddingDimension": EMBEDDING_DIM,
            "text": {"truncationMode": "END", "value": text}
        }
    }
    response = bedrock.invoke_model(
        body=json.dumps(body),
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json"
    )
    return json.loads(response["body"].read())["embeddings"][0]["embedding"]


def embed_image_b64(image_b64: str, fmt: str = "png", purpose: str = "GENERIC_INDEX") -> list[float]:
    """Generate embedding for a base64-encoded image."""
    body = {
        "taskType": "SINGLE_EMBEDDING",
        "singleEmbeddingParams": {
            "embeddingPurpose": purpose,
            "embeddingDimension": EMBEDDING_DIM,
            "image": {
                "format": fmt,
                "source": {"bytes": image_b64}
            }
        }
    }
    response = bedrock.invoke_model(
        body=json.dumps(body),
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json"
    )
    return json.loads(response["body"].read())["embeddings"][0]["embedding"]


def embed_image_file(path: str) -> list[float]:
    """Generate embedding from an image file path."""
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    fmt = path.split(".")[-1].lower()
    return embed_image_b64(b64, fmt=fmt)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Cosine similarity between two embedding vectors."""
    va, vb = np.array(a), np.array(b)
    return float(np.dot(va, vb) / (np.linalg.norm(va) * np.linalg.norm(vb)))


# ── DB: Store & Retrieve Embeddings ──────────────────────────

async def init_embedding_tables():
    """Add embedding columns to existing tables."""
    async with aiosqlite.connect(db.DB_PATH) as conn:
        # Product image embeddings
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS product_embeddings (
                product_id  TEXT PRIMARY KEY,
                sku         TEXT,
                embedding   TEXT,  -- JSON array
                source      TEXT DEFAULT 'image',
                created_at  TEXT DEFAULT (datetime('now'))
            )
        """)
        # Screenshot embeddings for vision QA
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS screenshot_embeddings (
                job_id      TEXT PRIMARY KEY,
                embedding   TEXT,  -- JSON array
                created_at  TEXT DEFAULT (datetime('now'))
            )
        """)
        await conn.commit()


async def store_product_embedding(product_id: str, sku: str, embedding: list[float]):
    async with aiosqlite.connect(db.DB_PATH) as conn:
        await conn.execute("""
            INSERT OR REPLACE INTO product_embeddings (product_id, sku, embedding)
            VALUES (?, ?, ?)
        """, [product_id, sku, json.dumps(embedding)])
        await conn.commit()


async def store_screenshot_embedding(job_id: str, embedding: list[float]):
    async with aiosqlite.connect(db.DB_PATH) as conn:
        await conn.execute("""
            INSERT OR REPLACE INTO screenshot_embeddings (job_id, embedding)
            VALUES (?, ?)
        """, [job_id, json.dumps(embedding)])
        await conn.commit()


async def get_all_product_embeddings() -> list[dict]:
    async with aiosqlite.connect(db.DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute("SELECT * FROM product_embeddings") as cur:
            rows = await cur.fetchall()
    return [{"product_id": r["product_id"], "sku": r["sku"],
             "embedding": json.loads(r["embedding"])} for r in rows]


# ── Catalog: Image Similarity Search ─────────────────────────

async def search_catalog_by_image(image_b64: str, top_k: int = 3) -> list[dict]:
    """
    Find most similar products by image embedding.
    Uses cosine similarity against all stored product embeddings.
    """
    query_emb = embed_image_b64(image_b64, purpose="GENERIC_RETRIEVAL")
    all_embeddings = await get_all_product_embeddings()

    if not all_embeddings:
        return []

    scored = []
    for item in all_embeddings:
        score = cosine_similarity(query_emb, item["embedding"])
        scored.append({"sku": item["sku"], "product_id": item["product_id"], "score": round(score, 4)})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


async def search_catalog_by_text(query: str, top_k: int = 3) -> list[dict]:
    """
    Find most similar products by text query embedding.
    Cross-modal: text query → image embeddings similarity.
    """
    query_emb = embed_text(query, purpose="GENERIC_RETRIEVAL")
    all_embeddings = await get_all_product_embeddings()

    if not all_embeddings:
        return []

    scored = []
    for item in all_embeddings:
        score = cosine_similarity(query_emb, item["embedding"])
        scored.append({"sku": item["sku"], "product_id": item["product_id"], "score": round(score, 4)})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


# ── Vision QA: Screenshot Comparison ─────────────────────────

async def verify_screenshot_similarity(
    job_id: str,
    screenshot_b64: str,
    reference_sku: str,
    threshold: float = 0.75
) -> dict:
    """
    Embed the Nova Act screenshot and compare to the expected product embedding.
    Returns similarity score + pass/fail.
    """
    # Embed the screenshot
    screenshot_emb = embed_image_b64(screenshot_b64, purpose="GENERIC_RETRIEVAL")
    await store_screenshot_embedding(job_id, screenshot_emb)

    # Get reference product embedding
    all_embeddings = await get_all_product_embeddings()
    ref = next((e for e in all_embeddings if e["sku"] == reference_sku), None)

    if not ref:
        return {"verified": False, "score": 0.0, "reason": f"No reference embedding for SKU {reference_sku}"}

    score = cosine_similarity(screenshot_emb, ref["embedding"])
    verified = score >= threshold

    return {
        "verified": verified,
        "score":    round(score, 4),
        "threshold": threshold,
        "reason":   "Screenshot matches product" if verified else f"Low similarity: {score:.2f} < {threshold}"
    }


# ── Seed: Embed All Products ──────────────────────────────────

async def seed_product_embeddings():
    """
    Run once to embed all products in the catalog.
    Uses product name + category as text embedding (no images needed to start).
    """
    await init_embedding_tables()

    async with aiosqlite.connect(db.DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute("SELECT id, sku, name, category FROM products") as cur:
            products = await cur.fetchall()

    print(f"Embedding {len(products)} products...")
    for p in products:
        text = f"{p['name']} {p['category']}"
        emb = embed_text(text, purpose="GENERIC_INDEX")
        await store_product_embedding(p["id"], p["sku"], emb)
        print(f"  ✅ {p['sku']} — {p['name']}")

    print("Done. All product embeddings stored.")


if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_product_embeddings())
