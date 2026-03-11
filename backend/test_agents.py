import sys
import os
import asyncio
import json

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator import run_procurement

async def test_multi_agent():
    print("Starting Multi-Agent Integration Test...")
    request_text = "I need 5 units of Industrial Safety Gloves under 20 dollars each"
    
    # Run in executor because run_procurement is sync
    loop = asyncio.get_event_loop()
    print(f"Submitting request: {request_text}")
    result = await loop.run_in_executor(None, run_procurement, request_text)
    
    print("\n--- TEST RESULT ---")
    print(json.dumps(result, indent=2))
    print("-------------------\n")
    
    if result.get("product_name") and result.get("compliance_result"):
        print("Test PASSED: Orchestrator returned structured findings.")
    else:
        print("Test FAILED: Result missing expected keys.")

if __name__ == "__main__":
    asyncio.run(test_multi_agent())
