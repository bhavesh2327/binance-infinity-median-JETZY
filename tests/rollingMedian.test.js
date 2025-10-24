const { StreamingMedian } = require('../src/lib/rollingMedian')

describe('StreamingMedian', () => {
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
