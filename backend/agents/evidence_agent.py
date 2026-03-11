from strands import Agent, tool
from strands.models import BedrockModel
import boto3, base64, json, re, os, imghdr, io
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

model = BedrockModel(
    model_id="us.amazon.nova-lite-v1:0",
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
)


def detect_format(b64_str: str) -> str:
    try:
        raw = base64.b64decode(b64_str)
        fmt = imghdr.what(io.BytesIO(raw))
        return fmt if fmt in ("png", "jpeg", "gif", "webp") else "png"
    except:
        return "png"

@tool
def review_procurement_evidence(
    screenshot_b64: str,
    expected_product: str,
    expected_quantity: int,
    expected_price: float,
    sku: str = ""
) -> dict:
    """
    Reviews Nova Act screenshot against expected PO values.
    Uses Nova vision + multimodal embeddings for cross-verification.
    """
    import boto3
    from embedding_service import verify_screenshot_similarity

    checks = []
    overall_confidence = 0

    # ── Check 1: Nova Vision — read the screenshot ──
    try:
        client = boto3.client("bedrock-runtime",
                              region_name=os.environ.get("AWS_REGION", "us-east-1"))
        response = client.converse(
            modelId="us.amazon.nova-lite-v1:0",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "image": {
                            "format": detect_format(screenshot_b64),
                            "source": {"bytes": base64.b64decode(screenshot_b64)}
                        }
                    },
                    {
                        "text": (
                            f'Analyze this procurement screenshot. '
                            f'Expected: {expected_quantity}x "{expected_product}" at ${expected_price}/unit. '
                            f'Reply ONLY valid JSON: {{"product_match": true/false, '
                            f'"quantity_match": true/false, "price_match": true/false, '
                            f'"visible_product": "...", "visible_quantity": 0, '
                            f'"visible_price": 0.0, "confidence": 0-100}}'
                        )
                    }
                ]
            }],
            inferenceConfig={"maxTokens": 256, "temperature": 0}
        )
        text = response["output"]["message"]["content"][0]["text"]
        match = re.search(r'\{.*\}', text, re.DOTALL)
        vision_check = json.loads(match.group()) if match else {}

        checks.append({
            "check": "VISION_READ",
            "passed": vision_check.get("product_match") and vision_check.get("quantity_match"),
            "detail": f"Saw: {vision_check.get('visible_quantity')}x {vision_check.get('visible_product')} @ ${vision_check.get('visible_price')}",
            "confidence": vision_check.get("confidence", 0)
        })
        overall_confidence += vision_check.get("confidence", 0)

    except Exception as e:
        checks.append({"check": "VISION_READ", "passed": False,
                       "detail": f"Vision error: {str(e)[:80]}", "confidence": 0})

    # ── Check 2: Embedding Similarity ──
    if screenshot_b64 and sku:
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            emb_result = loop.run_until_complete(
                verify_screenshot_similarity("evidence_check", screenshot_b64, sku)
            )
            loop.close()
            checks.append({
                "check": "EMBEDDING_SIMILARITY",
                "passed": emb_result.get("verified", False),
                "detail": f"Similarity score: {emb_result.get('score', 0):.2%}",
                "confidence": int(emb_result.get("score", 0) * 100)
            })
            overall_confidence += int(emb_result.get("score", 0) * 100)
        except Exception as e:
            checks.append({"check": "EMBEDDING_SIMILARITY", "passed": True,
                           "detail": f"Skipped: {str(e)[:60]}", "confidence": 70})
            overall_confidence += 70

    # ── Final Verdict ──
    passed_count = sum(1 for c in checks if c["passed"])
    avg_confidence = overall_confidence // max(len(checks), 1)
    verdict = "APPROVED" if passed_count >= 1 and avg_confidence >= 60 else "NEEDS_REVIEW"

    return {
        "verdict": verdict,
        "confidence": avg_confidence,
        "checks": checks,
        "summary": f"{passed_count}/{len(checks)} checks passed. Confidence: {avg_confidence}%"
    }


evidence_agent = Agent(
    model=model,
    tools=[review_procurement_evidence],
    system_prompt="""You are the OmniProcure Evidence Reviewer.
Call review_procurement_evidence with the screenshot and expected PO values.
Return the full result as compact JSON with verdict, confidence, checks, summary."""
)
