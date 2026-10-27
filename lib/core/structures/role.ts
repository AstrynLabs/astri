import type { APIRole, ClientContext, RoleEditData } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { Permission } from './permission';

export class Role extends Base {
    readonly guildId: string;
    name: string;
    color: number;
    hoist: boolean;
    icon: string | null = null;
    unicodeEmoji: string | null = null;
    position: number;
    permissions: Permission;
    managed: boolean;
    mentionable: boolean;
    flags: number;

    constructor(client: ClientContext, data: APIRole, guildId: string) {
        super(client, data.id);
        this.guildId = guildId;
        this.patch(data);
    }

    /** The guild this role belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIRole>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.color !== undefined) this.color = data.color;
        if (data.hoist !== undefined) this.hoist = data.hoist;
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.unicode_emoji !== undefined) this.unicodeEmoji = data.unicode_emoji;
        if (data.position !== undefined) this.position = data.position;
        if (data.permissions !== undefined) this.permissions = new Permission(data.permissions);
        if (data.managed !== undefined) this.managed = data.managed;
        if (data.mentionable !== undefined) this.mentionable = data.mentionable;
        if (data.flags !== undefined) this.flags = data.flags;
    }

    /** Needs the manage roles permission, and the role must be below the client's highest role. */
    async edit(data: RoleEditData, reason?: string): Promise<this> {
        this.patch((await this.client.rest.patch('guildRole', this.guildId, this.id, data, reason)) as APIRole);
        return this;
    }

    /** Needs the manage roles permission, and the role must be below the client's highest role. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('guildRole', this.guildId, this.id, reason);
    }
}

/** The guild's cached role for `data.id` patched with `data`, or a new one, cached if its guild is. */
export function upsertRole(client: ClientContext, data: APIRole, guildId: string): Role {
    const roles = client.guilds.get(guildId)?.roles;
    const cached = roles?.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new Role(client, data, guildId);
    roles?.set(created.id, created);
    return created;
}
