import type { ApplicationCommand, AutoModerationRule, GuildAuditLogEntry, GuildIntegration, GuildScheduledEvent, ThreadChannel, User, Webhook } from '../core/structures';

/** One field an audit logged action changed. Values are raw API values, keyed by the API's field name. */
export interface AuditLogChange {
    key: string;
    /** `undefined` when the field was removed. */
    newValue: unknown;
    /** `undefined` when the field was added. */
    oldValue: unknown;
}

/** A page of a guild's audit log, with the objects its entries refer to. */
export interface GuildAuditLog {
    entries: GuildAuditLogEntry[];
    /** Users the entries refer to, cached as they are read. */
    users: User[];
    integrations: GuildIntegration[];
    webhooks: Webhook[];
    /** Threads the entries refer to, cached if their guild is. */
    threads: ThreadChannel[];
    scheduledEvents: GuildScheduledEvent[];
    autoModerationRules: AutoModerationRule[];
    applicationCommands: ApplicationCommand[];
}
