jest.mock('../src/services/priceStream', () => ({
  launchPriceFeed: jest.fn(() => ({ stop: jest.fn() }))
}))

const { launchPriceFeed } = require('../src/services/priceStream')

describe('medianManager /pairs idempotence', () => {
  let fetchOrig
  beforeAll(() => {
    fetchOrig = global.fetch
  })
  afterAll(() => {
    global.fetch = fetchOrig
  })

  test('calling fetchPairs twice starts stream only once', async () => {
    // prepare a mocked fetch that returns many symbols
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(
      Array.from({ length: 20 }, (_, i) => ({ symbol: `SYM${i}` }))
    ) })

    const { fetchPairs } = require('../src/services/medianManager')

    // fake express req/res
    const res1 = { json: jest.fn() }
    const res2 = { json: jest.fn() }

    // first call should start the stream
    await fetchPairs({ query: {} }, res1)
    // second call without force should return existing selection and not start another stream
    await fetchPairs({ query: {} }, res2)

    expect(launchPriceFeed).toHaveBeenCalledTimes(1)
    expect(res1.json).toHaveBeenCalled()
    expect(res2.json).toHaveBeenCalled()
    // both responses should return selectedPairs key
    expect(res1.json.mock.calls[0][0]).toHaveProperty('trackedSymbols')
    expect(res2.json.mock.calls[0][0]).toHaveProperty('trackedSymbols')
  })
})
