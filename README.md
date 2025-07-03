[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/venkatakaushikvemani-groww-mcp-badge.png)](https://mseep.ai/app/venkatakaushikvemani-groww-mcp)

# Groww MCP Server

This project provides an MCP (Multi-Channel Platform) server for interacting with the Groww trading API. It allows you to fetch portfolio data, get live quotes, place/cancel/modify orders, and more, all via a unified API interface.

## Features
- Fetch your current portfolio
- Get live stock quotes and OHLC data
- Place, modify, and cancel stock orders
- Fully typed and validated with Zod schemas

## Available Tools

### portfolio
Fetches the user's current portfolio holdings, including trading symbol, quantity, and average price. Use this tool to view your current investments.
- **Actions:**
  - `get`: Get the current portfolio
- **Sample Prompt:**
  > Show my portfolio

### order
Place, modify, cancel, or check the status of stock orders. Use this tool to manage your trades on Groww.
- **Actions:**
  - `place`: Place a new stock order (buy/sell)
  - `modify`: Modify an existing stock order
  - `cancel`: Cancel an existing stock order
  - `status`: Get the status of an order
- **Sample Prompts:**
  > Place a buy order for 10 shares of TATAMOTORS
  > Modify my order for BPL to 20 shares
  > Cancel my latest order for BPL
  > What is the status of my last order?

### market-data
Fetch live quotes, last traded prices (LTP), OHLC, or historical candle data for stocks. Use this tool to get real-time or historical market data.
- **Actions:**
  - `live-quote`: Get live quote data for a specific stock
  - `ltp`: Get the last traded price for one or more stocks
  - `ohlc`: Get OHLC (Open, High, Low, Close) data for stocks
  - `historical-candle`: Fetch historical candle data (Open, High, Low, Close, Volume) for a stock for a given time range and interval
- **Sample Prompts:**
  > Get the live quote for TATAMOTORS
  > What is the last traded price of BPL and HFCL?
  > Show me the OHLC data for TATAMOTORS
  > Show me the historical candle data for TATAMOTORS for the last 1 day
  > Fetch 5-minute historical candles for TATAMOTORS from 2024-06-01 09:15:00 to 2024-06-01 15:30:00

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
- The server exposes intent-based tools for portfolio, market data, and order management.
- See the code in `src/groww/tools/` for available tools and their parameters.

## Contributing
Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

## License
MIT 