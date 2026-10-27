import type { APIVoiceState, ClientContext } from '../../types';
import { Base } from './base';
import type { BaseGuildVoiceChannel } from './channels';
import type { Guild } from './guild';
import { upsertMember, type Member } from './member';
import type { User } from './user';
import { parseTimestamp } from './util';

/** A user's connection to a voice or stage channel in one guild. Shares its `id` with the user. */
export class VoiceState extends Base {
    readonly guildId: string;
    /** `null` once the user left. */
    channelId: string | null = null;
    sessionId: string;
    /** Deafened by the guild. */
    deaf = false;
    /** Muted by the guild. */
    mute = false;
    selfDeaf = false;
    selfMute = false;
    /** Whether the user is streaming with Go Live. */
    selfStream = false;
    selfVideo = false;
    /** Stage channels only: whether the user is in the audience rather than speaking. */
    suppress = false;
    /** Unix ms the user asked to speak, or `null`. */
    requestToSpeakTimestamp: number | null = null;

    constructor(client: ClientContext, data: APIVoiceState, guildId: string) {
        super(client, data.user_id);
        this.guildId = guildId;
        this.patch(data);
    }

    /** The guild, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** The voice or stage channel the user is in, if cached. */
    get channel(): BaseGuildVoiceChannel | undefined {
        return this.channelId === null ? undefined : (this.guild?.channels.get(this.channelId) as BaseGuildVoiceChannel | undefined);
    }

    /** The user's guild membership, if cached. */
    get member(): Member | undefined {
        return this.guild?.members.get(this.id);
    }

    /** The user, if cached. */
    get user(): User | undefined {
        return this.client.users.get(this.id);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. A `member` is cached on the guild. */
    patch(data: Partial<APIVoiceState>): void {
        if (data.channel_id !== undefined) this.channelId = data.channel_id;
        if (data.session_id !== undefined) this.sessionId = data.session_id;
        if (data.deaf !== undefined) this.deaf = data.deaf;
        if (data.mute !== undefined) this.mute = data.mute;
        if (data.self_deaf !== undefined) this.selfDeaf = data.self_deaf;
        if (data.self_mute !== undefined) this.selfMute = data.self_mute;
        if (data.self_stream !== undefined) this.selfStream = data.self_stream ?? false;
        if (data.self_video !== undefined) this.selfVideo = data.self_video;
        if (data.suppress !== undefined) this.suppress = data.suppress;
        if (data.request_to_speak_timestamp !== undefined) this.requestToSpeakTimestamp = parseTimestamp(data.request_to_speak_timestamp);
        if (data.member !== undefined) upsertMember(this.client, data.member, this.guildId);
    }

    /** Mutes or unmutes the user guild-wide. Needs the mute members permission. */
    async setMute(mute: boolean, reason?: string): Promise<void> {
        await this.client.rest.patch('guildMember', this.guildId, this.id, { mute }, reason);
    }

    /** Deafens or undeafens the user guild-wide. Needs the deafen members permission. */
    async setDeaf(deaf: boolean, reason?: string): Promise<void> {
        await this.client.rest.patch('guildMember', this.guildId, this.id, { deaf }, reason);
    }

    /** Moves the user to another voice channel. Needs the move members permission, and connect in the target channel. */
    async move(channelId: string, reason?: string): Promise<void> {
        await this.client.rest.patch('guildMember', this.guildId, this.id, { channel_id: channelId }, reason);
    }

    /** Disconnects the user from voice. Needs the move members permission. */
    async disconnect(reason?: string): Promise<void> {
        await this.client.rest.patch('guildMember', this.guildId, this.id, { channel_id: null }, reason);
    }

    /** Stage channels only: moves the user to the audience or lets them speak. Needs the mute members permission, unless suppressing the client itself. */
    async setSuppressed(suppress: boolean): Promise<void> {
        if (this.channelId === null) throw new Error(`User ${this.id} is not in a voice channel`);
        if (this.id === this.client.user?.id) await this.client.rest.patch('guildCurrentVoiceState', this.guildId, { channel_id: this.channelId, suppress });
        else await this.client.rest.patch('guildVoiceState', this.guildId, this.id, { channel_id: this.channelId, suppress });
    }

    /** Stage channels only: raises or lowers the client's own hand. Only works on the client's own voice state. */
    async requestToSpeak(request = true): Promise<void> {
        if (this.channelId === null) throw new Error(`User ${this.id} is not in a voice channel`);
        await this.client.rest.patch('guildCurrentVoiceState', this.guildId, { channel_id: this.channelId, request_to_speak_timestamp: request ? new Date().toISOString() : null });
    }
}

/**
 * The cached voice state for `data.user_id` patched with `data`, or a new one, cached if its guild is. A state
 * whose `channel_id` is `null` is dropped from the cache, since the user left voice.
 */
export function upsertVoiceState(client: ClientContext, data: APIVoiceState, guildId: string): VoiceState {
    const voiceStates = client.guilds.get(guildId)?.voiceStates;
    let state = voiceStates?.get(data.user_id);
    if (state !== undefined) state.patch(data);
    else state = new VoiceState(client, data, guildId);
    if (state.channelId === null) voiceStates?.delete(state.id);
    else voiceStates?.set(state.id, state);
    return state;
}
