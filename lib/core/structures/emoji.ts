import type { APIGuildEmoji, ClientContext, EmojiEditData } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { upsertUser, type User } from './user';

/** A guild's custom emoji. */
export class Emoji extends Base {
    readonly guildId: string;
    name: string;
    /** Role ids allowed to use the emoji. Empty means everyone can. */
    roles: string[] = [];
    /** Who uploaded it. Only known with the manage expressions permission. */
    user: User | null = null;
    requireColons = true;
    managed = false;
    animated = false;
    available = true;

    constructor(client: ClientContext, data: APIGuildEmoji, guildId: string) {
        super(client, data.id);
        this.guildId = guildId;
        this.patch(data);
    }

    /** The guild this emoji belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIGuildEmoji>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.roles !== undefined) this.roles = data.roles;
        if (data.user !== undefined) this.user = upsertUser(this.client, data.user);
        if (data.require_colons !== undefined) this.requireColons = data.require_colons;
        if (data.managed !== undefined) this.managed = data.managed;
        if (data.animated !== undefined) this.animated = data.animated;
        if (data.available !== undefined) this.available = data.available;
    }

    /** Needs the manage expressions permission, or create expressions for emojis the client uploaded. */
    async edit(data: EmojiEditData, reason?: string): Promise<this> {
        this.patch((await this.client.rest.patch('guildEmoji', this.guildId, this.id, data, reason)) as APIGuildEmoji);
        return this;
    }

    /** Needs the manage expressions permission, or create expressions for emojis the client uploaded. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('guildEmoji', this.guildId, this.id, reason);
    }
}

/** The guild's cached emoji for `data.id` patched with `data`, or a new one, cached if its guild is. */
export function upsertEmoji(client: ClientContext, data: APIGuildEmoji, guildId: string): Emoji {
    const emojis = client.guilds.get(guildId)?.emojis;
    const cached = emojis?.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new Emoji(client, data, guildId);
    emojis?.set(created.id, created);
    return created;
}
