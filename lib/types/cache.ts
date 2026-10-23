export type Predicate<K, V, C> = (value: V, key: K, collection: C) => boolean;

/**
 * - `fifo`: evicts the oldest inserted entry. Reads are free.
 * - `lru`: evicts the least recently read or written entry. Each `get` re-links the entry, so it costs a little more.
 */
export type EvictionPolicy = 'fifo' | 'lru';

/** Why the cache dropped an entry on its own. Explicit `delete` / `clear` calls never report. */
export type EvictionReason = 'size' | 'ttl' | 'sweep';

export interface CacheOptions<K, V> {
    /** Maximum number of entries. `0` disables the cache entirely (writes are ignored). Default: `Infinity`. */
    maxSize?: number;
    /** Which entry to drop when `maxSize` is exceeded. Default: `'fifo'`. */
    policy?: EvictionPolicy;
    /**
     * Milliseconds an entry may live after its last write (and, under `lru`, its last read).
     * Expired entries are dropped lazily on `get` / `has` and in bulk by `prune()`. Default: `0` (never expire).
     */
    ttl?: number;
    /** Extra condition checked by `prune()`; matching entries are dropped. Useful for age-based sweeps. */
    sweepFilter?: (value: V, key: K) => boolean;
    /** Entries matching this are never evicted or expired (e.g. the client's own member). */
    keep?: (value: V, key: K) => boolean;
    /** Called whenever the cache drops an entry on its own. */
    onEvict?: (value: V, key: K, reason: EvictionReason) => void;
}

/**
 * How to cache one kind of object:
 * - `false` / `0`: disabled
 * - `true`: unbounded, never expires
 * - a number: `maxSize`
 * - an object: full {@link CacheOptions}
 */
export type CacheConfig<V> = boolean | number | CacheOptions<string, V>;

export interface CacheManagerOptions<T extends object> {
    /** Config for each kind. Kinds left out use `default`. */
    caches?: { [Kind in keyof T]?: CacheConfig<T[Kind]> };
    /** Config for kinds missing from `caches`. Default: `true` (unbounded). */
    default?: CacheConfig<unknown>;
    /** How often, in ms, to prune caches that have a `ttl` or `sweepFilter`. `0` disables the timer. Default: 60 000. */
    sweepInterval?: number;
}
