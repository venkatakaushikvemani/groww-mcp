# Groww MCP Server

This project provides an MCP (Multi-Channel Platform) server for interacting with the Groww trading API. It allows you to fetch portfolio data, get live quotes, place/cancel/modify orders, and more, all via a unified API interface.

## Features
- Fetch your current portfolio
- Get live stock quotes and OHLC data
- Place, modify, and cancel stock orders
- Fully typed and validated with Zod schemas

## Available Tools
- **get-portfolio**: Get the current portfolio of the user
- **get-live-quote**: Get live quote data for a specific stock
- **get-last-traded-price**: Get the last traded price for one or more stocks
- **get-ohlc**: Get OHLC (Open, High, Low, Close) data for stocks
- **get-historical-candle**: Fetch historical candle data (Open, High, Low, Close, Volume) for a stock for a given time range and interval
- **place-order**: Place a new stock order (buy/sell)
- **modify-order**: Modify an existing stock order
- **cancel-order**: Cancel an existing stock order
- **get-order-status**: Get the status of an order

## Requirements
- Node.js v18 or later
- A valid Groww API key

## Setup (Local)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/venkatakaushikvemani/groww-mcp
   cd groww-mcp
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   pnpm install
   ```
3. **Set environment variables:**
   Create a `.env` file in the root directory and add:
   ```env
   GROWW_API_KEY=your_groww_api_key_here
   PORT=3000 # or your preferred port
   ```
4. **Start the server:**
   ```sh
   npm start
   # or
   pnpm start
   ```

## Use with Cursor / Claude / Windsurf
mcp.json

```json
{
  "mcpServers": {
    "groww-mcp": {
      "command": "pnpm",
      "args": ["dlx", "groww-mcp"],
      "env": {
        "GROWW_API_KEY": "YOUR_GROWW_API_KEY"
      }
    }
  }
}

```

## Usage
- The server exposes endpoints/tools for portfolio, quotes, and order management.
- See the code in `src/groww/tools.ts` for available tools and their parameters.

## Sample Prompts
Here are some example prompts you can use to interact with the tools:

- **Get your portfolio:**
  > Fetch my portfolio

- **Get a live quote:**
  > Get the live quote for TATAMOTORS

- **Get last traded price:**
  > What is the last traded price of BPL and HFCL?

- **Get OHLC data:**
  > Show me the OHLC data for TATAMOTORS

- **Get historical candle data:**
  > Show me the historical candle data for TATAMOTORS for the last 1 day
  > Fetch 5-minute historical candles for TATAMOTORS from 2024-06-01 09:15:00 to 2024-06-01 15:30:00

- **Place a buy order:**
  > Buy 10 shares of SADHNANIQ

- **Place a sell order:**
  > Sell 5 shares of TATAMOTORS

- **Modify an order:**
  > Modify my order for BPL to 20 shares

- **Cancel an order:**
  > Cancel my latest order for BPL

- **Get order status:**
  > What is the status of my last order?

## Contributing
Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

## License
MIT 