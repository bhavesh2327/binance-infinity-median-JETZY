### License
Add a license of your choice (e.g., MIT) in `LICENSE`.
# Binance Infinity Median Service

A lightweight **Node.js + Express** service that streams real-time Binance trade data and calculates a continuous **Infinity Median** for selected trading pairs.

The **Infinity Median** represents the median price derived from **all received trade prices** for a given pair (not just a limited window).  
This makes it suitable for **real-time analytics, trading insights, and data-driven backends**.

---

## ✨ Features

- **Fetch Random Trade Pairs** → Selects 10 random trade pairs from Binance REST API.
- **Live Price Streaming** → Subscribes to Binance WebSocket stream for continuous price updates.
- **Infinity Median Calculation** → Maintains a running median per pair using a dual-heap approach (**O(log n)** per update).
- **REST APIs**
  - `GET /pairs` → Fetch random pairs & start streaming.
  - `GET /prices` → Latest price snapshot of tracked pairs.
  - `GET /medians` → Current median values for all pairs.
  - `GET /median/:pair` → Current median of a specific pair.
- **WebSocket Support**
  - Subscribe to `/median/:pair` → Get **live median updates** for that pair.
- **Scalable & Efficient** → Designed to handle high-frequency real-time trade streams.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/bhavesh2327/binance-infinity-median.git
cd binance-infinity-median
## binance-infinity-median

Small Node.js service that selects 10 random Binance trade pairs, streams live trade prices, and maintains an "infinity median" (the median of all observed prices for each pair).

### Quick summary
- Fetch 10 random trade pairs from Binance REST.
- Subscribe to Binance combined WebSocket stream for those pairs.
- Maintain an exact, historical median per pair using a two-heap approach (O(log n) per update).
- Expose REST and WebSocket interfaces to read medians and latest prices.

### Quick start (Windows PowerShell)
1. Install dependencies:

```powershell
npm install
```

2. Start in dev mode:

```powershell
npm run dev
# or run directly:
node index.js
```

3. Trigger pair selection (this starts the Binance stream):

```powershell
Invoke-RestMethod http://localhost:3000/pairs
```

4. Inspect medians / prices:

```powershell
Invoke-RestMethod http://localhost:3000/medians | ConvertTo-Json -Depth 4
Invoke-RestMethod http://localhost:3000/prices | ConvertTo-Json -Depth 4
Invoke-RestMethod http://localhost:3000/median/BTCUSDT
```

### API Endpoints
- `GET /pairs` — select 10 random pairs and start streaming
- `GET /prices` — returns latest prices map
- `GET /medians` — returns current median per tracked pair (null if no data yet)
- `GET /median/:pair` — returns median for a single pair

WebSocket:
- `ws://localhost:PORT/median/:pair` — subscribe to median updates for `:pair`.

Example WebSocket client (browser console):

```javascript
const ws = new WebSocket('ws://localhost:3000/median/BTCUSDT')
ws.onmessage = (m) => console.log(JSON.parse(m.data))
```

### Project layout
- `index.js` — entry point
- `src/config/httpServer.js` — Express + WebSocket upgrade handling
- `src/routes/apiRoutes.js` — REST routes
- `src/services/medianManager.js` — pair selection and state
- `src/services/priceStream.js` — Binance WebSocket handling
- `src/lib/rollingMedian.js` — StreamingMedian implementation (two heaps)
- `src/lib/random.js` — getRandomPairs (Fisher–Yates)
- `tests/` — Jest unit tests

### Notes & caveats
- `StreamingMedian` stores every observation (exact median). Memory grows linearly with observations. For long-running deployments consider approximate summaries (t-digest) or retention strategies.
- Ensure Node 18+ (global `fetch` is used).
- If port conflicts occur, free the port or set `PORT` environment variable.

### Tests
Run unit tests with:

```powershell
npm test
```
