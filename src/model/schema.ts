import { z } from "zod";

export const PortfolioSchema = z.object({
  status: z.string(),
  payload: z.object({
    holdings: z.array(
      z.object({
        trading_symbol: z.string().nullable().describe("Stock/trading symbol Eg: (HFCL, HIKAL etc)"),
        quantity: z.number(),
        average_price: z.number().describe("Average buy price of the stock/trading symbol"),
      })
    ).optional()
  }).optional(),
  error: z.any().optional()
});

export const PortfolioInputSchema = z.object({});

export const LiveDataSchema = z.object({
  status: z.string(),
  payload: z.object({
    average_price: z.number().optional().describe("Average price of the stock in Rupees."),
    bid_quantity: z.number().optional().describe("Quantity of the bid."),
    bid_price: z.number().optional().describe("Price of the bid."),
    day_change: z.number().optional().describe("Day change in price."),
    day_change_perc: z.number().optional().describe("Day change percentage."),
    upper_circuit_limit: z.number().optional().describe("High price range (upper circuit limit)."),
    lower_circuit_limit: z.number().optional().describe("Low price range (lower circuit limit)."),
    ohlc: z.string().optional().describe("OHLC data as a stringified object: {open, high, low, close}."),
    depth: z.any().optional().describe("Market depth (buy/sell order book)."),
    high_trade_range: z.number().optional().describe("High trade range."),
    implied_volatility: z.number().optional().describe("Implied volatility."),
    last_trade_quantity: z.number().optional().describe("Last trade quantity."),
    last_trade_time: z.number().optional().describe("Last trade time in epoch milliseconds."),
    low_trade_range: z.number().optional().describe("Low trade range."),
    last_price: z.number().optional().describe("Last traded price."),
    market_cap: z.number().optional().describe("Market capitalization."),
    offer_price: z.number().optional().describe("Offer price."),
    offer_quantity: z.number().optional().describe("Quantity of the offer."),
    oi_day_change: z.number().optional().describe("Open interest day change."),
    oi_day_change_percentage: z.number().optional().describe("Open interest day change percentage."),
    open_interest: z.number().optional().describe("Open interest."),
    previous_open_interest: z.number().optional().describe("Previous open interest."),
    total_buy_quantity: z.number().optional().describe("Total buy quantity."),
    total_sell_quantity: z.number().optional().describe("Total sell quantity."),
    volume: z.number().optional().describe("Volume of trades."),
    week_52_high: z.number().optional().describe("52-week high price."),
    week_52_low: z.number().optional().describe("52-week low price.")
  }).optional(),
  error: z.any().optional()
});

export const LiveDataInputSchema = z.object({
  exchange: z.string().default("NSE"),
  segment: z.string().default("CASH"),
  trading_symbol: z.string()
});

export const LtpSchema = z.object({
  status: z.string(),
  payload: z.record(z.string(), z.number())
});

export const LtpInputSchema = z.object({
  segment: z.string().default("CASH"),
  exchange: z
      .string()
      .describe("Stock exchange (e.g., NSE, BSE) as provided by the holdings API"),
  trading_symbols: z
      .array(z.string().describe("Trading symbol"))
      .describe("List of trading symbols")
});

export const OhlcSchema = z.object({
  status: z.string(),
  payload: z.record(
    z.string(),
    z.object({
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number()
    })
  )
});

export const OhlcInputSchema = z.object({
  segment: z.string().default("CASH"),
  exchange: z
    .string()
    .describe("Stock exchange (e.g., NSE, BSE) as provided by the holdings API"),
  trading_symbols: z
    .array(z.string().describe("Trading symbol"))
    .describe("List of trading symbols")
});

// Enums for Place Order API as per Groww documentation
export const ValidityEnum = z.enum(["DAY", "IOC", "GTD", "GTC", "EOS"]).describe("Order validity: DAY, IOC, GTD, GTC, EOS");
export const ExchangeEnum = z.enum(["NSE", "BSE"]).describe("Stock exchange: NSE, BSE");
export const SegmentEnum = z.enum(["CASH", "FNO"]).describe("Segment: CASH (Equity), FNO (Futures & Options)");
export const ProductEnum = z.enum(["CNC", "MIS", "NRML"]).describe("Product type: CNC (Delivery), MIS (Intraday), NRML (Normal)");
export const OrderTypeEnum = z.enum(["LIMIT", "MARKET", "SL", "SL_M"]).describe("Order type: LIMIT, MARKET, SL, SL_M");
export const TransactionTypeEnum = z.enum(["BUY", "SELL"]).describe("Transaction type: BUY, SELL");

// Place Order
export const PlaceOrderInputSchema = z.object({
  trading_symbol: z.string(),
  quantity: z.number(),
  price: z.number().optional(),
  trigger_price: z.number().optional(),
  validity: ValidityEnum,
  exchange: ExchangeEnum,
  segment: SegmentEnum,
  product: ProductEnum,
  order_type: OrderTypeEnum,
  transaction_type: TransactionTypeEnum,
  order_reference_id: z.string().min(8).max(20).regex(/^[A-Za-z0-9-]{8,20}$/).optional().describe("User provided 8-20 length alphanumeric string with at most two hyphens (-). Used for tracking the order.")
});

export const PlaceOrderSchema = z.object({
  status: z.string(),
  payload: z.object({
    groww_order_id: z.string(),
    order_status: z.string(),
    order_reference_id: z.string(),
    remark: z.string().nullable()
  }).optional()
});

// Modify Order
export const ModifyOrderInputSchema = z.object({
  quantity: z.number().optional(),
  price: z.number().optional(),
  trigger_price: z.number().optional(),
  order_type: z.string(),
  segment: z.string(),
  groww_order_id: z.string()
});

export const ModifyOrderSchema = z.object({
  groww_order_id: z.string(),
  order_status: z.string()
});

// Cancel Order
export const CancelOrderInputSchema = z.object({
  segment: z.string(),
  groww_order_id: z.string()
});

export const CancelOrderSchema = z.object({
  status: z.string(),
  payload: z.object({
    groww_order_id: z.string(),
    order_status: z.string()
  }).optional()
});

// Get Order Status
export const GetOrderStatusInputSchema = z.object({
  groww_order_id: z.string(),
  segment: z.string()
});

export const GetOrderStatusSchema = z.object({
  status: z.string(),
  payload: z.object({
    groww_order_id: z.string(),
    trading_symbol: z.string(),
    order_status: z.string(),
    remark: z.string().optional(),
    quantity: z.number(),
    price: z.number().optional(),
    trigger_price: z.number().optional(),
    filled_quantity: z.number().optional(),
    remaining_quantity: z.number().optional(),
    average_fill_price: z.number().optional(),
    deliverable_quantity: z.number().optional(),
    amo_status: z.string().optional(),
    validity: z.string(),
    exchange: z.string(),
    order_type: z.string(),
    transaction_type: z.string(),
    segment: z.string(),
    product: z.string(),
    created_at: z.string().optional(),
    exchange_time: z.string().optional(),
    trade_date: z.string().optional(),
    order_reference_id: z.string().optional()
  }).optional()
});
