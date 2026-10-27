import type { APISoundboardSound, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { upsertUser, type User } from './user';

/** A guild soundboard sound, or one of Discord's default sounds. */
export class SoundboardSound extends Base {
    /** `null` for default sounds. */
    readonly guildId: string | null;
    name: string;
    /** From 0 to 1. */
    volume = 1;
    emojiId: string | null = null;
    /** Unicode emoji, or the name of the custom emoji in `emojiId`. */
    emojiName: string | null = null;
    /** `false` once the guild lost the boosts it needed. */
    available = true;
    /** Who uploaded it. Only known with the create or manage expressions permission. */
    user: User | null = null;

    constructor(client: ClientContext, data: APISoundboardSound) {
        super(client, data.sound_id);
        this.guildId = data.guild_id ?? null;
        this.patch(data);
    }

    /** The guild this sound belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APISoundboardSound>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.volume !== undefined) this.volume = data.volume;
        if (data.emoji_id !== undefined) this.emojiId = data.emoji_id;
        if (data.emoji_name !== undefined) this.emojiName = data.emoji_name;
        if (data.available !== undefined) this.available = data.available;
        if (data.user !== undefined) this.user = upsertUser(this.client, data.user);
    }
}

/** The guild's cached sound for `data.sound_id` patched with `data`, or a new one, cached if its guild is. */
export function upsertSoundboardSound(client: ClientContext, data: APISoundboardSound, guildId: string): SoundboardSound {
    const sounds = client.guilds.get(guildId)?.soundboardSounds;
    const cached = sounds?.get(data.sound_id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new SoundboardSound(client, { ...data, guild_id: guildId });
    sounds?.set(created.id, created);
    return created;
}
