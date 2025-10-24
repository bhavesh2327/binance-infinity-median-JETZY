const express = require('express')
const router = express.Router()
const { fetchPairs, latestQuotes, symbolMedians } = require('../services/medianManager')

// get pairs
router.get('/pairs', async (req, res) => {
  try {
    await fetchPairs(req, res)
  } catch (err) {
    console.error('[API] Error in /pairs:', err.message)
    res.status(500).json({ error: 'Failed to fetch trade pairs' })
  }
})

// get prices
router.get('/prices', (req, res) => {
  try {
    res.json(latestQuotes)
  } catch (err) {
    console.error('[API] Error in /prices:', err.message)
    res.status(500).json({ error: 'Failed to fetch latest prices' })
  }
})

// get medians
router.get('/medians', (req, res) => {
  try {
    const result = {}
    for (const pair in symbolMedians) {
        const m = symbolMedians[pair]
        result[pair] = {
          median: m ? m.getMedian() : null,
          count: m && typeof m.count === 'function' ? m.count() : null
        }
      }
    res.json(result)
  } catch (err) {
    console.error('[API] Error in /medians:', err.message)
    res.status(500).json({ error: 'Failed to fetch medians' })
  }
})

// get median pair
router.get('/median/:pair', (req, res) => {
  try {
    const { pair } = req.params
    if (!symbolMedians[pair]) {
      return res.status(404).json({ error: `Pair ${pair} not tracked` })
    }
    const m = symbolMedians[pair]
    res.json({ pair, median: m.getMedian(), count: typeof m.count === 'function' ? m.count() : null })
  } catch (err) {
    console.error(`[API] Error in /median/${req.params.pair}:`, err.message)
    res.status(500).json({ error: 'Failed to fetch median for this pair' })
  }
})

// simple health endpoint
router.get('/health', (req, res) => {
  try {
    res.json({ status: 'ok', trackedPairs: Object.keys(pairMedians).length })
  } catch (err) {
    console.error('[API] Error in /health:', err.message)
    res.status(500).json({ error: 'Failed health check' })
  }
})

// root 
router.get('/', (req, res) => {
  try {
    res.send('Hello World!')
  } catch (err) {
    console.error('[API] Error in /:', err.message)
    res.status(500).json({ error: 'Unexpected server error' })
  }
})

module.exports = router
