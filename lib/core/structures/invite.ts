import type { InviteTargetTypes, InviteTypes } from '../../constants';
import type { InviteChannel, InviteGuild } from '../../interfaces';
import type { APIInvite, ClientContext } from '../../types';
import type { Channel } from './channels';
import type { Guild } from './guild';
import { upsertScheduledEvent, type GuildScheduledEvent } from './scheduledEvent';
import { upsertUser, type User } from './user';
import { parseTimestamp, toInviteGuild } from './util';

/**
 * An invite to a guild, group DM or friend list. Invites are keyed by `code` rather than a snowflake, so unlike other
 * structures they have no `id`.
 *
 * Usage fields (`uses`, `maxUses`, `maxAge`, `temporary`, `createdAt`) are only known for invites from the gateway,
 * or fetched by someone who can manage the guild or channel.
 */
export class Invite {
    readonly client: ClientContext;
    readonly code: string;
    readonly type: InviteTypes;
    /** `null` for group DM and friend invites. */
    readonly guildId: string | null;
    readonly channelId: string | null;
    /** What the invite says about its guild, which may not be cached. Not sent with gateway invites. */
    partialGuild: InviteGuild | null = null;
    /** What the invite says about its channel, which may not be cached. Not sent with gateway invites. */
    partialChannel: InviteChannel | null = null;
    inviter: User | null = null;
    targetType: InviteTargetTypes | null = null;
    /** Stream invites only: whose stream it opens. */
    targetUser: User | null = null;
    /** Embedded application invites only. */
    targetApplicationId: string | null = null;
    /** Only sent when requested. */
    approximateMemberCount: number | null = null;
    /** Only sent when requested. */
    approximatePresenceCount: number | null = null;
    /** Unix ms the invite expires, or `null` if it never does or is not known. */
    expiresAt: number | null = null;
    /** The event the invite points to, when requested with its id. */
    scheduledEvent: GuildScheduledEvent | null = null;
    flags = 0;
    uses: number | null = null;
    /** `0` means unlimited. */
    maxUses: number | null = null;
    /** Seconds the invite is valid for after creation. `0` means forever. */
    maxAge: number | null = null;
    /** Whether members who joined through it are kicked when they disconnect, unless given a role. */
    temporary: boolean | null = null;
    /** Unix ms. */
    createdAt: number | null = null;

    constructor(client: ClientContext, data: APIInvite) {
        this.client = client;
        this.code = data.code;
        this.type = data.type ?? 0;
        this.guildId = data.guild_id ?? data.guild?.id ?? null;
        this.channelId = data.channel_id ?? data.channel?.id ?? null;
        this.patch(data);
    }

    /** The link that opens the invite. */
    get url(): string {
        return `https://discord.gg/${this.code}`;
    }

    /** The guild the invite is for, if cached. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** The channel the invite opens, if cached. */
    get channel(): Channel | undefined {
        return this.channelId === null ? undefined : this.guild?.channels.get(this.channelId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIInvite>): void {
        if (data.guild !== undefined) this.partialGuild = toInviteGuild(data.guild);
        if (data.channel !== undefined) this.partialChannel = data.channel === null ? null : { id: data.channel.id, type: data.channel.type, name: data.channel.name };
        if (data.inviter !== undefined) this.inviter = upsertUser(this.client, data.inviter);
        if (data.target_type !== undefined) this.targetType = data.target_type;
        if (data.target_user !== undefined) this.targetUser = upsertUser(this.client, data.target_user);
        if (data.target_application !== undefined) this.targetApplicationId = data.target_application.id;
        if (data.approximate_member_count !== undefined) this.approximateMemberCount = data.approximate_member_count;
        if (data.approximate_presence_count !== undefined) this.approximatePresenceCount = data.approximate_presence_count;
        if (data.expires_at !== undefined) this.expiresAt = parseTimestamp(data.expires_at);
        if (data.guild_scheduled_event !== undefined) this.scheduledEvent = upsertScheduledEvent(this.client, data.guild_scheduled_event);
        if (data.flags !== undefined) this.flags = data.flags;
        if (data.uses !== undefined) this.uses = data.uses;
        if (data.max_uses !== undefined) this.maxUses = data.max_uses;
        if (data.max_age !== undefined) this.maxAge = data.max_age;
        if (data.temporary !== undefined) this.temporary = data.temporary;
        if (data.created_at !== undefined) this.createdAt = Date.parse(data.created_at);
    }

    /** Needs the manage channels permission in the invite's channel, or manage guild for any of the guild's invites. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('invite', this.code, reason);
    }
}

/** The cached invite for `data.code` patched with `data`, or a new one, cached if its guild is. */
export function upsertInvite(client: ClientContext, data: APIInvite): Invite {
    const guildId = data.guild_id ?? data.guild?.id;
    const invites = guildId === undefined ? undefined : client.guilds.get(guildId)?.invites;
    const cached = invites?.get(data.code);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new Invite(client, data);
    invites?.set(created.code, created);
    return created;
}
