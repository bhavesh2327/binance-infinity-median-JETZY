const WebSocket = require('ws')

function launchPriceFeed(symbols, latestQuotes, symbolMedians, clientSockets, options = {}) {
  if (!symbols || symbols.length === 0) return null

  const reconnect = options.reconnect !== undefined ? options.reconnect : true
  const baseDelay = options.baseDelay || 1000 // ms
  const maxDelay = options.maxDelay || 30000 // ms
  const multiplier = options.multiplier || 1.6
  const maxRetries = (options.maxRetries === undefined) ? 10 : options.maxRetries
  let closedByUser = false
  let attempts = 0

  const streams = symbols.map(p => p.toLowerCase() + '@trade').join('/')

  function createSocket() {
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

    ws.on('open', () => {
      attempts = 0 // reset attempts on successful open
      console.log('Connected to Binance WebSocket for symbols:', symbols)
    })

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg)
        const symbol = data?.data?.s
        const priceRaw = data?.data?.p
        if (!symbol || !priceRaw) return
        const price = parseFloat(priceRaw)

        latestQuotes[symbol] = price
        if (symbolMedians[symbol]) symbolMedians[symbol].add(price)

        const median = symbolMedians[symbol]?.getMedian()
        console.log(`Price update - ${symbol}: ${price}, Median: ${median}`)

        const clients = clientSockets[symbol]
        if (clients) {
          for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ pair: symbol, median }))
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err)
      }
    })

    ws.on('error', (err) => console.error('WebSocket error:', err))

    ws.on('close', () => {
      console.log('WebSocket closed.')
      if (closedByUser || !reconnect) return

      attempts += 1
      if (maxRetries !== Infinity && attempts > maxRetries) {
        console.error(`Max reconnect attempts (${maxRetries}) reached. Giving up.`)
        return
      }

      // exponential backoff with jitter
      const rawDelay = Math.min(maxDelay, baseDelay * Math.pow(multiplier, attempts - 1))
      const jitter = 0.5 + Math.random() // [0.5, 1.5)
      const delay = Math.floor(rawDelay * jitter)
      console.log(`Reconnecting in ${delay}ms (attempt ${attempts})`)
      setTimeout(() => {
        if (!closedByUser) createSocket()
      }, delay)
    })

    return ws
  }

  const ws = createSocket()

  // return a controller so callers can stop the stream cleanly
  return {
    ws,
    stop: () => {
      closedByUser = true
      try { ws.close() } catch (e) { /* ignore */ }
    }
  }
}

module.exports = { launchPriceFeed }
