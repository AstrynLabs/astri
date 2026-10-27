import type { CacheOptions, EvictionPolicy, EvictionReason } from '../../types';
import { Collection } from './collection';

/**
 * A bounded, optionally expiring Collection.
 *
 * Both eviction and expiry are amortized O(1): the backing Map's insertion order doubles as the eviction
 * queue, and a parallel deadline Map (only allocated when `ttl` is set) stays sorted because every
 * refresh re-appends its key.
 *
 * Iterating the cache does not count as a read and does not hide entries that expired but have not been
 * pruned yet.
 */
export class Cache<K, V> extends Collection<K, V> {
    readonly maxSize: number;
    readonly policy: EvictionPolicy;
    readonly ttl: number;
    readonly sweepFilter: ((value: V, key: K) => boolean) | undefined;
    readonly keep: ((value: V, key: K) => boolean) | undefined;
    readonly onEvict: ((value: V, key: K, reason: EvictionReason) => void) | undefined;

    readonly #deadlines: Map<K, number> | null;
    #cursor: MapIterator<[K, V]> | null = null;

    constructor(options: CacheOptions<K, V> = {}) {
        super();
        const { maxSize = Infinity, policy = 'fifo', ttl = 0 } = options;
        if (!(maxSize === Infinity || (Number.isInteger(maxSize) && maxSize >= 0))) {
            throw new RangeError(`Cache maxSize must be a non-negative integer or Infinity, received ${maxSize}`);
        }
        if (!(Number.isFinite(ttl) && ttl >= 0)) {
            throw new RangeError(`Cache ttl must be a non-negative finite number, received ${ttl}`);
        }
        this.maxSize = maxSize;
        this.policy = policy;
        this.ttl = ttl;
        this.sweepFilter = options.sweepFilter;
        this.keep = options.keep;
        this.onEvict = options.onEvict;
        this.#deadlines = ttl > 0 ? new Map() : null;
    }

    /** `false` when `maxSize` is 0 and every write is discarded. */
    get enabled(): boolean {
        return this.maxSize > 0;
    }

    /** Whether `prune()` has anything to do. */
    get prunable(): boolean {
        return this.#deadlines !== null || this.sweepFilter !== undefined;
    }

    override get(key: K): V | undefined {
        const value = super.get(key);
        if (value === undefined) return undefined;
        if (this.#deadlines !== null && this.#expireIfStale(key, value, Date.now())) return undefined;
        if (this.policy === 'lru') this.#touch(key, value);
        return value;
    }

    /** Reads an entry without counting it as an access. Expired entries are still dropped. */
    peek(key: K): V | undefined {
        const value = super.get(key);
        if (value === undefined) return undefined;
        if (this.#deadlines !== null && this.#expireIfStale(key, value, Date.now())) return undefined;
        return value;
    }

    override has(key: K): boolean {
        if (this.#deadlines === null) return super.has(key);
        const value = super.get(key);
        if (value === undefined) return super.has(key);
        return !this.#expireIfStale(key, value, Date.now());
    }

    override set(key: K, value: V): this {
        if (this.maxSize === 0) return this;
        if (this.policy === 'lru') super.delete(key);
        super.set(key, value);
        if (this.#deadlines !== null) this.#refreshDeadline(key, Date.now());
        if (super.size > this.maxSize) this.#evictOverflow();
        return this;
    }

    override delete(key: K): boolean {
        this.#deadlines?.delete(key);
        return super.delete(key);
    }

    override clear(): void {
        this.#cursor = null;
        this.#deadlines?.clear();
        super.clear();
    }

    /**
     * Drops every expired entry, then every entry matching `sweepFilter`. Returns how many were removed.
     * Expiry only walks the expired prefix of the deadline queue; `sweepFilter` walks the whole cache.
     */
    prune(now: number = Date.now()): number {
        let removed = 0;
        const deadlines = this.#deadlines;
        if (deadlines !== null) {
            let budget = deadlines.size;
            for (const [key, deadline] of deadlines) {
                if (deadline > now || budget-- === 0) break;
                const value = super.get(key) as V;
                if (this.keep?.(value, key)) {
                    this.#refreshDeadline(key, now);
                    continue;
                }
                this.#evict(key, value, 'ttl');
                removed++;
            }
        }
        const filter = this.sweepFilter;
        if (filter !== undefined) {
            for (const [key, value] of super.entries()) {
                if (filter(value, key) && !this.keep?.(value, key)) {
                    this.#evict(key, value, 'sweep');
                    removed++;
                }
            }
        }
        return removed;
    }

    #touch(key: K, value: V): void {
        super.delete(key);
        super.set(key, value);
        if (this.#deadlines !== null) this.#refreshDeadline(key, Date.now());
    }

    #refreshDeadline(key: K, now: number): void {
        const deadlines = this.#deadlines!;
        deadlines.delete(key);
        deadlines.set(key, now + this.ttl);
    }

    #expireIfStale(key: K, value: V, now: number): boolean {
        const deadline = this.#deadlines!.get(key);
        if (deadline === undefined || deadline > now) return false;
        if (this.keep?.(value, key)) {
            this.#refreshDeadline(key, now);
            return false;
        }
        this.#evict(key, value, 'ttl');
        return true;
    }

    #evictOverflow(): void {
        let excess = super.size - this.maxSize;
        let budget = super.size;
        while (excess > 0 && budget-- > 0) {
            let step = this.#cursor?.next();
            if (step === undefined || step.done) {
                this.#cursor = super.entries();
                step = this.#cursor.next();
                if (step.done) return;
            }
            const [key, value] = step.value;
            if (this.keep?.(value, key)) {
                super.delete(key);
                super.set(key, value);
                continue;
            }
            this.#evict(key, value, 'size');
            excess--;
        }
    }

    #evict(key: K, value: V, reason: EvictionReason): void {
        super.delete(key);
        this.#deadlines?.delete(key);
        this.onEvict?.(value, key, reason);
    }
}
