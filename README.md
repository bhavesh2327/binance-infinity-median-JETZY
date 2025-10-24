# ⚡ Binance Infinity Median Service

This microservice connects to Binance to stream live trading data for multiple cryptocurrency pairs, continuously processing each incoming trade to calculate an Infinity Median.

The Infinity Median represents the true, running median of all observed trade prices for a given pair, providing a highly accurate measure of central tendency in real-time market conditions. By maintaining this dynamic median, the service enables traders, analysts, and developers to monitor price trends, detect anomalies, and power analytical dashboards or trading intelligence systems with reliable, up-to-the-moment data.

Its design ensures that the median updates instantly as new trades arrive, making it a powerful tool for anyone needing real-time insights, historical context, and precise statistical information on cryptocurrency markets.

---

## 🔍 Overview

This service:

- Connects to Binance and randomly selects 10 trading pairs.
- Tracks live price updates via WebSocket.
- Computes a continuously updated median for each pair using a **dual-heap (min-max heap)** structure, achieving **O(log n)** performance per update.

---

## 🧩 Core Capabilities

- **Random Pair Selection** – Picks 10 random trade pairs from Binance REST API.  
- **Live Data Stream** – Subscribes to Binance WebSocket feed for instant price updates.  
- **Efficient Median Tracking** – Maintains an ongoing median using a balanced heap algorithm.  

### REST API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /pairs` | Selects 10 pairs and starts streaming |
| `GET /prices` | Returns the latest price snapshot |
| `GET /medians` | Displays current median values for all tracked pairs |
| `GET /median/:pair` | Returns the median for a specific trading pair |

### WebSocket Support

- `ws://localhost:PORT/median/:pair` → Subscribe for live median updates.

**Performance-Oriented** – Optimized for high-frequency market streams.

---

## 🚀 Setup & Usage

### Step 1: Clone the Repository
```bash
git clone https://github.com/bhavesh2327/binance-infinity-median-JETZY.git
cd binance-infinity-median-JETZY

###Step 2 : Setup .env file
PORT=3000(Example).


### Install Dependencies
npm install

### Step 3: Start the Service
npm run dev
# or run directly
node index.js

### Step 4: Start Streaming
Invoke-RestMethod http://localhost:3000/pairs

### Step 5: View Results
Invoke-RestMethod http://localhost:3000/medians | ConvertTo-Json -Depth 4
Invoke-RestMethod http://localhost:3000/prices | ConvertTo-Json -Depth 4
Invoke-RestMethod http://localhost:3000/median/BTCUSDT

### 🌐 WebSocket Example (Browser Console)
const ws = new WebSocket('ws://localhost:3000/median/BTCUSDT');
ws.onmessage = (msg) => console.log(JSON.parse(msg.data));

### 🧱 Directory Structure
File / Folder	Description
index.js	: Application entry point
src/config/httpServer.js	: Express server setup with WebSocket integration
src/routes/apiRoutes.js : 	REST API routes
src/services/medianManager.js : 	Handles active trading pairs and median state
src/services/priceStream.js :	Binance WebSocket connection and streaming logic
src/lib/rollingMedian.js	: Two-heaps streaming median implementation
src/lib/random.js	L Random trading pair selection
tests/	: Jest test suite

