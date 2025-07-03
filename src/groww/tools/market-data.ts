import { LiveDataSchema, LtpSchema, OhlcSchema, HistoricalCandleSchema, ValidityEnum, ExchangeEnum, SegmentEnum } from "../../model/schema.js";
import { z } from "zod";

const MarketDataInputSchema = z.object({
  action: z.enum(["live-quote", "ltp", "ohlc", "historical-candle"]),
  trading_symbol: z.string().optional(),
  trading_symbols: z.array(z.string()).optional(),
  exchange: z.string().optional(),
  segment: z.string().optional(),
  interval_in_minutes: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

// --- Action Handlers ---

async function handleLiveQuote(input: any, apiKey: string) {
  const { exchange = "NSE", segment = "CASH", trading_symbol } = input;
  if (!trading_symbol) {
    return { content: [{ type: "text", text: "trading_symbol is required." }], message: "Please provide a trading_symbol." };
  }
  const url = `https://api.groww.in/v1/live-data/quote?exchange=${encodeURIComponent(exchange)}&segment=${encodeURIComponent(segment)}&trading_symbol=${encodeURIComponent(trading_symbol)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json"
    }
  });
  const text = await response.text();
  process.stderr.write("Groww Live Data API raw response: "+ text);
  let data;
  try { data = JSON.parse(text); } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww Live Data API. Raw response: " + text }], message: "Could not parse live quote response." };
  }
  const parseResult = LiveDataSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "Live Data response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "Live quote fetch failed." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Fetched live quote. Use 'market-data' with action='ltp', 'ohlc', or 'historical-candle' for more data." };
}

async function handleLTP(input: any, apiKey: string) {
  const { exchange = "NSE", segment = "CASH", trading_symbols } = input;
  if (!trading_symbols || !trading_symbols.length) {
    return { content: [{ type: "text", text: "trading_symbols is required (array)." }], message: "Please provide trading_symbols as an array." };
  }
  const exchange_symbols = trading_symbols.map((symbol: string) => exchange + "_" + symbol).join(",");
  const url = `https://api.groww.in/v1/live-data/ltp?segment=${encodeURIComponent(segment)}&exchange_symbols=${encodeURIComponent(exchange_symbols)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json"
    }
  });
  const text = await response.text();
  process.stderr.write("Groww LTP API raw response: "+ text);
  let data;
  try { data = JSON.parse(text); } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww LTP API. Raw response: " + text }], message: "Could not parse LTP response." };
  }
  const parseResult = LtpSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "LTP response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "LTP fetch failed." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Fetched last traded price(s). Use 'market-data' with other actions for more data." };
}

async function handleOHLC(input: any, apiKey: string) {
  const { exchange = "NSE", segment = "CASH", trading_symbols } = input;
  if (!trading_symbols || !trading_symbols.length) {
    return { content: [{ type: "text", text: "trading_symbols is required (array)." }], message: "Please provide trading_symbols as an array." };
  }
  const exchange_symbols = trading_symbols.map((symbol: string) => exchange + "_" + symbol).join(",");
  const url = `https://api.groww.in/v1/live-data/ohlc?segment=${encodeURIComponent(segment)}&exchange_symbols=${encodeURIComponent(exchange_symbols)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json"
    }
  });
  const text = await response.text();
  process.stderr.write("Groww OHLC API raw response: "+ text);
  let data;
  try { data = JSON.parse(text); } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww OHLC API. Raw response: " + text }], message: "Could not parse OHLC response." };
  }
  const parseResult = OhlcSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "OHLC response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "OHLC fetch failed." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Fetched OHLC data. Use 'market-data' with other actions for more data." };
}

async function handleHistoricalCandle(input: any, apiKey: string) {
  const { exchange = "NSE", segment = "CASH", trading_symbol, interval_in_minutes, start_time, end_time } = input;
  if (!trading_symbol) {
    return { content: [{ type: "text", text: "trading_symbol is required." }], message: "Please provide a trading_symbol." };
  }
  let s_time = start_time;
  let e_time = end_time;
  if (!s_time && !e_time) {
    s_time = Math.floor(Date.now() - 24 * 60 * 60 * 1000).toString();
    e_time = Date.now().toString();
  }
  const params = new URLSearchParams({
    exchange,
    segment,
    trading_symbol,
    start_time: s_time,
    end_time: e_time
  });
  if (interval_in_minutes) params.append("interval_in_minutes", interval_in_minutes);
  const url = `https://api.groww.in/v1/historical/candle/range?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json"
    }
  });
  const text = await response.text();
  process.stderr.write("Groww Historical Candle API raw response: " + text);
  let data;
  try { data = JSON.parse(text); } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww Historical Candle API. Raw response: " + text }], message: "Could not parse historical candle response." };
  }
  const parseResult = HistoricalCandleSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "Historical Candle response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "Historical candle fetch failed." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Fetched historical candle data. Use 'market-data' with other actions for more data." };
}

// --- Tool Registration ---

export function registerMarketDataTool(server: any, GROWW_API_KEY: string) {
  server.tool(
    "market-data",
    {
      description: "Fetch live quotes, last traded prices (LTP), OHLC, or historical candle data for stocks. Use this tool to get real-time or historical market data.",
      action: z.enum(["live-quote", "ltp", "ohlc", "historical-candle"]),
      trading_symbol: z.string().optional(),
      trading_symbols: z.array(z.string()).optional(),
      exchange: z.string().optional(),
      segment: z.string().optional(),
      interval_in_minutes: z.string().optional(),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
    },
    async (input: z.infer<typeof MarketDataInputSchema>) => {
      switch (input.action) {
        case "live-quote":
          return handleLiveQuote(input, GROWW_API_KEY);
        case "ltp":
          return handleLTP(input, GROWW_API_KEY);
        case "ohlc":
          return handleOHLC(input, GROWW_API_KEY);
        case "historical-candle":
          return handleHistoricalCandle(input, GROWW_API_KEY);
        default:
          return {
            content: [{ type: "text", text: "Unsupported action for market-data tool." }],
            message: "Supported actions: live-quote, ltp, ohlc, historical-candle."
          };
      }
    }
  );
} 