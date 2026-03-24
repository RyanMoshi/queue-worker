'use strict';
// In-process background job queue with concurrency and retry support

class QueueWorker {
  constructor(options) {
    options = options || {};
    this.concurrency = options.concurrency || 3;
    this.maxRetries = options.maxRetries || 2;
    this._queue = [];
    this._active = 0;
    this._results = [];
    this._processor = null;
  }

  process(fn) {
    if (typeof fn !== 'function') throw new TypeError('Processor must be a function');
    this._processor = fn;
    return this;
  }

  enqueue(job) {
    if (!this._processor) throw new Error('No processor registered — call .process(fn) first');
    this._queue.push({ job, retries: 0 });
    this._tick();
    return this;
  }

  _tick() {
    while (this._active < this.concurrency && this._queue.length > 0) {
      const item = this._queue.shift();
      this._active++;
      this._run(item);
    }
  }

  async _run(item) {
    try {
      const result = await this._processor(item.job);
      this._results.push({ job: item.job, ok: true, result });
    } catch (err) {
      if (item.retries < this.maxRetries) {
        item.retries++;
        this._queue.unshift(item);
      } else {
        this._results.push({ job: item.job, ok: false, error: err.message });
      }
    } finally {
      this._active--;
      this._tick();
    }
  }

  pending() { return this._queue.length; }
  active()  { return this._active; }

  drain() {
    return new Promise((resolve) => {
      const check = () => {
        if (this._active === 0 && this._queue.length === 0) resolve(this._results);
        else setTimeout(check, 50);
      };
      check();
    });
  }

  reset() { this._queue = []; this._results = []; return this; }
}

module.exports = QueueWorker;
