import asyncio
import logging
from playwright.async_api import async_playwright
import os

logger = logging.getLogger("OmniProcure-Actuator")

class ActuatorWorker:
    """
    Simulates the deterministic fallback layer for the Amazon Nova Act SDK.
    In the real integration, Nova Act handles dynamic visual intent-based 
    navigation, and hands off to this Playwright script for structured auth/cart loops.
    """
    def __init__(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.demo_url = f"file:///{script_dir}/demo_portal.html".replace("\\", "/")

    async def execute_task(self, target_action: str, search_terms: list) -> dict:
        """
        Executes a headless browsing sequence.
        """
        logger.info(f"Received Actuator Intent: {target_action} for {search_terms}")
        # Note: Playwright needs to be installed via `playwright install chromium`
        try:
            async with async_playwright() as p:
                # We turn OFF headless mode and add slow_mo so the user can WATCH the AI work!
                browser = await p.chromium.launch(headless=False, slow_mo=700)
                page = await browser.new_page()
                
                logger.info(f"Navigating to {self.demo_url} to perform {target_action}")
                await page.goto(self.demo_url, wait_until="domcontentloaded")

                # Simulate executing the search and checkout flow
                logger.info("Nova Act Intent matched. Running deterministic Playwright fallback...")
                await asyncio.sleep(1) # Simulated visual processing time
                
                # Reliably click Add to Cart on the static mock portal
                await page.click("#btn-add-cart")
                await asyncio.sleep(1) # Wait for UI update
                
                # Take evidence screenshot for the Vision QA reviewer
                script_dir = os.path.dirname(os.path.abspath(__file__))
                evidence_path = os.path.join(script_dir, "evidence_screenshot.png")
                await page.screenshot(path=evidence_path)
                logger.info(f"Evidence captured at {evidence_path}")
                
                await browser.close()
                
                return {
                    "status": "success",
                    "evidence_file": evidence_path,
                    "action_log": f"Navigated to demo site. Clicked 'Add to Cart'. Captured checkout screenshot."
                }
        except Exception as e:
            logger.error(f"Actuator execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

if __name__ == "__main__":
    # Test execution
    worker = ActuatorWorker()
    asyncio.run(worker.execute_task("Find adhesive and checkout", ["adhesive"]))
