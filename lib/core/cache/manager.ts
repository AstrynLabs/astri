import type { CacheConfig, CacheManagerOptions, CacheOptions } from '../../types';
import { Cache } from './cache';

/**
 * Builds every cache the library uses from one config, and prunes all of them from a single timer.
 *
 * `T` maps each cache kind to the value it holds, e.g. `CacheManager<{ guilds: Guild; messages: Message }>`.
 * Per-parent caches (a channel's messages, a guild's members) are made by calling `create` once per parent;
 * the manager only holds them weakly, so dropping the parent frees its cache.
 */
export class CacheManager<T extends object> {
    readonly sweepInterval: number;
    readonly #configs: Map<keyof T, CacheOptions<string, any>>;
    readonly #default: CacheOptions<string, any>;
    readonly #prunable = new Set<WeakRef<Cache<string, any>>>();
    #timer: ReturnType<typeof setInterval> | null = null;

    constructor(options: CacheManagerOptions<T> = {}) {
        this.sweepInterval = options.sweepInterval ?? 60_000;
        this.#default = normalize(options.default ?? true);
        this.#configs = new Map();
        for (const kind in options.caches) {
            const config = options.caches[kind];
            if (config !== undefined) this.#configs.set(kind, normalize(config));
        }
    }

    /** The resolved options `create(kind)` would use. */
    optionsFor<Kind extends keyof T>(kind: Kind): CacheOptions<string, T[Kind]> {
        return this.#configs.get(kind) ?? this.#default;
    }

    /** Whether `kind` is cached at all. Lets callers skip building objects that would be thrown away. */
    isEnabled(kind: keyof T): boolean {
        return this.optionsFor(kind).maxSize !== 0;
    }

    /** A new, empty cache configured for `kind`. */
    create<Kind extends keyof T>(kind: Kind): Cache<string, T[Kind]> {
        const cache = new Cache<string, T[Kind]>(this.optionsFor(kind));
        if (cache.prunable) {
            this.#prunable.add(new WeakRef(cache));
            if (this.#timer === null && this.sweepInterval > 0) {
                this.#timer = setInterval(() => this.prune(), this.sweepInterval);
                this.#timer.unref?.();
            }
        }
        return cache;
    }

    /** Prunes every live cache now. Returns the total number of entries removed. */
    prune(now: number = Date.now()): number {
        let removed = 0;
        for (const ref of this.#prunable) {
            const cache = ref.deref();
            if (cache === undefined) this.#prunable.delete(ref);
            else removed += cache.prune(now);
        }
        return removed;
    }

    /** Stops the sweep timer and forgets every cache it was tracking. The caches themselves keep working. */
    destroy(): void {
        if (this.#timer !== null) clearInterval(this.#timer);
        this.#timer = null;
        this.#prunable.clear();
    }
}

function normalize<V>(config: CacheConfig<V>): CacheOptions<string, V> {
    if (typeof config === 'boolean') return { maxSize: config ? Infinity : 0 };
    if (typeof config === 'number') return { maxSize: config };
    return config;
}
