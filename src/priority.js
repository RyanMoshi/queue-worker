'use strict';

class MinHeap {
  constructor() { this._h = []; }
  push(item) {
    this._h.push(item);
    let i = this._h.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this._h[parent].priority <= this._h[i].priority) break;
      [this._h[parent], this._h[i]] = [this._h[i], this._h[parent]];
      i = parent;
    }
  }
  pop() {
    if (this._h.length === 0) return undefined;
    const top = this._h[0];
    const last = this._h.pop();
    if (this._h.length > 0) {
      this._h[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < this._h.length && this._h[l].priority < this._h[smallest].priority) smallest = l;
        if (r < this._h.length && this._h[r].priority < this._h[smallest].priority) smallest = r;
        if (smallest === i) break;
        [this._h[i], this._h[smallest]] = [this._h[smallest], this._h[i]];
        i = smallest;
      }
    }
    return top;
  }
  get size() { return this._h.length; }
}

module.exports = MinHeap;
