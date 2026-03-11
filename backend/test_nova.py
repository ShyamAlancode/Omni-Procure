import os
from nova_act import NovaAct

PORTAL_PATH = os.path.abspath("demo_portal.html")
print(f"Loading: file:///{PORTAL_PATH}")

with NovaAct(
    starting_page=f"file:///{PORTAL_PATH}",
    headless=False
) as nova:
    
    print("Step 1: Searching for product...")
    nova.act("Search for 'safety gloves' in the search box")
    
    print("Step 2: Adding to cart...")
    nova.act("Find safety gloves product and click Add to Cart")
    
    print("Step 3: Setting quantity to 200...")
    nova.act("Set quantity to 200")
    
    print("Taking screenshot...")
    screenshot = nova.page.screenshot()
    with open("hitl_screenshot.png", "wb") as f:
        f.write(screenshot)
    
    print("Done! Check hitl_screenshot.png")
