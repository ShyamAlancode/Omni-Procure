import json
import re
import logging
import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger("strands_orchestrator")


class OrchestratorAgent:
    def __init__(self):
        try:
            self.client = boto3.client("bedrock-runtime", region_name="us-east-1")
            self.model_id = "us.amazon.nova-lite-v1:0"
            self._bedrock_available = True
        except Exception as e:
            logger.error(f"Bedrock client init failed: {e}")
            self._bedrock_available = False

    def analyze(self, request_text: str) -> dict:
        if not self._bedrock_available:
            logger.warning("Bedrock unavailable, using fallback parser")
            return self._fallback_parse(request_text)

        prompt = f"""You are an enterprise procurement AI. Analyze this procurement request and extract structured information.

Request: {request_text}

Respond ONLY with a valid JSON object — no markdown, no extra text:
{{
    "product_name": "exact product name",
    "quantity": 100,
    "budget_per_unit": 10.0,
    "total_budget": 1000.0,
    "category": "Safety Equipment",
    "urgency": "normal",
    "reasoning": "brief explanation"
}}"""

        try:
            response = self.client.converse(
                modelId=self.model_id,
                messages=[{"role": "user", "content": [{"text": prompt}]}],
                inferenceConfig={"maxTokens": 500, "temperature": 0.1}
            )
            content = response["output"]["message"]["content"][0]["text"]
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                # Normalize and validate required fields
                return {
                    "product_name": str(parsed.get("product_name", "Unknown Product")),
                    "quantity": int(parsed.get("quantity", 100)),
                    "budget_per_unit": float(parsed.get("budget_per_unit", 10.0)),
                    "total_budget": float(parsed.get("total_budget", 1000.0)),
                    "category": str(parsed.get("category", "General")),
                    "urgency": str(parsed.get("urgency", "normal")),
                    "reasoning": str(parsed.get("reasoning", ""))
                }
            logger.warning("No JSON found in Bedrock response, using fallback")
            return self._fallback_parse(request_text)

        except (BotoCoreError, ClientError) as e:
            logger.error(f"Bedrock API error: {e}")
            return self._fallback_parse(request_text)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error from Bedrock response: {e}")
            return self._fallback_parse(request_text)
        except Exception as e:
            logger.error(f"Unexpected error in orchestrator: {e}")
            return self._fallback_parse(request_text)

    def _fallback_parse(self, request_text: str) -> dict:
        """
        Rule-based extraction when Bedrock is unavailable or returns bad data.
        Extracts quantity, budget, and product name from natural language.
        """
        text = request_text.strip()

        # Extract quantity
        quantity_match = re.search(r'(\d[\d,]*)\s*(?:units?|pcs?|pieces?|qty)', text, re.IGNORECASE)
        if not quantity_match:
            quantity_match = re.search(r'(?:need|want|order|buy)\s+(\d[\d,]*)', text, re.IGNORECASE)
        quantity = int(quantity_match.group(1).replace(',', '')) if quantity_match else 100

        # Extract budget
        budget_match = re.search(r'\$\s*([\d,]+(?:\.\d+)?)', text)
        if not budget_match:
            budget_match = re.search(r'([\d,]+(?:\.\d+)?)\s*(?:dollars?|usd)', text, re.IGNORECASE)
        total_budget = float(budget_match.group(1).replace(',', '')) if budget_match else float(quantity * 20)

        # Determine category from keywords
        category_map = {
            "Safety":      ["glove", "helmet", "hard hat", "boot", "goggles", "vest", "fire", "extinguisher", "first aid", "safety"],
            "Chemicals":   ["chemical", "adhesive", "lubricant", "oil", "lithium", "carbonate", "solvent"],
            "Electronics": ["sensor", "battery", "ups", "barcode", "scanner", "electronic"],
            "IT Hardware": ["server", "rack", "switch", "network", "ethernet", "cable", "router"],
            "Logistics":   ["pallet", "forklift", "shipping", "logistic"],
            "Office":      ["chair", "desk", "paper", "printer", "office"],
        }
        lower_text = text.lower()
        detected_category = "General"
        for cat, keywords in category_map.items():
            if any(kw in lower_text for kw in keywords):
                detected_category = cat
                break

        # Extract product name: first meaningful noun phrase
        stop_words = {'i', 'need', 'want', 'order', 'buy', 'purchase', 'units', 'of', 'under', 'budget',
                      'for', 'the', 'a', 'an', 'with', 'my', 'our', 'some', 'please', 'get', 'us'}
        words = re.findall(r'[a-zA-Z]+', text)
        product_words = [w for w in words if w.lower() not in stop_words][:5]
        product_name = ' '.join(product_words).title() if product_words else "Industrial Product"

        budget_per_unit = round(total_budget / quantity, 2) if quantity > 0 else 10.0

        return {
            "product_name": product_name,
            "quantity": quantity,
            "budget_per_unit": budget_per_unit,
            "total_budget": total_budget,
            "category": detected_category,
            "urgency": "normal",
            "reasoning": "Extracted via rule-based fallback parser (Bedrock unavailable)"
        }

    def check_bedrock_health(self) -> bool:
        """Ping Bedrock with a minimal request to verify connectivity."""
        if not self._bedrock_available:
            return False
        try:
            self.client.converse(
                modelId=self.model_id,
                messages=[{"role": "user", "content": [{"text": "ping"}]}],
                inferenceConfig={"maxTokens": 5}
            )
            return True
        except Exception:
            return False


# Module-level singleton
_agent: OrchestratorAgent | None = None


def get_agent() -> OrchestratorAgent:
    global _agent
    if _agent is None:
        _agent = OrchestratorAgent()
    return _agent
