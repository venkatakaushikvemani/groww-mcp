import fetch from "node-fetch"; // If using Node < 18, otherwise use global fetch
import { PortfolioSchema, LiveDataSchema, LtpSchema, PortfolioInputSchema, LiveDataInputSchema, LtpInputSchema, OhlcSchema, OhlcInputSchema, PlaceOrderInputSchema, PlaceOrderSchema, ModifyOrderInputSchema, ModifyOrderSchema, CancelOrderInputSchema, CancelOrderSchema, GetOrderStatusInputSchema, GetOrderStatusSchema, ValidityEnum, ExchangeEnum, SegmentEnum, ProductEnum, OrderTypeEnum, TransactionTypeEnum, HistoricalCandleSchema, HistoricalCandleInputSchema } from "../model/schema.js";
import { z } from "zod";

export function registerGrowwTools(server: any, GROWW_API_KEY: string) {
  // Portfolio tool
  server.tool(
    "get-portfolio",
    "Get the current portfolio of the user",
    {},
    async (input: any) => {
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
          content: [{ type: "text", text: "Failed to parse JSON from Groww API. Raw response: " + text }]
        };
      }

      // Validate with Zod
      const parseResult = PortfolioSchema.safeParse(data);
      if (!parseResult.success) {
        return {
          content: [{
            type: "text",
            text: "Response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2)
          }]
        };
      }

      // Return pretty-printed validated data
      return {
        content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }]
      };
    }
  );

  // Live Data (Quote) tool
  server.tool(
    "get-live-quote",
    {
      exchange: z.string().describe("Stock exchange (e.g., NSE, BSE) as provided by the holdings API. Required."),
      segment: z.string().describe("Segment defines whether the instrument is equity or FNO contract. CASH for stocks and index, FNO for derivatives. Required."),
      trading_symbol: z.string().describe("Trading Symbol of the instrument as defined by the exchange. Required.")
    },
    async (input: z.infer<typeof LiveDataInputSchema>) => {
      // Validate input
      const { exchange, segment, trading_symbol } = LiveDataInputSchema.parse(input);
      const url = `https://api.groww.in/v1/live-data/quote?exchange=${encodeURIComponent(exchange)}&segment=${encodeURIComponent(segment)}&trading_symbol=${encodeURIComponent(trading_symbol)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      process.stderr.write("Groww Live Data API raw response: "+ text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return {
          content: [{ type: "text", text: "Failed to parse JSON from Groww Live Data API. Raw response: " + text }]
        };
      }

      // Validate with Zod
      const parseResult = LiveDataSchema.safeParse(data);
      if (!parseResult.success) {
        return {
          content: [{
            type: "text",
            text: "Live Data response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2)
          }]
        };
      }

      // Return pretty-printed validated data
      return {
        content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }]
      };
    }
  );

  // Get LTP tool
  server.tool(
    "get-last-traded-price",
    "Get the last traded price of a provided stocks",
    {
      segment: z.string()
                .describe("Segment to query for (e.g., CASH, FNO). Defaults to 'CASH' for equities and indices. Use 'FNO' for derivatives." )
                .default("CASH"),
      exchange: z.string().describe("Stock exchange (e.g., NSE, BSE) as provided by the holdings API. Required."),
      trading_symbols: z.array(z.string().describe("Trading symbol as defined by the exchange. Required.")).describe("List of trading symbols.")
    },
    async (input: z.infer<typeof LtpInputSchema>) => {
      // Validate input
      const { segment, exchange, trading_symbols } = LtpInputSchema.parse(input);
      process.stderr.write("Groww LTP API raw response: "+ trading_symbols + " " + segment + " " + exchange);
      const exchange_symbols = trading_symbols.map(symbol => exchange + "_" + symbol).join(",");
      const url = `https://api.groww.in/v1/live-data/ltp?segment=${encodeURIComponent(segment)}&exchange_symbols=${encodeURIComponent(exchange_symbols)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      process.stderr.write("Groww LTP API raw response: "+ text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return {
          content: [{ type: "text", text: "Failed to parse JSON from Groww LTP API. Raw response: " + text }]
        };
      }

      // Validate with Zod
      const parseResult = LtpSchema.safeParse(data);
      if (!parseResult.success) {
        return {
          content: [{
            type: "text",
            text: "LTP response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2)
          }]
        };
      }

      // Return pretty-printed validated data
      return {
        content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }]
      };
    }
  );

  // Get OHLC tool
  server.tool(
    "get-ohlc",
    "Get the OHLC (Open, High, Low, Close) data for provided stocks",
    {
      segment: z.string().default("CASH").describe("Segment to query for (e.g., CASH, FNO). Defaults to 'CASH' for equities and indices. Use 'FNO' for derivatives."),
      exchange: z.string().describe("Stock exchange (e.g., NSE, BSE) as provided by the holdings API. Required."),
      trading_symbols: z.array(z.string().describe("Trading symbol as defined by the exchange. Required.")).describe("List of trading symbols.")
    },
    async (input: z.infer<typeof OhlcInputSchema>) => {
      // Validate input
      const { segment, exchange, trading_symbols } = OhlcInputSchema.parse(input);
      const exchange_symbols = trading_symbols.map(symbol => exchange + "_" + symbol).join(",");
      const url = `https://api.groww.in/v1/live-data/ohlc?segment=${encodeURIComponent(segment)}&exchange_symbols=${encodeURIComponent(exchange_symbols)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      process.stderr.write("Groww OHLC API raw response: "+ text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return {
          content: [{ type: "text", text: "Failed to parse JSON from Groww OHLC API. Raw response: " + text }]
        };
      }

      // Validate with Zod
      const parseResult = OhlcSchema.safeParse(data);
      if (!parseResult.success) {
        return {
          content: [{
            type: "text",
            text: "OHLC response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2)
          }]
        };
      }

      // Return pretty-printed validated data
      return {
        content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }]
      };
    }
  );

  // Place Order tool
  server.tool(
    "place-order",
    "Place a new stock order",
    {
      trading_symbol: z.string().describe("Trading Symbol of the instrument as defined by the exchange. Required."),
      quantity: z.number().describe("Quantity of stocks to order. Required."),
      price: z.number().optional().describe("Price of the stock in rupees (required for LIMIT orders). Optional for MARKET orders."),
      trigger_price: z.number().optional().describe("Trigger price in rupees for SL/SL_M orders. Optional."),
      validity: ValidityEnum.describe("Order validity: DAY, IOC, GTD, GTC, EOS. Required."),
      exchange: ExchangeEnum.describe("Stock exchange: NSE, BSE. Required."),
      segment: SegmentEnum.describe("Segment: CASH (Equity), FNO (Futures & Options). Required."),
      product: ProductEnum.describe("Product type: CNC (Delivery), MIS (Intraday), NRML (Normal). Required."),
      order_type: OrderTypeEnum.describe("Order type: LIMIT, MARKET, SL, SL_M. Required."),
      transaction_type: TransactionTypeEnum.describe("Transaction type: BUY, SELL. Required."),
      order_reference_id: z.string().min(8).max(20).optional().describe("User provided 8 to 20 length alphanumeric string with at most two hyphens (-). Optional. Must be unique per order.")
    },
    async (input: z.infer<typeof PlaceOrderInputSchema>) => {
      const url = "https://api.groww.in/v1/order/create";
      const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 chars
      input.order_reference_id = input.trading_symbol + '-' + random;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const text = await response.text();
      process.stderr.write("Groww Place Order API raw response: " + text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { content: [{ type: "text", text: "Failed to parse JSON from Groww Place Order API. Raw response: " + text }] };
      }
      const parseResult = PlaceOrderSchema.safeParse(data);
      if (!parseResult.success) {
        return { content: [{ type: "text", text: "Place Order response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }] };
    }
  );

  // Modify Order tool
  server.tool(
    "modify-order",
    "Modify an existing stock order",
    {
      quantity: z.number().optional().describe("Quantity of stocks to modify the order to. Optional."),
      price: z.number().optional().describe("Price of the stock in rupees (for LIMIT orders). Optional."),
      trigger_price: z.number().optional().describe("Trigger price in rupees for SL/SL_M orders. Optional."),
      order_type: z.string().describe("Order type: LIMIT, MARKET, SL, SL_M. Required."),
      segment: z.string().describe("Segment: CASH (Equity), FNO (Futures & Options). Required."),
      groww_order_id: z.string().describe("Order id generated by Groww for an order. Required.")
    },
    async (input: z.infer<typeof ModifyOrderInputSchema>) => {
      const url = "https://api.groww.in/v1/order/modify";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const text = await response.text();
      process.stderr.write("Groww Modify Order API raw response: " + text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { content: [{ type: "text", text: "Failed to parse JSON from Groww Modify Order API. Raw response: " + text }] };
      }
      const parseResult = ModifyOrderSchema.safeParse(data);
      if (!parseResult.success) {
        return { content: [{ type: "text", text: "Modify Order response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }] };
    }
  );

  // Cancel Order tool
  server.tool(
    "cancel-order",
    "Cancel an existing stock order",
    {
      segment: z.string().describe("Segment: CASH (Equity), FNO (Futures & Options). Required."),
      groww_order_id: z.string().describe("Order id generated by Groww for an order. Required.")
    },
    async (input: z.infer<typeof CancelOrderInputSchema>) => {
      const url = "https://api.groww.in/v1/order/cancel";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const text = await response.text();
      process.stderr.write("Groww Cancel Order API raw response: " + text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { content: [{ type: "text", text: "Failed to parse JSON from Groww Cancel Order API. Raw response: " + text }] };
      }
      const parseResult = CancelOrderSchema.safeParse(data);
      if (!parseResult.success) {
        return { content: [{ type: "text", text: "Cancel Order response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }] };
    }
  );

  // Get Order Status tool
  server.tool(
    "get-order-status",
    "Get the status of an order",
    {
      groww_order_id: z.string().describe("Order id generated by Groww for an order. Required."),
      segment: z.string().describe("Segment: CASH (Equity), FNO (Futures & Options). Required.")
    },
    async (input: z.infer<typeof GetOrderStatusInputSchema>) => {
      const { groww_order_id, segment } = input;
      const url = `https://api.groww.in/v1/order/detail/${encodeURIComponent(groww_order_id)}?segment=${encodeURIComponent(segment)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      process.stderr.write("Groww Get Order Status API raw response: " + text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { content: [{ type: "text", text: "Failed to parse JSON from Groww Get Order Status API. Raw response: " + text }] };
      }
      const parseResult = GetOrderStatusSchema.safeParse(data);
      if (!parseResult.success) {
        return { content: [{ type: "text", text: "Get Order Status response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }] };
    }
  );

  // Historical Candle Data tool
  server.tool(
    "get-historical-candle",
    "Fetch historical candle data for an instrument using the Groww API.",
    {
      exchange: z.string().default("NSE").describe("Stock exchange (e.g., NSE, BSE) as provided by the holdings API. Optional, defaults to NSE."),
      segment: z.string().default("CASH").describe("Segment of the instrument such as CASH, FNO etc. Optional, defaults to CASH."),
      trading_symbol: z.string().describe("Trading Symbol of the instrument as defined by the exchange. Required."),
      start_time: z.string().optional().describe("Time in yyyy-MM-dd HH:mm:ss or epoch milliseconds format from which data is required. Optional, defaults to 1 day ago."),
      end_time: z.string().optional().describe("Time in yyyy-MM-dd HH:mm:ss or epoch milliseconds format till which data is required. Optional, defaults to current time."),
      interval_in_minutes: z.string().optional().describe("Interval in minutes for which data is required. Optional, defaults to 1.")
    },
    async (input: z.infer<typeof HistoricalCandleInputSchema>) => {
      const { exchange, segment, trading_symbol, interval_in_minutes } = input;
      let start_time = input.start_time;
      let end_time = input.end_time;

      if(!start_time && !end_time) {
        // Get the last 1 day data in epoch milliseconds
        start_time = Math.floor(Date.now() - 24 * 60 * 60 * 1000).toString();
        end_time = Date.now().toString();
      }
      const params = new URLSearchParams({
        exchange,
        segment,
        trading_symbol,
        start_time,
        end_time
      });
      if (interval_in_minutes) params.append("interval_in_minutes", interval_in_minutes);
      const url = `https://api.groww.in/v1/historical/candle/range?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${GROWW_API_KEY}`,
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      process.stderr.write("Groww Historical Candle API raw response: " + text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { content: [{ type: "text", text: "Failed to parse JSON from Groww Historical Candle API. Raw response: " + text }] };
      }
      const parseResult = HistoricalCandleSchema.safeParse(data);
      if (!parseResult.success) {
        return { content: [{ type: "text", text: "Historical Candle response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }] };
    }
  );
}
