'use strict';

import util from 'util';
import Base from '../structures/Base';

interface BucketOptions {
  latencyRef: {
    latency: number;
  };
  reservedTokens: number;
}

/**
 * Handle ratelimiting something
 * @prop {Number} interval How long (in ms) to wait between clearing used tokens
 * @prop {Number} lastReset Timestamp of last token clearing
 * @prop {Number} lastSend Timestamp of last token consumption
 * @prop {Number} tokenLimit The max number tokens the bucket can consume per interval
 * @prop {Number} tokens How many tokens the bucket has consumed in this interval
 */

/**
 * Handle ratelimiting something
 *
 * @export
 * @class Bucket
 */
export default class Bucket {
  /**
   * How long (in ms) to wait between clearing used tokens
   *
   * @type {number}
   * @memberof Bucket
   */
  interval: number;
  /**
   * Timestamp of last token clearing
   *
   * @type {number}
   * @memberof Bucket
   */
  lastReset: number = 0;
  /**
   * Timestamp of last token consumption
   *
   * @type {number}
   * @memberof Bucket
   */
  lastSend: number = 0;
  /**
   * The max number tokens the bucket can consume per interval
   *
   * @type {number}
   * @memberof Bucket
   */
  tokenLimit: number;
  /**
   * How many tokens the bucket has consumed in this interval
   *
   * @type {number}
   * @memberof Bucket
   */
  tokens: number = 0;
  /**
   * A latency reference object
   *
   * @type {{
   *     latency: number;
   *   }}
   * @memberof Bucket
   */
  latencyRef: {
    latency: number;
  };

  /**
   * How many tokens to reserve for priority operations
   *
   * @type {number}
   * @memberof Bucket
   */
  reservedTokens: number;
  private readonly _queue: Array<{ func: () => void; priority: boolean }>;
  private timeout: NodeJS.Timeout | null = null;

  constructor(tokenLimit: number, interval: number, options: Partial<BucketOptions> = {}) {
    this.tokenLimit = tokenLimit;
    this.interval = interval;
    this.latencyRef = options.latencyRef ?? { latency: 0 };
    this.lastReset = this.tokens = this.lastSend = 0;
    this.reservedTokens = options.reservedTokens ?? 0;
    this._queue = [];
  }

  /**
   * Occasionally check and clear the Bucket of tokens
   *
   * @return {*}  {void}
   * @memberof Bucket
   */
  check(): void {
    if (this.timeout ?? this._queue.length === 0) {
      return;
    }
    if (this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency < Date.now()) {
      this.lastReset = Date.now();
      this.tokens = Math.max(0, this.tokens - this.tokenLimit);
    }

    let val;
    let tokensAvailable = this.tokens < this.tokenLimit;
    let unreservedTokensAvailable = this.tokens < this.tokenLimit - this.reservedTokens;
    while (this._queue.length > 0 && (unreservedTokensAvailable || (tokensAvailable && this._queue[0].priority))) {
      this.tokens++;
      tokensAvailable = this.tokens < this.tokenLimit;
      unreservedTokensAvailable = this.tokens < this.tokenLimit - this.reservedTokens;
      const item = this._queue.shift();
      val = this.latencyRef.latency - Date.now() + this.lastSend;
      if (this.latencyRef.latency === 0 || val <= 0) {
        item?.func();
        this.lastSend = Date.now();
      } else {
        setTimeout(() => {
          item?.func();
        }, val);
        this.lastSend = Date.now() + val;
      }
    }

    if (this._queue.length > 0 && !this.timeout) {
      this.timeout = setTimeout(
        () => {
          this.timeout = null;
          this.check();
        },
        this.tokens < this.tokenLimit ? this.latencyRef.latency : Math.max(0, this.lastReset + this.interval + this.tokenLimit * this.latencyRef.latency - Date.now())
      );
    }
  }

  /**
   * Queue something in the Bucket
   *
   * @param {() => void} func
   * @param {boolean} [priority=false]
   * @memberof Bucket
   */
  queue(func: () => void, priority = false): void {
    if (priority) {
      this._queue.unshift({ func, priority });
    } else {
      this._queue.push({ func, priority });
    }
    this.check();
  }

  /* eslint-disable */
  [util.inspect.custom]() {
    return Base.prototype[util.inspect.custom].call(this);
  }
}
