// Consolidated test file combining rollingMedian, random, helpers, heaps, and medianManager tests

jest.mock('../src/services/priceStream', () => ({
  launchPriceFeed: jest.fn(() => ({ stop: jest.fn() }))
}))

const { launchPriceFeed } = require('../src/services/priceStream')

describe('RollingMedian', () => {
  const { StreamingMedian } = require('../src/lib/rollingMedian')

  test('returns null median when empty', () => {
    const rm = new StreamingMedian()
    expect(rm.getMedian()).toBeNull()
  })

  test('single value median', () => {
    const rm = new StreamingMedian()
    rm.add(10)
    expect(rm.getMedian()).toBe(10)
  })

  test('even count median is average', () => {
    const rm = new StreamingMedian()
    rm.add(10)
    rm.add(20)
    expect(rm.getMedian()).toBe((10 + 20) / 2)
  })

  test('odd count median uses middle value', () => {
    const rm = new StreamingMedian()
    rm.add(5)
    rm.add(15)
    rm.add(10)
    expect(rm.getMedian()).toBe(10)
  })
})

describe('getRandomPairs', () => {
  const { getRandomPairs } = require('../src/lib/random')

  test('returns requested count and does not mutate input', () => {
    const original = ['A', 'B', 'C', 'D', 'E']
    const copy = original.slice()
    const res = getRandomPairs(original, 3)
    expect(res).toHaveLength(3)
    expect(original).toEqual(copy)
  })

  test('returns fewer items if count > list length', () => {
    const list = ['X', 'Y']
    const res = getRandomPairs(list, 10)
    expect(res.length).toBeLessThanOrEqual(2)
  })
})

describe('legacy __tests__ suites (helpers/heaps)', () => {
  const { getRandomPairs } = require('../src/lib/random')
  const { StreamingMedian } = require('../src/lib/rollingMedian')

  test('helpers.test.js compatibility', () => {
    const original = ['A', 'B', 'C']
    const res = getRandomPairs(original, 2)
    expect(res.length).toBe(2)
  })

  test('heaps.test.js compatibility', () => {
    const rm = new StreamingMedian()
    rm.add(1); rm.add(2); rm.add(3)
    expect(rm.getMedian()).toBe(2)
  })
})

describe('medianManager /pairs idempotence', () => {
  let fetchOrig
  beforeAll(() => {
    fetchOrig = global.fetch
  })
  afterAll(() => {
    global.fetch = fetchOrig
  })

  test('calling fetchPairs twice starts stream only once', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(
      Array.from({ length: 20 }, (_, i) => ({ symbol: `SYM${i}` }))
    ) })

  const { fetchPairs } = require('../src/services/medianManager')

    const res1 = { json: jest.fn() }
    const res2 = { json: jest.fn() }

    await fetchPairs({ query: {} }, res1)
    await fetchPairs({ query: {} }, res2)

    expect(launchPriceFeed).toHaveBeenCalledTimes(1)
    expect(res1.json).toHaveBeenCalled()
    expect(res2.json).toHaveBeenCalled()
    expect(res1.json.mock.calls[0][0]).toHaveProperty('trackedSymbols')
    expect(res2.json.mock.calls[0][0]).toHaveProperty('trackedSymbols')
  })
})
