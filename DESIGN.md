# DESIGN — Binance Infinity Median

Last updated: 2025-10-24

This document explains the goals of the project, the original assignment requirements, the current implementation, design decisions, key data structures, testing and verification, run instructions, and recommended next steps.

## Project overview

Goal: select a small set of trade pairs from Binance, stream live trades for each pair, and maintain an exact "infinity median" (median over all observations seen so far) for each pair. Expose the medians via REST and WebSocket interfaces with efficient update performance.

Primary functional requirements (assignment):
- Select 10 random trade pairs from Binance API and expose an endpoint to trigger selection.
- Continuously fetch live trade prices for selected pairs.
- Maintain an exact (no-approximation) median per pair; each new price should be processed in O(log n) time.
- Expose REST endpoints and a WebSocket endpoint to obtain medians (/median/:pair for REST and WS).

Non-functional expectations:
- Unit tests to validate core logic.
- The stream should be resilient — avoid hot reconnect loops and support safe restarts.

## What was supposed to be vs what is done

Planned (assignment):
- Randomly choose 10 trading pairs.
- Subscribe to Binance trade streams for chosen pairs and maintain medians.
- Provide REST + WS access to medians and counts.
- Provide tests and documentation.

Completed (this repo):
- Random selection: `src/lib/random.js` implements an unbiased Fisher–Yates based selection used by `src/services/medianManager.js`.
- Streaming: `src/services/priceStream.js` (export `launchPriceFeed`) opens Binance trade streams, parses trades, updates state and returns a controller object allowing stop/restart.
- Median: `src/lib/rollingMedian.js` implements `StreamingMedian` (two heaps) with `add()`, `getMedian()` and `count()` methods. Complexity: O(log n) per insert, O(1) read.
- Endpoints: `src/routes/apiRoutes.js` exposes `/pairs`, `/prices`, `/medians`, `/median/:pair` . A WebSocket upgrade path is implemented in `src/config/httpServer.js` to serve `/median/:pair` WS subscriptions.
- Robustness: stream start is idempotent (safe against multiple `/pairs` calls), the price feed uses exponential backoff with jitter and a retry cap to prevent hot reconnect loops.
- Tests: Jest unit tests consolidated under `tests/`; all unit tests pass locally (28/28).
- CI: a GitHub Actions workflow `.github/workflows/ci.yml` was added to run tests on push/PR to `main`.

## High-level architecture

- `index.js` — application entrypoint (starts HTTP server).
- `src/config/httpServer.js` — creates Express app, sets up routes and WebSocket upgrade handling.
- `src/routes/apiRoutes.js` — REST handlers for pair selection, prices, medians.
- `src/services/medianManager.js` — orchestrates pair selection, maintains `trackedSymbols`, `latestQuotes`, `symbolMedians` (map of `StreamingMedian`), and `clientSockets` (WebSocket clients map). Exposes `fetchPairs()` and `stopStreaming()`.
- `src/services/priceStream.js` — implements `launchPriceFeed(symbols, latestQuotes, symbolMedians, clientSockets, options)` and returns `{ ws, stop }` controller; includes backoff+jitter logic.
- `src/lib/rollingMedian.js` — `StreamingMedian` (two heaps) implementation.
- `src/lib/random.js` — unbiased sampling function `getRandomPairs(list, count)`.

Data flows:
1. Client calls `GET /pairs` → `medianManager.fetchPairs()` fetches available pairs from Binance REST, selects N (default 10) via `getRandomPairs`, initializes medians and launches `launchPriceFeed`.
2. `launchPriceFeed` connects to Binance stream(s), receives trade messages, updates `latestQuotes` and calls `symbolMedians[symbol].add(price)`.
3. REST `GET /medians` or `GET /median/:pair` reads `symbolMedians[symbol].getMedian()` and `count()` to respond.
4. WebSocket clients can subscribe to `/median/:pair` to receive real-time updates pushed when medians change.

## Key data structure: StreamingMedian

- Implemented as two heaps (max-heap for lower half, min-heap for upper half). Each `add()` rebalances heaps so that the median is available in O(1).
- Methods:
  - `add(value)` — insert new observation in O(log n).
  - `getMedian()` — return current median (number or null).
  - `count()` — returns number of observations.
- Trade-offs: exact median implies memory grows linearly with observations. For long-running real deployments, consider:
  - time-based windows (e.g., last 24h), or
  - approximate summaries (t-digest) to bound memory while keeping good accuracy.

## Streaming resilience

- Reconnect strategy: exponential backoff with jitter (configurable) and retry cap to prevent aggressive reconnect loops. This reduces load on upstream and avoids leaking resources locally.
- Stream lifecycle: `medianManager` tracks the `streamController` returned by `launchPriceFeed`, `fetchPairs()` is idempotent by default (won't re-launch an existing stream) and supports `?force=true` to restart.

## Testing and verification

- Unit tests: Jest tests in `tests/` cover `StreamingMedian`, `getRandomPairs`, helpers, and `medianManager` idempotence. Run locally:

```bash
npm ci
npm test
```

- Test results (local): 8 test suites, 28 tests — all passing.

## How to run locally

1. Install dependencies:

```powershell
npm ci
```

2. Run tests:

```powershell
npm test
```

3. Run service (dev):

```powershell
npm run dev
```

4. Configuration: environment variables can be loaded from `.env`; default server port is `PORT` (default 3000 in code; the dev environment uses 3005 in one run — check `index.js` for your configured value).

## API summary

- `GET /pairs` — trigger selection of random pairs (query `?force=true` to restart). Returns `{ trackedSymbols: [...] }`.
- `GET /prices` — current `latestQuotes` map.
- `GET /medians` — medians + counts for all tracked symbols.
- `GET /median/:pair` — median and count for a single pair.
- WebSocket: upgrade to `/median/:pair` to receive live median updates for that pair.

See `src/routes/apiRoutes.js` and `src/config/httpServer.js` for implementation details.

## Appendix: verification checklist

- [x] Unit tests pass locally
- [x] `/pairs` idempotent and `?force=true` works
- [x] `StreamingMedian` supports `count()` and `getMedian()`
- [x] Backoff + jitter implemented in `launchPriceFeed`
- [x] CI workflow added at `.github/workflows/ci.yml`
