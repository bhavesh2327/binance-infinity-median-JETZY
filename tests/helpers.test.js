// kept for compatibility but consolidated tests now run from tests/all.test.js
const { getRandomPairs } = require('../src/lib/random') 

describe('getRandomPairs', () => {
  test('returns requested count and does not mutate input', () => {
    const original = ['A', 'B', 'C', 'D', 'E']
    const copy = original.slice()
    const res = getRandomPairs(original, 3)
    expect(res).toHaveLength(3)
    // original should remain unchanged
    expect(original).toEqual(copy)
  })

  test('returns fewer items if count > list length', () => {
    const list = ['X', 'Y']
    const res = getRandomPairs(list, 10)
    expect(res.length).toBeLessThanOrEqual(2)
  })
})
