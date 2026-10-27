import type { StickerFormatTypes, StickerTypes } from '../../constants';
import type { APISticker, ClientContext, StickerEditData } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { upsertUser, type User } from './user';

/** A guild sticker, or one from an official pack. */
export class Sticker extends Base {
    readonly type: StickerTypes;
    /** `null` for standard stickers. */
    readonly guildId: string | null;
    name: string;
    description: string | null = null;
    /** Autocomplete keywords, comma separated. */
    tags = '';
    formatType: StickerFormatTypes | null = null;
    /** Guild stickers only. `false` once the guild lost the boosts it needed. */
    available = true;
    /** Guild stickers only: who uploaded it. Only known with the manage expressions permission. */
    user: User | null = null;
    /** Standard stickers only. */
    packId: string | null = null;
    /** Standard stickers only: where it is in its pack. */
    sortValue: number | null = null;

    constructor(client: ClientContext, data: APISticker) {
        super(client, data.id);
        this.type = data.type;
        this.guildId = data.guild_id ?? null;
        this.patch(data);
    }

    /** The guild this sticker belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APISticker>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.description !== undefined) this.description = data.description;
        if (data.tags !== undefined) this.tags = data.tags;
        if (data.format_type !== undefined) this.formatType = data.format_type;
        if (data.available !== undefined) this.available = data.available;
        if (data.user !== undefined) this.user = upsertUser(this.client, data.user);
        if (data.pack_id !== undefined) this.packId = data.pack_id;
        if (data.sort_value !== undefined) this.sortValue = data.sort_value;
    }

    /** Guild stickers only. Needs the manage expressions permission, or create expressions for stickers the client uploaded. */
    async edit(data: StickerEditData, reason?: string): Promise<this> {
        this.patch(await this.client.rest.patch('guildSticker', this.#guildId(), this.id, data, reason));
        return this;
    }

    /** Guild stickers only. Needs the manage expressions permission, or create expressions for stickers the client uploaded. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('guildSticker', this.#guildId(), this.id, reason);
    }

    #guildId(): string {
        if (this.guildId === null) throw new Error(`Sticker ${this.id} is a standard sticker and does not belong to a guild`);
        return this.guildId;
    }
}

/** The cached sticker for `data.id` patched with `data`, or a new one, cached if it is a guild sticker and its guild is cached. */
export function upsertSticker(client: ClientContext, data: APISticker): Sticker {
    const stickers = data.guild_id === undefined ? undefined : client.guilds.get(data.guild_id)?.stickers;
    const cached = stickers?.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new Sticker(client, data);
    stickers?.set(created.id, created);
    return created;
}
