import mcp_server

class MCPClientMock:
    """
    Directly invokes mcp_server async logic to avoid Windows Subprocess STDIO Pipe instability 
    during Hackathon demos. Fits the architectural requirement while remaining perfectly stable.
    """
    async def call_tool(self, tool_name: str, arguments: dict):
        if tool_name == "search_catalog":
            return await mcp_server.search_catalog(arguments.get("query"), arguments.get("max_price"))
        elif tool_name == "check_compliance":
            return await mcp_server.check_compliance(arguments.get("sku"))
        elif tool_name == "get_supplier_info":
            return await mcp_server.get_supplier_info(arguments.get("sku"))
        elif tool_name == "create_purchase_order":
            return await mcp_server.create_purchase_order(
                arguments.get("sku"), 
                arguments.get("quantity", 1), 
                arguments.get("user_id", "demo_user"),
                arguments.get("job_id")
            )
        elif tool_name == "get_purchase_orders":
            return await mcp_server.get_purchase_orders(arguments.get("user_id"))
        return {"error": f"Tool {tool_name} not found"}

mcp_client = MCPClientMock()
