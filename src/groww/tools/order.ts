import { PlaceOrderSchema, ModifyOrderSchema, CancelOrderSchema, GetOrderStatusSchema, ValidityEnum, ExchangeEnum, SegmentEnum, ProductEnum, OrderTypeEnum, TransactionTypeEnum } from "../../model/schema.js";
import { z } from "zod";

const OrderInputSchema = z.object({
  action: z.enum(["place", "modify", "cancel", "status"]),
  trading_symbol: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  trigger_price: z.number().optional(),
  validity: ValidityEnum.optional(),
  exchange: ExchangeEnum.optional(),
  segment: SegmentEnum.optional(),
  product: ProductEnum.optional(),
  order_type: OrderTypeEnum.optional(),
  transaction_type: TransactionTypeEnum.optional(),
  order_reference_id: z.string().min(8).max(20).optional(),
  groww_order_id: z.string().optional(),
});

// --- Action Handlers ---

async function handlePlaceOrder(input: any, apiKey: string) {
  const orderInput = {
    trading_symbol: input.trading_symbol,
    quantity: input.quantity,
    price: input.price,
    trigger_price: input.trigger_price,
    validity: input.validity,
    exchange: input.exchange,
    segment: input.segment,
    product: input.product,
    order_type: input.order_type,
    transaction_type: input.transaction_type,
    order_reference_id: input.order_reference_id,
  };
  const url = "https://api.groww.in/v1/order/create";
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  orderInput.order_reference_id = orderInput.trading_symbol + '-' + random;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderInput)
  });
  const text = await response.text();
  process.stderr.write("Groww Place Order API raw response: " + text);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww Place Order API. Raw response: " + text }], message: "Could not parse order response. Please try again." };
  }
  const parseResult = PlaceOrderSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "Place Order response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "Order placement failed. Please check your input and try again." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Order placed. Use the 'order' tool with action='status' and the returned groww_order_id to check order status." };
}

async function handleModifyOrder(input: any, apiKey: string) {
  const modifyInput = {
    quantity: input.quantity,
    price: input.price,
    trigger_price: input.trigger_price,
    order_type: input.order_type,
    segment: input.segment,
    groww_order_id: input.groww_order_id,
  };
  const url = "https://api.groww.in/v1/order/modify";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(modifyInput)
  });
  const text = await response.text();
  process.stderr.write("Groww Modify Order API raw response: " + text);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww Modify Order API. Raw response: " + text }], message: "Could not parse modify order response. Please try again." };
  }
  const parseResult = ModifyOrderSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "Modify Order response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "Order modification failed. Please check your input and try again." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Order modified. Use the 'order' tool with action='status' and the groww_order_id to check order status." };
}

async function handleCancelOrder(input: any, apiKey: string) {
  const cancelInput = {
    segment: input.segment,
    groww_order_id: input.groww_order_id,
  };
  const url = "https://api.groww.in/v1/order/cancel";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cancelInput)
  });
  const text = await response.text();
  process.stderr.write("Groww Cancel Order API raw response: " + text);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww Cancel Order API. Raw response: " + text }], message: "Could not parse cancel order response. Please try again." };
  }
  const parseResult = CancelOrderSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "Cancel Order response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "Order cancellation failed. Please check your input and try again." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Order cancelled. Use the 'order' tool with action='status' and the groww_order_id to check order status." };
}

async function handleOrderStatus(input: any, apiKey: string) {
  const { groww_order_id, segment } = input;
  if (!groww_order_id || !segment) {
    return {
      content: [{ type: "text", text: "groww_order_id and segment are required." }],
      message: "Please provide both groww_order_id and segment."
    };
  }
  const url = `https://api.groww.in/v1/order/detail/${encodeURIComponent(groww_order_id)}?segment=${encodeURIComponent(segment)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json"
    }
  });
  const text = await response.text();
  process.stderr.write("Groww Get Order Status API raw response: " + text);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { content: [{ type: "text", text: "Failed to parse JSON from Groww Get Order Status API. Raw response: " + text }], message: "Could not parse order status response. Please try again." };
  }
  const parseResult = GetOrderStatusSchema.safeParse(data);
  if (!parseResult.success) {
    return { content: [{ type: "text", text: "Get Order Status response validation failed:\n" + JSON.stringify(parseResult.error.format(), null, 2) }], message: "Order status fetch failed. Please check your input and try again." };
  }
  return { content: [{ type: "text", text: JSON.stringify(parseResult.data, null, 2) }], message: "Fetched order status. Use the 'order' tool with action='modify' or 'cancel' to update or cancel this order if needed." };
}

// --- Tool Registration ---

export function registerOrderTool(server: any, GROWW_API_KEY: string) {
  server.tool(
    "order",
    {
      description: "Place, modify, cancel, or check the status of stock orders. Use this tool to manage your trades on Groww.",
      action: z.enum(["place", "modify", "cancel", "status"]),
      trading_symbol: z.string().optional(),
      quantity: z.number().optional(),
      price: z.number().optional(),
      trigger_price: z.number().optional(),
      validity: ValidityEnum.optional(),
      exchange: ExchangeEnum.optional(),
      segment: SegmentEnum.optional(),
      product: ProductEnum.optional(),
      order_type: OrderTypeEnum.optional(),
      transaction_type: TransactionTypeEnum.optional(),
      order_reference_id: z.string().min(8).max(20).optional(),
      groww_order_id: z.string().optional(),
    },
    async (input: z.infer<typeof OrderInputSchema>) => {
      switch (input.action) {
        case "place":
          return handlePlaceOrder(input, GROWW_API_KEY);
        case "modify":
          return handleModifyOrder(input, GROWW_API_KEY);
        case "cancel":
          return handleCancelOrder(input, GROWW_API_KEY);
        case "status":
          return handleOrderStatus(input, GROWW_API_KEY);
        default:
          return {
            content: [{ type: "text", text: "Unsupported action for order tool." }],
            message: "Supported actions: place, modify, cancel, status."
          };
      }
    }
  );
} 