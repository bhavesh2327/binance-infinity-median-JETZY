⚡ Binance Infinity Median Service

A Node.js + Express microservice that continuously streams real-time trade data from Binance and computes an evolving Infinity Median for multiple trading pairs.

The Infinity Median reflects the true running median price of all observed trades for a pair — ideal for real-time dashboards, analytics tools, or trading intelligence systems.

🔍 Overview

This project connects to Binance, randomly selects 10 trading pairs, and keeps track of their live price updates.
It then calculates a continuously updated median for each pair using a dual-heap (min-max heap) structure, ensuring O(log n) performance on every price update.

🧩 Core Capabilities

Random Pair Selection → Picks 10 random trade pairs from Binance’s REST API.

Live Data Stream → Subscribes to Binance’s WebSocket feed for instant price updates.

Efficient Median Tracking → Computes an ongoing median using a balanced heap algorithm.

REST API Endpoints

GET /pairs → Selects 10 pairs and starts streaming.

GET /prices → Returns the latest prices.

GET /medians → Displays the current median for each tracked pair.

GET /median/:pair → Fetches the median for a specific symbol.

WebSocket Support

ws://localhost:PORT/median/:pair → Stream live median updates.

Performance-Oriented → Optimized for high-frequency market streams.

🚀 Setup & Usage
Step 1. Clone the Repository
git clone https://github.com/bhavesh2327/binance-infinity-median-JETZY.git
cd binance-infinity-median-JETZY

Step 2. Install Dependencies
npm install

Step 3. Start the Service
npm run dev
# or directly:
node index.js

Step 4. Start Streaming

Use PowerShell or any terminal:

Invoke-RestMethod http://localhost:3000/pairs

Step 5. View Results
Invoke-RestMethod http://localhost:3000/medians | ConvertTo-Json -Depth 4
Invoke-RestMethod http://localhost:3000/prices | ConvertTo-Json -Depth 4
Invoke-RestMethod http://localhost:3000/median/BTCUSDT

🌐 WebSocket Example (Browser Console)
const ws = new WebSocket('ws://localhost:3000/median/BTCUSDT');
ws.onmessage = (msg) => console.log(JSON.parse(msg.data));

🧱 Directory Structure
File / Folder	Description
index.js	Application entry point
src/config/httpServer.js	Express server with WebSocket integration
src/routes/apiRoutes.js	API endpoints
src/services/medianManager.js	Handles active pairs and state tracking
src/services/priceStream.js	Binance WebSocket logic
src/lib/rollingMedian.js	Median logic (two heaps implementation)
src/lib/random.js	Random pair selection
tests/	Jest test suite
🧠 Notes

The StreamingMedian class keeps all observed prices (exact medians).
For production-scale data, consider approximation algorithms (like t-digest) or rolling windows.

Requires Node.js v18+ (uses built-in fetch).

Change default port using the PORT environment variable if needed.

🧪 Testing

Run unit tests using:
npm test

📈 Summary

This project showcases:

Real-time market data ingestion
Efficient streaming median computation
REST and WebSocket integration
Scalable event-driven architecture for crypto data systems
