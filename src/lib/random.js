function getRandomPairs(list, count = 10) {
  // Make a shallow copy so the original list isn't mutated
  const arr = list.slice()
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}

module.exports = { getRandomPairs }
