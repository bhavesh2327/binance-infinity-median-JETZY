const { StreamingMedian } = require('../lib/rollingMedian')
const { getRandomPairs } = require('../lib/random')
const { launchPriceFeed } = require('./priceStream')

let trackedSymbols = []
let latestQuotes = {}
let symbolMedians = {}
let clientSockets = {}

// streaming controller state
let isStreaming = false
let streamController = null

async function fetchPairs(req, res) {
  try {
    // if already streaming and caller didn't request a forced restart, return current selection
    if (isStreaming && (!req.query || req.query.force !== 'true')) {
      return res.json({ trackedSymbols })
    }
    const response = await fetch('https://api.binance.com/api/v3/ticker/price')
    const data = await response.json()
    const symbols = data.map(item => item.symbol)
    // pick 10 random symbols
    trackedSymbols = getRandomPairs(symbols, 10)

    // initialize state for each symbol
    trackedSymbols.forEach(sym => {
      symbolMedians[sym] = new StreamingMedian()
      clientSockets[sym] = new Set()
    })

    // if a previous stream exists and force was requested, stop it first
    if (streamController && typeof streamController.stop === 'function') {
      try { streamController.stop() } catch (e) { /* ignore */ }
      streamController = null
      isStreaming = false
    }

    // start a new price feed and keep controller for safe shutdown
    streamController = launchPriceFeed(trackedSymbols, latestQuotes, symbolMedians, clientSockets)
    if (streamController) isStreaming = true

    res.json({ trackedSymbols })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch pairs' })
  }
}

function stopStreaming() {
  if (streamController && typeof streamController.stop === 'function') {
    try { streamController.stop() } catch (e) { /* ignore */ }
    streamController = null
    isStreaming = false
  }
}

module.exports = { fetchPairs, latestQuotes, symbolMedians, clientSockets, stopStreaming }
