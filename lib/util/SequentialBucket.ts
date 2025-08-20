'use strict';

import util from 'util';
import Base from '../structures/Base';

/**
 * Ratelimit requests and release in sequence
 * TODO: add latencyref
 * @prop {Number} limit How many tokens the bucket can consume in the current interval
 * @prop {Boolean} processing Whether the queue is being processed
 * @prop {Number} remaining How many tokens the bucket has left in the current interval
 * @prop {Number} reset Timestamp of next reset
 */
export default class SequentialBucket {
  limit: number;
  remaining: number;
  reset = 0;
  processing: NodeJS.Timeout | boolean = false;
  latencyRef: { latency: number };
  _queue: Array<(arg: () => void) => any> = [];
  last?: number;

  /**
   * Construct a SequentialBucket
   * @arg {Number} limit The max number of tokens the bucket can consume per interval
   * @arg {Object} [latencyRef] An object
   * @arg {Number} latencyRef.latency Interval between consuming tokens
   */
  constructor(limit: number, latencyRef = { latency: 0 }) {
    this.limit = this.remaining = limit;
    this.latencyRef = latencyRef;
  }

  check(override?: boolean) {
    if (this._queue.length === 0) {
      if (typeof this.processing !== 'boolean') {
        clearTimeout(this.processing);
        this.processing = false;
      }
      return;
    }
    if (this.processing && !override) {
      return;
    }
    const now = Date.now();
    const offset = this.latencyRef.latency;
    if (!this.reset || this.reset < now - offset) {
      this.reset = now - offset;
      this.remaining = this.limit;
    }
    this.last = now;
    if (this.remaining <= 0) {
      this.processing = setTimeout(
        () => {
          this.processing = false;
          this.check(true);
        },
        Math.max(0, (this.reset || 0) - now + offset) + 1
      );
      return;
    }
    --this.remaining;
    this.processing = true;
    this._queue.shift()!(() => {
      if (this._queue.length > 0) {
        this.check(true);
      } else {
        this.processing = false;
      }
    });
  }

  /**
   * Queue something in the SequentialBucket
   * @arg {Function} func A function to call when a token can be consumed. The function will be passed a callback argument, which must be called to allow the bucket to continue to work
   */
  queue(func: (arg: () => void) => any, short?: boolean) {
    if (short) {
      this._queue.unshift(func);
    } else {
      this._queue.push(func);
    }
    this.check();
  }

  [util.inspect.custom]() {
    return Base.prototype[util.inspect.custom].call(this);
  }
}
