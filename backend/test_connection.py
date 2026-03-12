import boto3
import os
import sys
from dotenv import load_dotenv

load_dotenv()

region = os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1"
print(f"Testing connection to Bedrock in region: {region}...")

try:
    client = boto3.client("bedrock-runtime", region_name=region)
    print("  Attempting to list foundation models (check if host resolves)...")
    
    # Try a lightweight call
    response = client.invoke_model(
        modelId="amazon.nova-lite-v1:0",
        contentType="application/json",
        accept="application/json",
        body='{"messages":[{"role":"user","content":[{"text":"Hi"}]}]}'
    )
    print("  ✅ SUCCESS: Successfully reached Bedrock runtime.")

except Exception as e:
    print(f"  ❌ FAILED: {e}")
    print("\nChecklist:")
    print("1. Are you connected to the internet?")
    print("2. Is 'bedrock-runtime.us-east-1.amazonaws.com' reachable (DNS)?")
    print("3. Are your AWS credentials valid in .env?")
    print("4. Do you have access to Nova Lite in us-east-1?")
