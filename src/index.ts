import dotenv from "dotenv";
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGrowwTools } from "./groww/tools.js";

const GROWW_API_KEY = process.env.GROWW_API_KEY;

// Create an MCP server
const server = new McpServer({
  name: "groww-mcp-server",
  version: "1.0.0"
});

if(GROWW_API_KEY) {
  // Register Groww tools
  registerGrowwTools(server, GROWW_API_KEY!);
}

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
