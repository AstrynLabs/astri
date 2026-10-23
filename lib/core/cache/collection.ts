import type { Predicate } from '../../types';

/**
 * A `Map` with array-style helpers. Helpers iterate in insertion order and never allocate intermediate arrays.
 */
export class Collection<K, V> extends Map<K, V> {
    /** The first value in iteration order. */
    first(): V | undefined {
        return this.values().next().value;
    }

    /** The first key in iteration order. */
    firstKey(): K | undefined {
        return this.keys().next().value;
    }

    find(fn: Predicate<K, V, this>): V | undefined {
        for (const [key, value] of this) {
            if (fn(value, key, this)) return value;
        }
        return undefined;
    }

    findKey(fn: Predicate<K, V, this>): K | undefined {
        for (const [key, value] of this) {
            if (fn(value, key, this)) return key;
        }
        return undefined;
    }

    /** Returns a new plain Collection holding the matching entries. */
    filter(fn: Predicate<K, V, this>): Collection<K, V> {
        const out = new Collection<K, V>();
        for (const [key, value] of this) {
            if (fn(value, key, this)) out.set(key, value);
        }
        return out;
    }

    map<T>(fn: (value: V, key: K, collection: this) => T): T[] {
        const out = new Array<T>(this.size);
        let i = 0;
        for (const [key, value] of this) out[i++] = fn(value, key, this);
        return out;
    }

    some(fn: Predicate<K, V, this>): boolean {
        for (const [key, value] of this) {
            if (fn(value, key, this)) return true;
        }
        return false;
    }

    every(fn: Predicate<K, V, this>): boolean {
        for (const [key, value] of this) {
            if (!fn(value, key, this)) return false;
        }
        return true;
    }

    reduce<T>(fn: (acc: T, value: V, key: K, collection: this) => T, initial: T): T {
        let acc = initial;
        for (const [key, value] of this) acc = fn(acc, value, key, this);
        return acc;
    }

    /** Deletes every entry matching `fn`. Returns how many were removed. */
    sweep(fn: Predicate<K, V, this>): number {
        let removed = 0;
        for (const [key, value] of this) {
            if (fn(value, key, this) && this.delete(key)) removed++;
        }
        return removed;
    }

    toArray(): V[] {
        return [...this.values()];
    }
}
