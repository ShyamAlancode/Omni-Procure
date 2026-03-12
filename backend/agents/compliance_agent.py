from strands import Agent, tool
from strands.models import BedrockModel
import sys, os
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_compliance_rules, search_products

model = BedrockModel(
    model_id="us.amazon.nova-lite-v1:0",
    region_name=os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1",
)

@tool
def check_budget_compliance(category: str, unit_price: float, quantity: int) -> dict:
    """
    Verify if a procurement request passes compliance rules.
    Returns pass/fail with detailed rule-by-rule breakdown.
    """
    import asyncio
    rules = asyncio.run(get_compliance_rules(category))
    
    violations = []
    passed_rules = []
    
    for rule in rules:
        threshold = rule.get("max_price_threshold")
        if threshold and unit_price > threshold:
            violations.append({
                "rule": rule["rule_name"],
                "reason": f"Unit price ${unit_price:.2f} exceeds threshold ${threshold:.2f}"
            })
        else:
            passed_rules.append(rule.get("rule_name", "General Policy"))
    
    return {
        "compliant": len(violations) == 0,
        "violations": violations,
        "passed_rules": passed_rules,
        "total_value": unit_price * quantity
    }

@tool
def verify_supplier(supplier_name: str) -> dict:
    """Check if a supplier is approved and get their rating"""
    import asyncio
    from database import get_supplier_by_name
    supplier = asyncio.run(get_supplier_by_name(supplier_name))
    
    if not supplier:
        # Demo bypass: Allow unknown suppliers but flag them
        return {
            "approved": True, 
            "status": "PENDING_VERIFICATION",
            "warning": f"Supplier '{supplier_name}' is not in the approved database. Manual verification required.",
            "rating": 3.0,
            "contact": "unknown@example.com",
            "location": "Global"
        }
        
    return {
        "approved": bool(supplier["verified"]),
        "rating": supplier["rating"],
        "contact": supplier["contact_email"],
        "location": supplier["location"]
    }

compliance_agent = Agent(
    model=model,
    tools=[check_budget_compliance, verify_supplier],
    system_prompt="""You are the OmniProcure Compliance Agent.
Your ONLY job is to verify procurement requests against policy rules.
ALWAYS call check_budget_compliance first.
Only call verify_supplier if a supplier_name is explicitly provided.
If no supplier name is given, skip verify_supplier and proceed.
Return JSON: {"compliant": bool, "summary": str, "violations": []}
Never ask the user for more information. Work with what you have."""
)
