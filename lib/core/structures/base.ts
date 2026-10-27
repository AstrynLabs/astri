import type { ClientContext } from '../../types';
import { snowflakeTimestamp } from '../cache';

/**
 * Common ground for every Discord object the library models.
 *
 * Structures are updated in place as dispatches arrive, so a reference held by user code always shows the
 * latest state. Update events pass a {@link Base.clone} taken beforehand as the previous state.
 */
export abstract class Base {
    readonly client: ClientContext;
    readonly id: string;

    constructor(client: ClientContext, id: string) {
        this.client = client;
        this.id = id;
    }

    /** Creation time in Unix milliseconds, read from the id. */
    get createdAt(): number {
        return snowflakeTimestamp(this.id);
    }

    /** A shallow copy. Nested caches and arrays are shared with the original. */
    clone(): this {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
