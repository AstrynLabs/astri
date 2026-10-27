import type { APIUser } from './user';

/** A guild soundboard sound, or one of Discord's default sounds. */
export interface APISoundboardSound {
    sound_id: string;
    name: string;
    /** From 0 to 1. */
    volume: number;
    emoji_id: string | null;
    /** Unicode emoji, or the name of the custom emoji in `emoji_id`. */
    emoji_name: string | null;
    /** Absent for default sounds. */
    guild_id?: string;
    /** `false` once the guild lost the boosts it needed. */
    available: boolean;
    /** Who uploaded it. Only present with the create or manage expressions permission. */
    user?: APIUser;
}
