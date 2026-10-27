/** One field an audit logged action changed. Values are raw API values, keyed by the API's field name. */
export interface AuditLogChange {
    key: string;
    /** `undefined` when the field was removed. */
    newValue: unknown;
    /** `undefined` when the field was added. */
    oldValue: unknown;
}

/** An administrative action taken in a guild. */
export interface AuditLogEntry {
    id: string;
    guildId: string;
    /** One of {@link AuditLogEvents}, or a newer action. */
    actionType: number;
    /** Who took the action, or `null` for actions Discord took. */
    userId: string | null;
    /** What the action was taken on: a user, channel, role or other object depending on `actionType`. */
    targetId: string | null;
    changes: AuditLogChange[];
    /** Extra details some action types carry, such as a pruned member count or the channel of a deleted message. */
    options: Record<string, string>;
    reason: string | null;
}
