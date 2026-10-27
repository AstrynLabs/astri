import { sleep } from './util';

/**
 * One rate limit bucket. Requests in a bucket run one at a time, in the order they were queued, and wait out
 * the bucket's reset once its remaining count hits zero.
 */
export class Bucket {
    remaining = 1;
    /** Unix ms the bucket refills at. */
    resetAt = 0;

    #queue: Promise<unknown> = Promise.resolve();
    #pending = 0;

    /** No requests are queued and the bucket is not exhausted, so forgetting it loses nothing. */
    get idle(): boolean {
        return this.#pending === 0 && (this.remaining > 0 || Date.now() >= this.resetAt);
    }

    /** Runs `task` once every task queued before it has settled. */
    run<T>(task: () => Promise<T>): Promise<T> {
        this.#pending++;
        const result = this.#queue.then(async () => {
            try {
                return await task();
            } finally {
                this.#pending--;
            }
        });
        this.#queue = result.catch(() => undefined);
        return result;
    }

    /** Resolves once a request may be sent, taking one from the remaining count. */
    async acquire(): Promise<void> {
        const wait = this.resetAt - Date.now();
        if (this.remaining <= 0 && wait > 0) await sleep(wait);
        if (Date.now() >= this.resetAt) this.remaining = Math.max(this.remaining, 1);
        this.remaining--;
    }

    /** Applies a response's `X-RateLimit-*` headers. */
    update(headers: Headers): void {
        const remaining = headers.get('x-ratelimit-remaining');
        const resetAfter = headers.get('x-ratelimit-reset-after');
        if (remaining !== null) this.remaining = Number(remaining);
        if (resetAfter !== null) this.resetAt = Date.now() + Number(resetAfter) * 1000;
    }

    /** Blocks the bucket for `ms`, after a 429. */
    block(ms: number): void {
        this.remaining = 0;
        this.resetAt = Math.max(this.resetAt, Date.now() + ms);
    }
}
