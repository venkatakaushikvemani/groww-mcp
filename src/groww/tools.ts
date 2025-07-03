import fetch from "node-fetch"; // If using Node < 18, otherwise use global fetch
import { PortfolioSchema, LiveDataSchema, LtpSchema, PortfolioInputSchema, LiveDataInputSchema, LtpInputSchema, OhlcSchema, OhlcInputSchema, PlaceOrderInputSchema, PlaceOrderSchema, ModifyOrderInputSchema, ModifyOrderSchema, CancelOrderInputSchema, CancelOrderSchema, GetOrderStatusInputSchema, GetOrderStatusSchema, ValidityEnum, ExchangeEnum, SegmentEnum, ProductEnum, OrderTypeEnum, TransactionTypeEnum, HistoricalCandleSchema, HistoricalCandleInputSchema } from "../model/schema.js";
import { z } from "zod";
import { registerPortfolioTool } from "./tools/portfolio.js";
import { registerOrderTool } from "./tools/order.js";
import { registerMarketDataTool } from "./tools/market-data.js";

export function registerGrowwTools(server: any, GROWW_API_KEY: string) {
  // Register modularized tools
  registerPortfolioTool(server, GROWW_API_KEY);
  registerOrderTool(server, GROWW_API_KEY);
  registerMarketDataTool(server, GROWW_API_KEY);
}
