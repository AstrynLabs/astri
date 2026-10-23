import type { APIGuildMember, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { upsertUser, type User } from './user';

/** A user's membership in one guild. Shares its `id` with the user. */
export class Member extends Base {
    readonly guildId: string;
    user: User;
    nick: string | null = null;
    /** Guild-specific avatar hash. */
    avatar: string | null = null;
    roles: string[] = [];
    /** Unix ms. `null` for guest members of voice channels. */
    joinedAt: number | null = null;
    /** Unix ms the member started boosting, or `null`. */
    premiumSince: number | null = null;
    deaf = false;
    mute = false;
    flags = 0;
    /** Has not passed membership screening yet. */
    pending = false;
    /** Unix ms the timeout ends, or `null` if not timed out. */
    communicationDisabledUntil: number | null = null;

    constructor(client: ClientContext, data: Partial<APIGuildMember> & Pick<APIGuildMember, 'user'>, guildId: string) {
        super(client, data.user.id);
        this.guildId = guildId;
        this.patch(data);
    }

    /** The guild this member belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** Nickname, falling back to the user's display name and then their username. */
    get displayName(): string {
        return this.nick ?? this.user.globalName ?? this.user.username;
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIGuildMember>): void {
        if (data.user !== undefined) this.user = upsertUser(this.client, data.user);
        if (data.nick !== undefined) this.nick = data.nick;
        if (data.avatar !== undefined) this.avatar = data.avatar;
        if (data.roles !== undefined) this.roles = data.roles;
        if (data.joined_at !== undefined) this.joinedAt = parseTimestamp(data.joined_at);
        if (data.premium_since !== undefined) this.premiumSince = parseTimestamp(data.premium_since);
        if (data.deaf !== undefined) this.deaf = data.deaf;
        if (data.mute !== undefined) this.mute = data.mute;
        if (data.flags !== undefined) this.flags = data.flags;
        if (data.pending !== undefined) this.pending = data.pending;
        if (data.communication_disabled_until !== undefined) this.communicationDisabledUntil = parseTimestamp(data.communication_disabled_until);
    }
}

function parseTimestamp(value: string | null): number | null {
    return value === null ? null : Date.parse(value);
}
