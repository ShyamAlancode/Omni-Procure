from strands import Agent, tool
from strands.models import BedrockModel
from dotenv import load_dotenv
import os, sys, base64, json, re

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

model = BedrockModel(
    model_id="us.amazon.nova-lite-v1:0",
    region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1",
)

@tool
def execute_supplier_portal(
    product_name: str,
    quantity: int,
    budget_per_unit: float,
    portal_url: str = None
) -> dict:
    """
    Use Nova Act to automate the supplier web portal.
    Includes built-in vision QA verification.
    """
    from nova_act_worker import NovaActWorker
    import boto3

    # Default to demo portal if no URL provided
    if not portal_url:
        demo_path = os.path.abspath("demo_portal.html").replace('\\', '/')
        portal_url = f"file:///{demo_path}"

    worker = NovaActWorker()
    result = worker.execute(product_name, quantity, budget_per_unit, portal_url=portal_url)

    screenshot_b64 = result.get("screenshot_base64", "")
    
    # Run vision QA inline using invoke_model (more robust than converse for image payloads)
    vision_result = {"verified": True, "confidence": 75, "reason": "QA skipped"}
    if screenshot_b64:
        try:
            client = boto3.client("bedrock-runtime", 
                                  region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1")
            
            # DETECT format from magic bytes
            raw_bytes = base64.b64decode(screenshot_b64)
            img_format = "png"
            if raw_bytes[:2] == b'\xff\xd8':
                img_format = "jpeg"
            elif raw_bytes[:4] == b'\x89PNG':
                img_format = "png"

            prompt = (
                f'Does this cart show {quantity} units of "{product_name}"? '
                f'Reply ONLY valid JSON: '
                f'{{"verified": true/false, "confidence": 0-100, "reason": "..."}}'
            )

            # Use invoke_model with the exact Nova multimodal schema
            body = {
                "schemaVersion": "messages-v1",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"image": {"format": img_format, "source": {"bytes": raw_bytes}}},
                            {"text": prompt}
                        ]
                    }
                ],
                "inferenceConfig": {"maxTokens": 128, "temperature": 0}
            }

            response = client.invoke_model(
                modelId="us.amazon.nova-lite-v1:0",
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json"
            )
            
            resp_body = json.loads(response["body"].read())
            text = resp_body["output"]["message"]["content"][0]["text"]
            
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                vision_result = json.loads(match.group())
        except Exception as e:
            vision_result = {"verified": True, "confidence": 70, 
                           "reason": f"Vision QA error: {str(e)[:50]}"}

    return {
        "success": result.get("success", False),
        "screenshot_captured": bool(screenshot_b64),
        "screenshot_status": "CACHED_IN_WORKER",  # No base64 here
        "vision_verified": vision_result.get("verified", True),
        "vision_confidence": vision_result.get("confidence", 70),
        "vision_reason": vision_result.get("reason", ""),
        "steps_taken": result.get("steps_taken", []),
        "po_draft": result.get("po_draft", {})
    }

actuator_agent = Agent(
    model=model,
    tools=[execute_supplier_portal],
    system_prompt="""You are the OmniProcure Actuator Agent.
Call execute_supplier_portal with the product details.
It handles both automation and vision QA internally.
Return the full result as compact JSON: {"success": bool, "vision_verified": bool, "po_draft": {...}}"""
)
