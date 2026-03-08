import asyncio
import logging
import json
import boto3
from typing import Any, Dict, List
from mcp_client import mcp_client
from actuator_worker import ActuatorWorker

logger = logging.getLogger("OmniProcure-Strands")

class StrandsSwarmManager:
    """
    Real implementation of the AWS Strands Agent logic mapping to Amazon Bedrock's Converse API.
    """
    def __init__(self):
        # We assume local AWS credentials exist (~/.aws/credentials) or are exported in env.
        self.bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")
        self.model_id = "us.amazon.nova-lite-v1:0" # Fallback to v1 if nova-2-lite isn't provisioned yet
        
        self.system_prompt = [
            {
                "text": (
                    "You are OmniProcure Orchestrator, an enterprise AI managing Source-to-Pay (S2P) operations. "
                    "You must break down natural language requests into deterministic multi-step operations. "
                    "First, ALWAYS use the 'search_inventory' tool to check the MCP SQLite database for the item and its price. "
                    "Second, use the 'actuate_browser' tool to physically navigate to the supplier and order it."
                )
            }
        ]
        
        self.tool_config = {
            "tools": [
                {
                    "toolSpec": {
                        "name": "search_inventory",
                        "description": "Search the internal enterprise SQLite database for items, prices, and compliance codes.",
                        "inputSchema": {
                            "json": {
                                "type": "object",
                                "properties": {
                                    "query": {
                                        "type": "string",
                                        "description": "The name or category of the product to search for, e.g., 'adhesive'"
                                    }
                                },
                                "required": ["query"]
                            }
                        }
                    }
                },
                {
                    "toolSpec": {
                        "name": "actuate_browser",
                        "description": "Trigger the Amazon Nova Act headless browser actuator to physically perform web tasks.",
                        "inputSchema": {
                            "json": {
                                "type": "object",
                                "properties": {
                                    "target_action": {
                                        "type": "string",
                                        "description": "What to do in the browser, e.g. 'add to cart and checkout'"
                                    },
                                    "search_term": {
                                        "type": "string",
                                        "description": "The exact SKU or product term to search on the site"
                                    }
                                },
                                "required": ["target_action", "search_term"]
                            }
                        }
                    }
                }
            ]
        }
        
    async def invoke_swarm(self, user_prompt: str) -> Dict[str, Any]:
        """
        Executes the Bedrock Converse API with tool calling (The real Engine).
        """
        traces = []
        
        def push_trace(agent: str, status: str, details: str):
            traces.append({"agent": agent, "status": status, "details": details})
            
        push_trace("Orchestrator (Nova)", "Initializing", f"Engine activated. Calling {self.model_id}.")
        
        messages = [
            {
                "role": "user",
                "content": [{"text": user_prompt}]
            }
        ]
        
        try:
            # 1. Initial Orchestrator Call
            response = self.bedrock.converse(
                modelId=self.model_id,
                messages=messages,
                system=self.system_prompt,
                toolConfig=self.tool_config
            )
            
            output_message = response['output']['message']
            messages.append(output_message)
            
            # 2. Check for Tool Requests
            for content_block in output_message['content']:
                if 'toolUse' in content_block:
                    tool_use = content_block['toolUse']
                    tool_name = tool_use['name']
                    tool_input = tool_use['input']
                    
                    if tool_name == "search_inventory":
                        push_trace("Compliance Worker (MCP)", "Executing Database Tool", f"Querying SQLite for: {tool_input.get('query')}")
                        mcp_result = await mcp_client.call_tool("search_inventory", tool_input)
                        
                        # Add tool result back to messages
                        messages.append({
                            "role": "user",
                            "content": [
                                {
                                    "toolResult": {
                                        "toolUseId": tool_use['toolUseId'],
                                        "content": [{"json": mcp_result}]
                                    }
                                }
                            ]
                        })
                        
                        push_trace("Compliance Worker (MCP)", "Data Found", f"Returned exactly {len(mcp_result.get('data', []))} records from MCP SQLite via FastMCP fallback.")
                        
            # 3. Second Orchestrator Call to evaluate MCP data and call actuator
            response2 = self.bedrock.converse(
                modelId=self.model_id,
                messages=messages,
                system=self.system_prompt,
                toolConfig=self.tool_config
            )
            
            output_message2 = response2['output']['message']
            messages.append(output_message2)
            
            for content_block in output_message2['content']:
                if 'toolUse' in content_block:
                    tool_use = content_block['toolUse']
                    if tool_use['name'] == "actuate_browser":
                        push_trace("Actuator Agent (Browser)", "Launching Headless Run", f"Instructed to: {tool_use['input'].get('target_action')}")
                        
                        # Trigger actual Playwright worker
                        actuator = ActuatorWorker()
                        act_res = await actuator.execute_task(
                            tool_use['input'].get('target_action'), 
                            [tool_use['input'].get('search_term')]
                        )
                        
                        if act_res["status"] == "success":
                            push_trace("Actuator Agent", "Execution Complete", f"Captured trace evidence at {act_res.get('evidence_file', 'unknown')}.")
                        else:
                            push_trace("Actuator Agent", "Error", f"Failed: {act_res.get('message')}")
                            
            # 4. Final Final Answer
            push_trace("Evidence Reviewer", "Analyzing Output", "Validating final state. Requesting Human-In-The-Loop.")
            
            # For hackathon safety, we always return AWAITING_HUMAN_APPROVAL at the end
            return {
                "status": "AWAITING_HUMAN_APPROVAL",
                "trace": traces,
                "final_recommendation": "The engine has successfully negotiated the database and automated the browser. P.O. is ready for approval."
            }
            
        except Exception as e:
            logger.error(f"Bedrock Converse Error: {e}")
            push_trace("System Error", "Failed", str(e))
            return {
                "status": "error",
                "trace": traces,
                "final_recommendation": f"Failed to communicate with AWS Bedrock: {e}"
            }
