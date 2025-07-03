import { PortfolioSchema } from "../../model/schema.js";
import { z } from "zod";

export function registerPortfolioTool(server: any, GROWW_API_KEY: string) {
  server.tool(
    "portfolio",
    {
      description: "Fetches the user's current portfolio holdings, including trading symbol, quantity, and average price. Use this tool to view your current investments.",
      action: z.enum(["get"]).describe("Action to perform on the portfolio. Currently only 'get' is supported."),
    },
    async (input: { action: "get" }) => {
      if (input.action === "get") {
        const url = "https://api.groww.in/v1/holdings/user";
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${GROWW_API_KEY}`,
            "Accept": "application/json"
          }
        });
        const text = await response.text();
        process.stderr.write("Groww API raw response: "+ text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          return {
            content: [{ type: "text", text: "Failed to parse JSON from Groww API. Raw response: " + text }],
            message: "Could not parse portfolio data. Please try again or check your API key."
          };
        }

        // Validate with Zod
        const parseResult = PortfolioSchema.safeParse(data);
        if (!parseResult.success) {
          return {
            content: [{ type: "text", text: "Response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }],
            message: "Portfolio data validation failed. Please check your API key or try again."
          };
        }

        // Return pretty-printed validated data with next action guidance
        return {
          content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }],
          message: "Fetched your portfolio. Use the 'market-data' tool to get live quotes or historical data for any stock in your holdings, or use the 'order' tool to place a buy/sell order."
        };
      } else {
        return {
          content: [{ type: "text", text: "Unsupported action for portfolio tool." }],
          message: "Currently, only the 'get' action is supported for the portfolio tool."
        };
      }
    }
  );
} 