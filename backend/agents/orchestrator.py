from strands import Agent, tool
from strands.models import BedrockModel
import os, json, sys, re, time
from dotenv import load_dotenv

# Load .env file
load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from agents.compliance_agent import compliance_agent
from agents.catalog_agent import catalog_agent
from agents.actuator_agent import actuator_agent

def create_model_with_retry():
    return BedrockModel(
        model_id="us.amazon.nova-pro-v1:0",  # Pro supports reasoning
        region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1",
        max_tokens=8192,
    )

model = create_model_with_retry()

# ── Helpers ──────────────────────────────────────────────────

def _truncate(text: str, max_chars: int = 800) -> str:
    """Prevent sub-agent responses from blowing up orchestrator context"""
    if len(text) > max_chars:
        return text[:max_chars] + "...[truncated for context efficiency]"
    return text

# ── Sub-agent tools ──────────────────────────────────────────

@tool
def delegate_to_catalog_agent(keyword: str, max_price: float) -> str:
    """Delegate product search to the Catalog specialist agent"""
    response = catalog_agent(
        f"Find best match for: {keyword}, max price: ${max_price}/unit. "
        f"Reply ONLY with compact JSON: {{product_name, sku, unit_price, stock_qty, supplier_id}}"
    )
    return _truncate(str(response))

@tool
def delegate_to_compliance_agent(
    category: str, unit_price: float, quantity: int, supplier_name: str = "SafetyPro Supplies Inc"
) -> str:
    """Delegate compliance verification to the Compliance specialist agent"""
    response = compliance_agent(
        f"Check compliance: category={category}, unit_price=${unit_price}, "
        f"quantity={quantity}, supplier_name={supplier_name}. "
        f"Reply ONLY with compact JSON: {{compliant, summary, violations}}"
    )
    return _truncate(str(response))

@tool
def delegate_to_actuator_agent(
    product_name: str, quantity: int, budget: float
) -> str:
    """Delegate browser automation to the Actuator specialist agent"""
    response = actuator_agent(
        f"Execute portal for: {quantity} units of {product_name} at ${budget}/unit. "
        f"Reply ONLY with compact JSON: {{success, vision_verified, vision_confidence, po_draft}}"
    )
    return _truncate(str(response), max_chars=1200)  # relaxed for po_draft

# ── Master Orchestrator ──────────────────────────────────────

SYSTEM_PROMPT = """You are OmniProcure, an enterprise procurement orchestration AI.

When you receive a procurement request, follow this EXACT sequence — no deviations:

STEP 1: Call delegate_to_catalog_agent to find the product and get its price/supplier
STEP 2: Call delegate_to_compliance_agent with category, unit_price, quantity from Step 1
STEP 3: If compliance passed → call delegate_to_actuator_agent
        If compliance failed → skip Step 3
STEP 4: Return ONLY this JSON, nothing else:

{
  "product_name": "...",
  "quantity": 0,
  "budget_per_unit": 0.0,
  "category": "...",
  "catalog_result": {"sku": "...", "unit_price": 0.0, "stock_qty": 0},
  "compliance_result": {"compliant": true/false, "summary": "..."},
  "automation_result": {"success": true/false, "description": "...", "po_draft": {...}},
  "requires_hitl": true/false,
  "reasoning": "brief explanation"
}

CRITICAL RULES:
- Never ask the user for more information
- Never stop mid-workflow
- Always complete all steps before responding
- Return ONLY the JSON object, no other text"""

master_orchestrator = Agent(
    model=model,
    tools=[
        delegate_to_catalog_agent,
        delegate_to_compliance_agent,
        delegate_to_actuator_agent,
    ],
    system_prompt=SYSTEM_PROMPT
)

def run_procurement(request_text: str) -> dict:
    """Entry point with retry on capacity errors"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = master_orchestrator(request_text)
            text = str(response)
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
            return {"raw_response": text[:500], "requires_hitl": True}
        
        except Exception as e:
            error_str = str(e)
            if "serviceUnavailableException" in error_str or "capacity" in error_str:
                if attempt < max_retries - 1:
                    wait = (attempt + 1) * 5  # 5s, 10s, 15s
                    print(f"Bedrock capacity hit, retrying in {wait}s... (attempt {attempt+1})")
                    time.sleep(wait)
                    continue
            elif "MaxTokensReached" in error_str:
                # Return partial result gracefully
                return {
                    "product_name": "Unknown",
                    "quantity": 1,
                    "budget_per_unit": 0,
                    "category": "General",
                    "catalog_result": {},
                    "compliance_result": {"compliant": True, "summary": "Token limit reached"},
                    "automation_result": {"success": False},
                    "requires_hitl": True,
                    "reasoning": f"Agent token limit reached: {error_str[:100]}"
                }
            raise
    
    return {"raw_response": "Max retries exceeded", "requires_hitl": True}
