import type { AuditLogChange } from '../../interfaces';
import type { APIAuditLogEntry, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import type { User } from './user';
import { toAuditLogChanges } from './util';

/** An administrative action taken in a guild. */
export class GuildAuditLogEntry extends Base {
    readonly guildId: string;
    /** One of {@link AuditLogEvents}, or a newer action. */
    readonly actionType: number;
    /** Who took the action, or `null` for actions Discord took. */
    readonly userId: string | null;
    /** What the action was taken on: a user, channel, role or other object depending on `actionType`. */
    readonly targetId: string | null;
    readonly changes: AuditLogChange[];
    /** Extra details some action types carry, such as a pruned member count or the channel of a deleted message. */
    readonly options: Readonly<Record<string, string>>;
    readonly reason: string | null;

    constructor(client: ClientContext, data: APIAuditLogEntry, guildId: string) {
        super(client, data.id);
        this.guildId = guildId;
        this.actionType = data.action_type;
        this.userId = data.user_id;
        this.targetId = data.target_id;
        this.changes = toAuditLogChanges(data.changes);
        this.options = data.options ?? {};
        this.reason = data.reason ?? null;
    }

    /** The guild the action was taken in, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** Who took the action, if cached. */
    get user(): User | undefined {
        return this.userId === null ? undefined : this.client.users.get(this.userId);
    }
}
