import type { APIGuildMember } from './member';

/** A user's connection to a voice or stage channel. */
export interface APIVoiceState {
    /** Left out of the voice states inside `GUILD_CREATE`. */
    guild_id?: string | null;
    /** `null` once the user left. */
    channel_id: string | null;
    user_id: string;
    /** Guild voice states only. Left out inside `GUILD_CREATE`. */
    member?: APIGuildMember;
    session_id: string;
    /** Deafened by the guild. */
    deaf: boolean;
    /** Muted by the guild. */
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    /** Whether the user is streaming with Go Live. */
    self_stream?: boolean | null;
    self_video: boolean;
    /** Stage channels only: whether the user is in the audience rather than speaking. */
    suppress: boolean;
    /** ISO 8601 timestamp the user asked to speak, or `null`. */
    request_to_speak_timestamp: string | null;
}
