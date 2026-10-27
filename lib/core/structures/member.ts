import type { APIGuildMember, BanOptions, ClientContext, MemberEditData } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { Permission } from './permission';
import { upsertUser, type User } from './user';
import { computeGuildPermissions, parseTimestamp } from './util';

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

    /** Whether the member is timed out right now. */
    get timedOut(): boolean {
        return this.communicationDisabledUntil !== null && this.communicationDisabledUntil > Date.now();
    }

    /**
     * The member's permissions across the guild, from `@everyone` and their roles. Channel overwrites are not applied;
     * use {@link GuildChannel.permissionsOf} for those.
     *
     * @throws When the guild is not cached.
     */
    get permissions(): Permission {
        const guild = this.guild;
        if (guild === undefined) throw new Error(`Guild ${this.guildId} is not cached`);
        return new Permission(computeGuildPermissions(guild, this));
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

    /** Each field needs its own permission: manage nicknames, manage roles, mute or deafen members, move members, or moderate members. */
    async edit(data: MemberEditData, reason?: string): Promise<this> {
        const member = await this.client.rest.patch('guildMember', this.guildId, this.id, data, reason);
        if (member !== undefined) this.patch(member as APIGuildMember);
        return this;
    }

    /** `null` resets it. The client's own nickname needs change nickname; anyone else's needs manage nicknames. */
    async setNickname(nick: string | null, reason?: string): Promise<this> {
        if (this.id !== this.client.user?.id) return this.edit({ nick }, reason);
        this.patch((await this.client.rest.patch('guildCurrentMember', this.guildId, { nick }, reason)) as APIGuildMember);
        return this;
    }

    /** Times the member out until `until` (Unix ms or a date, at most 28 days away), or lifts it with `null`. Needs the moderate members permission. */
    timeout(until: number | Date | null, reason?: string): Promise<this> {
        return this.edit({ communication_disabled_until: until === null ? null : new Date(until).toISOString() }, reason);
    }

    /** Needs the manage roles permission, and the role must be below the client's highest role. */
    async addRole(roleId: string, reason?: string): Promise<void> {
        await this.client.rest.put('guildMemberRole', this.guildId, this.id, roleId, reason);
    }

    /** Needs the manage roles permission, and the role must be below the client's highest role. */
    async removeRole(roleId: string, reason?: string): Promise<void> {
        await this.client.rest.delete('guildMemberRole', this.guildId, this.id, roleId, reason);
    }

    /** Needs the kick members permission. */
    async kick(reason?: string): Promise<void> {
        await this.client.rest.delete('guildMember', this.guildId, this.id, reason);
    }

    /** Needs the ban members permission. */
    async ban(options: BanOptions = {}, reason?: string): Promise<void> {
        await this.client.rest.put('guildBan', this.guildId, this.id, options, reason);
    }
}

/** The cached member for `data.user.id` patched with `data`, or a new one, cached if its guild is. */
export function upsertMember(client: ClientContext, data: Partial<APIGuildMember> & Pick<APIGuildMember, 'user'>, guildId: string): Member {
    const members = client.guilds.get(guildId)?.members;
    const cached = members?.get(data.user.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new Member(client, data, guildId);
    members?.set(created.id, created);
    return created;
}
