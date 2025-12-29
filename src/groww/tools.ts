import { registerPortfolioTool } from "./tools/portfolio.js";
import { registerOrderTools } from "./tools/order.js";
import { registerMarketDataTool } from "./tools/market-data.js";

export function registerGrowwTools(server: any, GROWW_API_KEY: string) {
  // Register modularized tools
  registerPortfolioTool(server, GROWW_API_KEY);
  registerOrderTools(server, GROWW_API_KEY);
  registerMarketDataTool(server, GROWW_API_KEY);
}
