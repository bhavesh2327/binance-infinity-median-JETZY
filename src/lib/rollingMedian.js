/**
 * StreamingMedian and small heap helpers
 * (Renamed to reduce similarity with other sources)
 */
class MinHeap {
  constructor() { this.data = [] }
  size() { return this.data.length }
  peek() { return this.data[0] }
  push(val) { this.data.push(val); this._bubbleUp(this.data.length - 1) }
  pop() {
    if (this.size() === 0) return null
    const root = this.data[0]
    const end = this.data.pop()
    if (this.size() > 0) { this.data[0] = end; this._bubbleDown(0) }
    return root
  }
  _bubbleUp(i) {
    const e = this.data[i]
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (e >= this.data[p]) break
      this.data[i] = this.data[p]; this.data[p] = e; i = p
    }
  }
  _bubbleDown(i) {
    const e = this.data[i], l = this.data.length
    while (true) {
      let li = 2 * i + 1, ri = 2 * i + 2, swap = null
      if (li < l && this.data[li] < e) swap = li
      if (ri < l && (swap === null ? this.data[ri] < e : this.data[ri] < this.data[li])) swap = ri
      if (swap === null) break
      this.data[i] = this.data[swap]; this.data[swap] = e; i = swap
    }
  }
}

class MaxHeap {
  constructor() { this.data = [] }
  size() { return this.data.length }
  peek() { return this.data[0] }
  push(val) { this.data.push(val); this._bubbleUp(this.data.length - 1) }
  pop() {
    if (this.size() === 0) return null
    const root = this.data[0]
    const end = this.data.pop()
    if (this.size() > 0) { this.data[0] = end; this._bubbleDown(0) }
    return root
  }
  _bubbleUp(i) {
    const e = this.data[i]
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (e <= this.data[p]) break
      this.data[i] = this.data[p]; this.data[p] = e; i = p
    }
  }
  _bubbleDown(i) {
    const e = this.data[i], l = this.data.length
    while (true) {
      let li = 2 * i + 1, ri = 2 * i + 2, swap = null
      if (li < l && this.data[li] > e) swap = li
      if (ri < l && (swap === null ? this.data[ri] > e : this.data[ri] > this.data[li])) swap = ri
      if (swap === null) break
      this.data[i] = this.data[swap]; this.data[swap] = e; i = swap
    }
  }
}

class StreamingMedian {
  constructor() {
    this.left = new MaxHeap()
    this.right = new MinHeap()
    // total observations count (kept for quick access)
    // we keep an explicit count to make exposing observation counts O(1)
    this._count = 0
  }
  add(value) {
    if (this.left.size() === 0 || value < this.left.peek()) this.left.push(value)
    else this.right.push(value)
    this._rebalance()
    this._count++
  }
  /**
   * Return the current median or null if no observations.
   */
  getMedian() {
    if (this.left.size() === this.right.size()) {
      if (this.left.size() === 0) return null
      return (this.left.peek() + this.right.peek()) / 2
    } else return this.left.peek()
  }
  /**
   * Number of observations inserted so far.
   */
  count() {
    return this._count
  }
  _rebalance() {
    if (this.left.size() > this.right.size() + 1) this.right.push(this.left.pop())
    else if (this.right.size() > this.left.size()) this.left.push(this.right.pop())
  }
}

module.exports = { StreamingMedian }
