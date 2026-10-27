import { DISCORD_EPOCH } from '../../constants';

/** Creation time, in Unix milliseconds, encoded in a Discord snowflake. */
export function snowflakeTimestamp(id: string | bigint): number {
    return Number(BigInt(id) >> 22n) + DISCORD_EPOCH;
}

/**
 * A `sweepFilter` matching entries whose snowflake key was created more than `ms` ago.
 * Handy for messages: age comes from the ID itself, not from when it was cached.
 */
export function olderThan(ms: number): (value: unknown, key: string) => boolean {
    return (_value, key) => snowflakeTimestamp(key) < Date.now() - ms;
}
